import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  serial,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";

export const userTierEnum = pgEnum("user_tier", ["free", "pro", "enterprise"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "success", "failed"]);
export const messageRoleEnum = pgEnum("message_role", ["user", "assistant", "system"]);

export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    avatar: text("avatar"),
    tier: userTierEnum("tier").notNull().default("free"),
    credits: integer("credits").notNull().default(0),
    monthlyRequestsUsed: integer("monthly_requests_used").notNull().default(0),
    apiKey: varchar("api_key", { length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("email_idx").on(table.email),
    apiKeyIdx: uniqueIndex("api_key_idx").on(table.apiKey),
  })
);

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const conversations = pgTable(
  "conversations",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull().default("New Chat"),
    model: varchar("model", { length: 100 }).notNull(),
    provider: varchar("provider", { length: 50 }).notNull(),
    isPinned: boolean("is_pinned").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("conv_user_id_idx").on(table.userId),
    updatedAtIdx: index("conv_updated_at_idx").on(table.updatedAt),
  })
);

export const messages = pgTable(
  "messages",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    conversationId: varchar("conversation_id", { length: 36 })
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: messageRoleEnum("role").notNull(),
    content: text("content").notNull(),
    tokens: integer("tokens"),
    model: varchar("model", { length: 100 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    conversationIdIdx: index("msg_conv_id_idx").on(table.conversationId),
    createdAtIdx: index("msg_created_at_idx").on(table.createdAt),
  })
);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    key: varchar("key", { length: 255 }).notNull().unique(),
    prefix: varchar("prefix", { length: 10 }).notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    keyIdx: uniqueIndex("api_keys_key_idx").on(table.key),
    userIdIdx: index("api_keys_user_id_idx").on(table.userId),
  })
);

export const payments = pgTable(
  "payments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(), // in kobo (NGN)
    credits: integer("credits").notNull(),
    status: paymentStatusEnum("status").notNull().default("pending"),
    reference: varchar("reference", { length: 255 }).notNull().unique(),
    provider: varchar("provider", { length: 50 }).notNull().default("paystack"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    referenceIdx: uniqueIndex("payment_reference_idx").on(table.reference),
    userIdIdx: index("payment_user_id_idx").on(table.userId),
  })
);

export const usageLogs = pgTable(
  "usage_logs",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    apiKeyId: varchar("api_key_id", { length: 36 }).references(() => apiKeys.id),
    model: varchar("model", { length: 100 }).notNull(),
    provider: varchar("provider", { length: 50 }).notNull(),
    promptTokens: integer("prompt_tokens").notNull(),
    completionTokens: integer("completion_tokens").notNull(),
    totalTokens: integer("total_tokens").notNull(),
    creditsUsed: integer("credits_used").notNull(),
    latency: integer("latency"), // in ms
    status: varchar("status", { length: 50 }).notNull(),
    errorMessage: text("error_message"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("usage_user_id_idx").on(table.userId),
    createdAtIdx: index("usage_created_at_idx").on(table.createdAt),
  })
);

export const waitlist = pgTable(
  "waitlist",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    company: varchar("company", { length: 255 }),
    useCase: text("use_case"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("waitlist_email_idx").on(table.email),
  })
);
