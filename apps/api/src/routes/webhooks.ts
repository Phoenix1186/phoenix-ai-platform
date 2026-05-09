import { Hono } from "hono";
import { eq, sql } from "drizzle-orm";
import { db } from "@phoenix/database";
import { payments, users } from "@phoenix/database";
import { PaystackService } from "../services/paystack.js";

const webhookRoutes = new Hono();

// Paystack webhook
webhookRoutes.post("/paystack", async (c) => {
  const signature = c.req.header("x-paystack-signature");
  const body = await c.req.json();

  const paystack = new PaystackService();
  const isValid = paystack.verifyWebhook(signature || "", body);

  if (!isValid) {
    return c.json({ error: "Invalid signature" }, 400);
  }

  if (body.event === "charge.success") {
    const reference = body.data.reference;
    const payment = await db.query.payments.findFirst({
      where: eq(payments.reference, reference),
    });

    if (payment && payment.status === "pending") {
      // Update payment status
      await db.update(payments)
        .set({ status: "success", updatedAt: new Date() })
        .where(eq(payments.id, payment.id));

      // Add credits to user
      await db.update(users)
        .set({ credits: sql`${users.credits} + ${payment.credits}` })
        .where(eq(users.id, payment.userId));
    }
  }

  return c.json({ received: true });
});

export { webhookRoutes };
