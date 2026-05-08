import { Hono } from "hono";
import { stream } from "hono/streaming";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@phoenix/database";
import { users, conversations, messages, apiKeys, payments, usageLogs } from "@phoenix/database";
import { lucia } from "../auth";
import { generateId, estimateTokens } from "@phoenix/shared";
import { LLMService, SELF_HOSTED_MODELS, TOKEN_COSTS } from "../services/llm";
import { PaystackService } from "../services/paystack";

const apiV1 = new Hono<{ Variables: ContextVariables }>();

// Auth middleware
import { User, Session } from "lucia";

type ContextVariables = {
  user: User;
  session: Session;
  apiKeyId?: string;
};

const authMiddleware = async (c: any, next: any) => {
  const sessionId = lucia.readSessionCookie(c.req.header("cookie") || "");
  if (!sessionId) return c.json({ error: "Unauthorized" }, 401);

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session || !user) return c.json({ error: "Unauthorized" }, 401);

  c.set("user", user as User);
  c.set("session", session as Session);
  return next();
};

// API Key middleware
const apiKeyMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header("Authorization") || "";
  const apiKey = authHeader.replace("Bearer ", "").trim();

  if (!apiKey || !apiKey.startsWith("phx_")) {
    return c.json({ error: "Invalid API key" }, 401);
  }

  const keyRecord = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.key, apiKey), eq(apiKeys.isActive, true)),
    with: { user: true },
  });

  if (!keyRecord || !keyRecord.user) return c.json({ error: "Invalid API key" }, 401);

  c.set("user", keyRecord.user as User);
  c.set("apiKeyId", keyRecord.id);

  await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, keyRecord.id));
  return next();
};

// ============ HEALTH & MODELS ============
apiV1.get("/health", async (c) => {
  const llm = new LLMService();
  const ollamaHealthy = await llm.checkHealth();
  return c.json({ 
    status: "ok", 
    ollama: ollamaHealthy ? "connected" : "disconnected",
    timestamp: new Date().toISOString() 
  });
});

apiV1.get("/models", async (c) => {
  const llm = new LLMService();
  const installedModels = await llm.listModels();

  const models = SELF_HOSTED_MODELS.map(m => {
    const installed = installedModels.find((im: any) => im.name.includes(m.id));
    return {
      id: m.id,
      object: "model",
      created: 1677610602,
      owned_by: "phoenix",
      name: m.name,
      description: m.description,
      size: m.size,
      tags: m.tags,
      installed: !!installed,
    };
  });

  return c.json({ object: "list", data: models });
});

apiV1.post("/models/pull", authMiddleware, zValidator("json", z.object({
  model: z.string(),
})), async (c) => {
  const { model } = c.req.valid("json");
  const llm = new LLMService();

  try {
    await llm.pullModel(model);
    return c.json({ success: true, message: `Model ${model} pulled successfully` });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============ USER ============
apiV1.get("/user", authMiddleware, async (c) => {
  const user = c.get("user") as User;
  return c.json({ user });
});

apiV1.get("/user/stats", authMiddleware, async (c) => {
  const user = c.get("user") as User;
  const totalRequests = await db.select({ count: sql<number>`count(*)` }).from(usageLogs).where(eq(usageLogs.userId, user.id));
  const totalTokens = await db.select({ sum: sql<number>`sum(total_tokens)` }).from(usageLogs).where(eq(usageLogs.userId, user.id));
  const recentUsage = await db.select().from(usageLogs).where(eq(usageLogs.userId, user.id)).orderBy(desc(usageLogs.createdAt)).limit(10);

  return c.json({
    totalRequests: totalRequests[0]?.count || 0,
    totalTokens: totalTokens[0]?.sum || 0,
    recentUsage,
  });
});

// ============ API KEYS ============
apiV1.get("/keys", authMiddleware, async (c) => {
  const user = c.get("user") as User;
  const keys = await db.select().from(apiKeys).where(eq(apiKeys.userId, user.id)).orderBy(desc(apiKeys.createdAt));
  return c.json({ keys });
});

apiV1.post("/keys", authMiddleware, zValidator("json", z.object({
  name: z.string().min(1).max(100),
})), async (c) => {
  const user = c.get("user") as User;
  const { name } = c.req.valid("json");

  const key = generateId().replace(/-/g, "");
  const fullKey = `phx_${key}`;

  await db.insert(apiKeys).values({
    id: generateId(),
    userId: user.id,
    name,
    key: fullKey,
    prefix: fullKey.slice(0, 10),
  });

  return c.json({ key: fullKey, message: "Save this key - it won't be shown again" });
});

apiV1.delete("/keys/:id", authMiddleware, async (c) => {
  const user = c.get("user") as User;
  const keyId = c.req.param("id");
  await db.delete(apiKeys).where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, user.id)));
  return c.json({ success: true });
});

