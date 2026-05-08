import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { Lucia, TimeSpan } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Google } from "arctic";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@phoenix/database";
import { users, sessions } from "@phoenix/database";
import { generateId, generateApiKey } from "@phoenix/shared";

const adapter = new DrizzlePostgreSQLAdapter(db as any, sessions as any, users as any);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  },
  sessionExpiresIn: new TimeSpan(30, "d"),
  getUserAttributes: (attributes: any) => ({
    id: attributes.id,
    email: attributes.email,
    name: attributes.name,
    avatar: attributes.avatar,
    tier: attributes.tier,
    credits: attributes.credits,
  }),
});

// Initialize Google OAuth only if credentials are provided
let google: Google | null = null;
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  google = new Google(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.API_URL || "http://localhost:3001"}/auth/google/callback`
  );
}

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      id: string;
      email: string;
      name: string | null;
      avatar: string | null;
      tier: "free" | "pro" | "enterprise";
      credits: number;
    };
  }
}

const auth = new Hono();

// Get current user
auth.get("/me", async (c) => {
  const sessionId = lucia.readSessionCookie(c.req.header("cookie") || "");
  if (!sessionId) return c.json({ user: null }, 401);

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session) return c.json({ user: null }, 401);

  if (session.fresh) {
    c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), { append: true });
  }

  return c.json({ user });
});

// Google OAuth - Initiate (only if configured)
auth.get("/google", async (c) => {
  if (!google) {
    return c.json({ error: "Google OAuth not configured" }, 503);
  }
  const state = generateId();
  const codeVerifier = generateId();
  const url = await google.createAuthorizationURL(state, codeVerifier);

  setCookie(c, "google_oauth_state", state, { httpOnly: true, sameSite: "Lax", maxAge: 600 });
  setCookie(c, "google_code_verifier", codeVerifier, { httpOnly: true, sameSite: "Lax", maxAge: 600 });

  return c.redirect(url.toString());
});

// Google OAuth - Callback
auth.get("/google/callback", async (c) => {
  if (!google) {
    return c.json({ error: "Google OAuth not configured" }, 503);
  }
  const code = c.req.query("code");
  const state = c.req.query("state");
  const storedState = getCookie(c, "google_oauth_state");
  const storedCodeVerifier = getCookie(c, "google_code_verifier");

  if (!code || !state || !storedState || state !== storedState || !storedCodeVerifier) {
    return c.json({ error: "Invalid OAuth state" }, 400);
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
    const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
    const googleUser = await response.json();

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, googleUser.email),
    });

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      await db.update(users).set({
        name: googleUser.name || existingUser.name,
        avatar: googleUser.picture || existingUser.avatar,
        updatedAt: new Date(),
      }).where(eq(users.id, userId));
    } else {
      userId = generateId();
      await db.insert(users).values({
        id: userId,
        email: googleUser.email,
        name: googleUser.name || null,
        avatar: googleUser.picture || null,
        tier: "free",
        credits: 1000,
        apiKey: generateApiKey(),
        emailVerified: true,
      });
    }

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    c.header("Set-Cookie", sessionCookie.serialize(), { append: true });
    return c.redirect(`${process.env.APP_URL || "http://localhost:3000"}/chat`);
  } catch (e: any) {
    console.error("OAuth error:", e);
    return c.redirect(`${process.env.APP_URL || "http://localhost:3000"}/login?error=oauth_failed`);
  }
});

// Logout
auth.post("/logout", async (c) => {
  const sessionId = lucia.readSessionCookie(c.req.header("cookie") || "");
  if (sessionId) {
    await lucia.invalidateSession(sessionId);
  }
  c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize());
  return c.json({ success: true });
});

// Register with email/password
auth.post("/register", zValidator("json", z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
})), async (c) => {
  const { email, password, name } = c.req.valid("json");

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return c.json({ error: "Email already registered" }, 409);

  const userId = generateId();
  // TODO: Hash password with bcrypt in production
  const passwordHash = password;

  await db.insert(users).values({
    id: userId,
    email,
    name: name || null,
    tier: "free",
    credits: 1000,
    apiKey: generateApiKey(),
  });

  const session = await lucia.createSession(userId, {});
  c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize());

  return c.json({ success: true, userId });
});

// Login with email/password
auth.post("/login", zValidator("json", z.object({
  email: z.string().email(),
  password: z.string(),
})), async (c) => {
  const { email, password } = c.req.valid("json");

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) return c.json({ error: "Invalid credentials" }, 401);

  // TODO: Verify password hash
  // const valid = await verify(user.passwordHash, password);

  const session = await lucia.createSession(user.id, {});
  c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize());

  return c.json({ success: true });
});

export { auth };
