import { Hono } from "hono";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@phoenix/database";
import { users, usageLogs, payments, conversations } from "@phoenix/database";

const adminRoutes = new Hono();

// Simple admin auth - in production use proper admin middleware
const adminAuth = async (c: any, next: any) => {
  const adminKey = c.req.header("x-admin-key");
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return next();
};

adminRoutes.use("*", adminAuth);

adminRoutes.get("/dashboard", async (c) => {
  const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
  const totalConversations = await db.select({ count: sql<number>`count(*)` }).from(conversations);
  const totalRevenue = await db.select({ sum: sql<number>`sum(amount)` }).from(payments).where(eq(payments.status, "success"));
  const totalTokens = await db.select({ sum: sql<number>`sum(total_tokens)` }).from(usageLogs);

  const recentUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(10);
  const recentPayments = await db.select().from(payments).orderBy(desc(payments.createdAt)).limit(10);

  return c.json({
    stats: {
      totalUsers: totalUsers[0]?.count || 0,
      totalConversations: totalConversations[0]?.count || 0,
      totalRevenue: (totalRevenue[0]?.sum || 0) / 100, // convert from kobo
      totalTokens: totalTokens[0]?.sum || 0,
    },
    recentUsers,
    recentPayments,
  });
});

adminRoutes.get("/users", async (c) => {
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
  return c.json({ users: allUsers });
});

adminRoutes.get("/usage", async (c) => {
  const usage = await db.select().from(usageLogs).orderBy(desc(usageLogs.createdAt)).limit(100);
  return c.json({ usage });
});

adminRoutes.patch("/users/:id/tier", async (c) => {
  const userId = c.req.param("id");
  const body = await c.req.json();

  await db.update(users)
    .set({ tier: body.tier, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return c.json({ success: true });
});

export { adminRoutes };