// ============ CONVERSATIONS ============
apiV1.get("/conversations", authMiddleware, async (c) => {
  const user = c.get("user") as User;
  const convs = await db.select().from(conversations)
    .where(eq(conversations.userId, user.id))
    .orderBy(desc(conversations.updatedAt));
  return c.json({ conversations: convs });
});

apiV1.post("/conversations", authMiddleware, zValidator("json", z.object({
  title: z.string().optional(),
  model: z.string(),
})), async (c) => {
  const user = c.get("user") as User;
  const { title, model } = c.req.valid("json");

  const convId = generateId();
  await db.insert(conversations).values({
    id: convId,
    userId: user.id,
    title: title || "New Chat",
    model,
    provider: "phoenix",
  });

  return c.json({ id: convId });
});

apiV1.get("/conversations/:id", authMiddleware, async (c) => {
  const user = c.get("user") as User;
  const convId = c.req.param("id");

  const conv = await db.query.conversations.findFirst({
    where: and(eq(conversations.id, convId), eq(conversations.userId, user.id)),
  });

  if (!conv) return c.json({ error: "Not found" }, 404);

  const msgs = await db.select().from(messages)
    .where(eq(messages.conversationId, convId))
    .orderBy(messages.createdAt);

  return c.json({ conversation: conv, messages: msgs });
});

apiV1.delete("/conversations/:id", authMiddleware, async (c) => {
  const user = c.get("user") as User;
  const convId = c.req.param("id");
  await db.delete(conversations).where(and(eq(conversations.id, convId), eq(conversations.userId, user.id)));
  return c.json({ success: true });
});

apiV1.patch("/conversations/:id", authMiddleware, zValidator("json", z.object({
  title: z.string().optional(),
  isPinned: z.boolean().optional(),
})), async (c) => {
  const user = c.get("user") as User;
  const convId = c.req.param("id");
  const data = c.req.valid("json");

  await db.update(conversations)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(conversations.id, convId), eq(conversations.userId, user.id)));

  return c.json({ success: true });
});

// ============ MESSAGES ============
apiV1.post("/conversations/:id/messages", authMiddleware, zValidator("json", z.object({
  content: z.string().min(1),
})), async (c) => {
  const user = c.get("user") as User;
  const convId = c.req.param("id");
  const { content } = c.req.valid("json");

  const conv = await db.query.conversations.findFirst({
    where: and(eq(conversations.id, convId), eq(conversations.userId, user.id)),
  });
  if (!conv) return c.json({ error: "Not found" }, 404);

  if (user.credits <= 0 && user.tier === "free") {
    return c.json({ error: "Insufficient credits. Please upgrade or buy credits." }, 402);
  }

  const userMsgId = generateId();
  await db.insert(messages).values({
    id: userMsgId,
    conversationId: convId,
    role: "user",
    content,
    tokens: estimateTokens(content),
  });

  const history = await db.select().from(messages)
    .where(eq(messages.conversationId, convId))
    .orderBy(messages.createdAt);

  const llmService = new LLMService();
    const startTime = Date.now();

    try {
      const chatResult = await llmService.chat(conv.model, history, {
        temperature: 0.7,
      });

      if (!chatResult || !('usage' in chatResult)) {
        throw new Error("Failed to generate response");
      }

      const latency = Date.now() - startTime;

      const assistantTokens = chatResult.usage.completion_tokens || estimateTokens(chatResult.content);
      const totalTokens = chatResult.usage.total_tokens || (estimateTokens(content) + assistantTokens);
      const creditsUsed = Math.ceil(totalTokens * (TOKEN_COSTS[conv.model]?.output || 0.2));

      const assistantMsgId = generateId();
      await db.insert(messages).values({
        id: assistantMsgId,
        conversationId: convId,
        role: "assistant",
        content: chatResult.content,
        tokens: assistantTokens,
        model: conv.model,
      });

    await db.update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, convId));

    if (user.tier === "free") {
      await db.update(users)
        .set({ credits: sql`${users.credits} - ${creditsUsed}` })
        .where(eq(users.id, user.id));
    }

    await db.insert(usageLogs).values({
      userId: user.id,
      model: conv.model,
      provider: "phoenix",
      promptTokens: chatResult.usage.prompt_tokens || estimateTokens(content),
      completionTokens: assistantTokens,
      totalTokens,
      creditsUsed,
      latency,
      status: "success",
    });

    return c.json({
      message: {
        id: assistantMsgId,
        role: "assistant",
        content: chatResult.content,
        model: conv.model,
      },
      usage: {
        promptTokens: chatResult.usage.prompt_tokens || estimateTokens(content),
        completionTokens: assistantTokens,
        totalTokens,
        creditsUsed,
      },
    });
  } catch (error: any) {
    await db.insert(usageLogs).values({
      userId: user.id,
      model: conv.model,
      provider: "phoenix",
      promptTokens: estimateTokens(content),
      completionTokens: 0,
      totalTokens: estimateTokens(content),
      creditsUsed: 0,
      status: "error",
      errorMessage: error.message,
    });

    return c.json({ error: "Failed to generate response", message: error.message }, 500);
  }
});

