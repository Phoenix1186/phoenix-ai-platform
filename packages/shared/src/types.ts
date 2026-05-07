import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  avatar: z.string().nullable(),
  tier: z.enum(["free", "pro", "enterprise"]),
  credits: z.number().default(0),
  apiKey: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const ConversationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  model: z.string(),
  provider: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  tokens: z.number().optional(),
  model: z.string().optional(),
  createdAt: z.date(),
});

export type Message = z.infer<typeof MessageSchema>;

export const ApiKeySchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  key: z.string(),
  prefix: z.string(),
  lastUsedAt: z.date().nullable(),
  createdAt: z.date(),
});

export type ApiKey = z.infer<typeof ApiKeySchema>;

export const PaymentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number(),
  credits: z.number(),
  status: z.enum(["pending", "success", "failed"]),
  reference: z.string(),
  provider: z.enum(["paystack"]),
  metadata: z.record(z.any()).nullable(),
  createdAt: z.date(),
});

export type Payment = z.infer<typeof PaymentSchema>;

export const ChatCompletionRequestSchema = z.object({
  model: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  max_tokens: z.number().optional(),
  stream: z.boolean().optional().default(false),
  top_p: z.number().optional(),
  frequency_penalty: z.number().optional(),
  presence_penalty: z.number().optional(),
});

export type ChatCompletionRequest = z.infer<typeof ChatCompletionRequestSchema>;

export const ChatCompletionResponseSchema = z.object({
  id: z.string(),
  object: z.literal("chat.completion"),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.enum(["assistant"]),
        content: z.string(),
      }),
      finish_reason: z.string().nullable(),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

export type ChatCompletionResponse = z.infer<typeof ChatCompletionResponseSchema>;

export const StreamChunkSchema = z.object({
  id: z.string(),
  object: z.literal("chat.completion.chunk"),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      delta: z.object({
        role: z.enum(["assistant"]).optional(),
        content: z.string().optional(),
      }),
      finish_reason: z.string().nullable(),
    })
  ),
});

export type StreamChunk = z.infer<typeof StreamChunkSchema>;
