import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { HTTPException } from "hono/http-exception";
import dotenv from "dotenv";

dotenv.config();

import { auth } from "./auth";
import { apiV1 } from "./routes/v1";
import { webhookRoutes } from "./routes/webhooks";
import { adminRoutes } from "./routes/admin";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", cors({
  origin: [process.env.APP_URL || "http://localhost:3000", "http://localhost:3002"],
  credentials: true,
}));

// Health check
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// Routes
app.route("/auth", auth);
app.route("/v1", apiV1);
app.route("/webhooks", webhookRoutes);
app.route("/admin", adminRoutes);

// Error handling
app.onError((err, c) => {
  console.error("Error:", err);
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  return c.json({ error: "Internal Server Error", message: err.message }, 500);
});

// 404
app.notFound((c) => c.json({ error: "Not Found", path: c.req.path }, 404));

const port = parseInt(process.env.PORT || "3001");

console.log(`🔥 Phoenix API running on port ${port}`);
serve({ fetch: app.fetch, port });