// ============ CHAT COMPLETIONS (OpenAI-compatible) ============
apiV1.post("/chat/completions", apiKeyMiddleware, zValidator("json", z.object({
  model: z.string(),
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
  })),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  max_tokens: z.number().optional(),
  stream: z.boolean().optional().default(false),
  top_p: z.number().optional(),
  frequency_penalty: z.number().optional(),
  presence_penalty: z.number().optional(),
})), async (c) => {
  const user = c.get("user") as User;
  const body = c.req.valid("json");
  const apiKeyId = c.get("apiKeyId");

  if (user.credits <= 0 && user.tier === "free") {
    return c.json({ error: { message: "Insufficient credits", type: "insufficient_credits" } }, 402);
  }

  const model = body.model;
  const llmService = new LLMService();
  const startTime = Date.now();

  try {
    if (body.stream) {
      c.header("Content-Type", "text/event-stream");
      c.header("Cache-Control", "no-cache");
      c.header("Connection", "keep-alive");

      const streamBody = await llmService.streamChat(model, body.messages, {
        temperature: body.temperature,
        maxTokens: body.max_tokens,
      });

      if (!streamBody) {
        return c.json({ error: "Stream failed" }, 500);
      }

      return stream(c, async (stream) => {
        const reader = (streamBody as ReadableStream).getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter(line => line.trim());

            for (const line of lines) {
              try {
                const data = JSON.parse(line);
                if (data.message?.content) {
                  fullContent += data.message.content;
                  const sseData = {
                    id: `chatcmpl-${generateId()}`,
                    object: "chat.completion.chunk",
                    created: Math.floor(Date.now() / 1000),
                    model,
                    choices: [{
                      index: 0,
                      delta: { content: data.message.content },
                      finish_reason: data.done ? "stop" : null,
                    }],
                  };
                  await stream.write(`data: ${JSON.stringify(sseData)}\n\n`);
                }
              } catch {
                // Skip invalid JSON lines
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        await stream.write("data: [DONE]\n\n");

        // Log usage after stream completes
        const promptTokens = body.messages.reduce((acc, m) => acc + estimateTokens(m.content), 0);
        const completionTokens = estimateTokens(fullContent);
        const totalTokens = promptTokens + completionTokens;
        const creditsUsed = Math.ceil(totalTokens * (TOKEN_COSTS[model]?.output || 0.2));

        if (user.tier === "free") {
          await db.update(users)
            .set({ credits: sql`${users.credits} - ${creditsUsed}` })
            .where(eq(users.id, user.id));
        }

        await db.insert(usageLogs).values({
          userId: user.id,
          apiKeyId: apiKeyId || null,
          model,
          provider: "phoenix",
          promptTokens,
          completionTokens,
          totalTokens,
          creditsUsed,
          latency: Date.now() - startTime,
          status: "success",
        });
      });
    }

    const chatResult = await llmService.chat(model, body.messages, {
      temperature: body.temperature,
      maxTokens: body.max_tokens,
    });

    if (!chatResult || !('usage' in chatResult)) {
      return c.json({ error: "Failed to generate response" }, 500);
    }

    const latency = Date.now() - startTime;
    const promptTokens = chatResult.usage.prompt_tokens || body.messages.reduce((acc, m) => acc + (m.content ? estimateTokens(m.content) : 0), 0);
    const completionTokens = chatResult.usage.completion_tokens || estimateTokens(chatResult.content);
    const totalTokens = chatResult.usage.total_tokens || (promptTokens + completionTokens);
    const creditsUsed = Math.ceil(totalTokens * (TOKEN_COSTS[model]?.output || 0.2));

    if (user.tier === "free") {
      await db.update(users)
        .set({ credits: sql`${users.credits} - ${creditsUsed}` })
        .where(eq(users.id, user.id));
    }

    await db.insert(usageLogs).values({
      userId: user.id,
      apiKeyId: apiKeyId || null,
      model,
      provider: "phoenix",
      promptTokens,
      completionTokens,
      totalTokens,
      creditsUsed,
      latency,
      status: "success",
    });

    return c.json({
      id: `chatcmpl-${generateId()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: body.model,
      choices: [{
        index: 0,
        message: { role: "assistant", content: chatResult.content },
        finish_reason: "stop",
      }],
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
      },
    });
  } catch (error: any) {
    await db.insert(usageLogs).values({
      userId: user.id,
      apiKeyId: apiKeyId || null,
      model,
      provider: "phoenix",
      promptTokens: body.messages.reduce((acc, m) => acc + (m.content ? estimateTokens(m.content) : 0), 0),
      completionTokens: 0,
      totalTokens: 0,
      creditsUsed: 0,
      status: "error",
      errorMessage: error.message,
    });

    return c.json({ error: { message: error.message, type: "api_error" } }, 500);
  }
});

// ============ EMBEDDINGS ============
apiV1.post("/embeddings", apiKeyMiddleware, zValidator("json", z.object({
  model: z.string().optional().default("nomic-embed-text"),
  input: z.string().or(z.array(z.string())),
})), async (c) => {
  const body = c.req.valid("json");
  const llmService = new LLMService();

  try {
    const inputs = Array.isArray(body.input) ? body.input : [body.input];
    const embeddings = await Promise.all(
      inputs.map(input => llmService.embeddings(body.model, input))
    );

    return c.json({
      object: "list",
      data: embeddings.map((embedding, i) => ({
        object: "embedding",
        index: i,
        embedding,
      })),
      model: body.model,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============ PAYMENTS ============
apiV1.post("/payments/initialize", authMiddleware, zValidator("json", z.object({
  packageId: z.string(),
})), async (c) => {
  const user = c.get("user") as User;
  const { packageId } = c.req.valid("json");

  const { CREDIT_PACKAGES } = await import("@phoenix/shared");
  const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
  if (!pkg) return c.json({ error: "Invalid package" }, 400);

  const paystack = new PaystackService();
  const reference = `phx_${generateId().replace(/-/g, "")}`;

  await db.insert(payments).values({
    id: generateId(),
    userId: user.id,
    amount: pkg.price * 100,
    credits: pkg.credits,
    reference,
    status: "pending",
  });

  const init = await paystack.initializeTransaction({
    email: user.email,
    amount: pkg.price * 100,
    reference,
    metadata: { userId: user.id, packageId, credits: pkg.credits },
  });

  return c.json({ authorizationUrl: init.data.authorization_url, reference });
});

apiV1.get("/payments", authMiddleware, async (c) => {
  const user = c.get("user") as User;
  const pays = await db.select().from(payments)
    .where(eq(payments.userId, user.id))
    .orderBy(desc(payments.createdAt));
  return c.json({ payments: pays });
});

// ============ CREDITS ============
apiV1.get("/credits", authMiddleware, async (c) => {
  const user = c.get("user") as User;
  return c.json({ credits: user.credits, tier: user.tier });
});

export { apiV1 };
