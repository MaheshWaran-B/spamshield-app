import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Call Spam Detection
 * Stores hashed phone numbers with AI risk scores and verdicts
 */
export const callScans = mysqlTable("call_scans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  phoneNumberHash: varchar("phoneNumberHash", { length: 256 }).notNull(),
  riskScore: int("riskScore").notNull(), // 0-100
  verdict: mysqlEnum("verdict", ["spam", "safe", "warning"]).notNull(),
  reportCount: int("reportCount").default(0).notNull(),
  aiReasoning: text("aiReasoning"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CallScan = typeof callScans.$inferSelect;
export type InsertCallScan = typeof callScans.$inferInsert;

/**
 * SMS Spam Detection
 * Stores SMS message analysis with risk scores and keyword highlights
 */
export const smsScans = mysqlTable("sms_scans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  messageText: text("messageText").notNull(),
  messageHash: varchar("messageHash", { length: 256 }).notNull(),
  riskScore: int("riskScore").notNull(), // 0-100
  verdict: mysqlEnum("verdict", ["spam", "safe", "warning"]).notNull(),
  spamKeywords: text("spamKeywords"), // JSON array of detected keywords
  aiReasoning: text("aiReasoning"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SmsScan = typeof smsScans.$inferSelect;
export type InsertSmsScan = typeof smsScans.$inferInsert;

/**
 * Email Spam Detection
 * Stores email analysis with categorization and confidence scores
 */
export const emailScans = mysqlTable("email_scans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  senderEmail: varchar("senderEmail", { length: 320 }).notNull(),
  subject: text("subject").notNull(),
  bodyHash: varchar("bodyHash", { length: 256 }).notNull(),
  category: mysqlEnum("category", ["inbox", "promotions", "spam", "phishing"]).notNull(),
  confidenceScore: int("confidenceScore").notNull(), // 0-100
  threatLevel: mysqlEnum("threatLevel", ["safe", "warning", "critical"]).notNull(),
  aiReasoning: text("aiReasoning"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailScan = typeof emailScans.$inferSelect;
export type InsertEmailScan = typeof emailScans.$inferInsert;

/**
 * User Statistics
 * Aggregated stats for each user across all scan types
 */
export const userStats = mysqlTable("user_stats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  totalScanned: int("totalScanned").default(0).notNull(),
  spamBlocked: int("spamBlocked").default(0).notNull(),
  safeCount: int("safeCount").default(0).notNull(),
  warningCount: int("warningCount").default(0).notNull(),
  overallSafetyScore: int("overallSafetyScore").default(100).notNull(), // 0-100
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserStat = typeof userStats.$inferSelect;
export type InsertUserStat = typeof userStats.$inferInsert;