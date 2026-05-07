import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

// Queues
export const emailQueue = new Queue("email", { connection: redis });
export const modelPullQueue = new Queue("model-pull", { connection: redis });
export const analyticsQueue = new Queue("analytics", { connection: redis });
export const cleanupQueue = new Queue("cleanup", { connection: redis });

// Email Worker
const emailWorker = new Worker("email", async (job: Job) => {
  const { to, subject, body } = job.data;
  console.log(`[Email] Sending to ${to}: ${subject}`);
  // TODO: Integrate with SendGrid/Resend
  return { sent: true };
}, { connection: redis });

// Model Pull Worker
const modelPullWorker = new Worker("model-pull", async (job: Job) => {
  const { model } = job.data;
  console.log(`[Model] Pulling ${model}...`);
  // Call Ollama to pull model
  const response = await fetch(`${process.env.OLLAMA_HOST || "http://localhost:11434"}/api/pull`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: model, stream: false }),
  });

  if (!response.ok) {
    throw new Error(`Failed to pull model: ${model}`);
  }

  console.log(`[Model] Successfully pulled ${model}`);
  return { pulled: true, model };
}, { connection: redis });

// Analytics Worker
const analyticsWorker = new Worker("analytics", async (job: Job) => {
  const { type, data } = job.data;
  console.log(`[Analytics] Processing ${type}`);
  // Aggregate daily/weekly stats
  return { processed: true };
}, { connection: redis });

// Cleanup Worker
const cleanupWorker = new Worker("cleanup", async (job: Job) => {
  console.log("[Cleanup] Running cleanup tasks...");
  // Cleanup old sessions, expired data, etc.
  return { cleaned: true };
}, { connection: redis });

// Error handlers
emailWorker.on("failed", (job, err) => {
  console.error(`[Email Worker] Job ${job?.id} failed:`, err);
});

modelPullWorker.on("failed", (job, err) => {
  console.error(`[Model Pull Worker] Job ${job?.id} failed:`, err);
});

analyticsWorker.on("failed", (job, err) => {
  console.error(`[Analytics Worker] Job ${job?.id} failed:`, err);
});

cleanupWorker.on("failed", (job, err) => {
  console.error(`[Cleanup Worker] Job ${job?.id} failed:`, err);
});

console.log("🔥 Phoenix Workers started");
console.log("Queues: email, model-pull, analytics, cleanup");

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down workers...");
  await emailWorker.close();
  await modelPullWorker.close();
  await analyticsWorker.close();
  await cleanupWorker.close();
  await redis.quit();
  process.exit(0);
});
