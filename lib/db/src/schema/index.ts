import { pgTable, text, jsonb, bigint } from "drizzle-orm/pg-core";

export const authSessionsTable = pgTable("auth_sessions", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull(),
  githubToken: text("github_token").notNull(),
  username: text("username").notNull(),
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
});

export const appSessionsTable = pgTable("app_sessions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id").notNull(),
  status: text("status").notNull().default("creating"),
  creationTime: bigint("creation_time", { mode: "number" }).notNull(),
  messages: jsonb("messages").notNull().default([]),
  previewUrl: text("preview_url"),
  pullRequestUrl: text("pull_request_url"),
  pullRequestNumber: bigint("pull_request_number", { mode: "number" }),
  repository: text("repository"),
  templateId: text("template_id"),
});
