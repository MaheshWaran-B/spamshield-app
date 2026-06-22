import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, callScans, smsScans, emailScans, userStats } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * CALL SCAN QUERIES
 */
export async function createCallScan(scan: {
  userId: number;
  phoneNumberHash: string;
  riskScore: number;
  verdict: "spam" | "safe" | "warning";
  reportCount?: number;
  aiReasoning?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(callScans).values(scan);
  return result;
}

export async function getCallScans(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db
    .select()
    .from(callScans)
    .where(eq(callScans.userId, userId))
    .orderBy(desc(callScans.createdAt))
    .limit(limit);
}

/**
 * SMS SCAN QUERIES
 */
export async function createSmsScan(scan: {
  userId: number;
  messageText: string;
  messageHash: string;
  riskScore: number;
  verdict: "spam" | "safe" | "warning";
  spamKeywords?: string;
  aiReasoning?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(smsScans).values(scan);
}

export async function getSmsScans(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db
    .select()
    .from(smsScans)
    .where(eq(smsScans.userId, userId))
    .orderBy(desc(smsScans.createdAt))
    .limit(limit);
}

/**
 * EMAIL SCAN QUERIES
 */
export async function createEmailScan(scan: {
  userId: number;
  senderEmail: string;
  subject: string;
  bodyHash: string;
  category: "inbox" | "promotions" | "spam" | "phishing";
  confidenceScore: number;
  threatLevel: "safe" | "warning" | "critical";
  aiReasoning?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(emailScans).values(scan);
}

export async function getEmailScans(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db
    .select()
    .from(emailScans)
    .where(eq(emailScans.userId, userId))
    .orderBy(desc(emailScans.createdAt))
    .limit(limit);
}

/**
 * USER STATS QUERIES
 */
export async function getOrCreateUserStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);
  
  if (existing.length > 0) return existing[0];
  
  await db.insert(userStats).values({ userId });
  return db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1)
    .then(r => r[0]);
}

export async function updateUserStats(userId: number, updates: Partial<{
  totalScanned: number;
  spamBlocked: number;
  safeCount: number;
  warningCount: number;
  overallSafetyScore: number;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db
    .update(userStats)
    .set(updates)
    .where(eq(userStats.userId, userId));
}

/**
 * Get user by username (for custom auth)
 */
export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create new user with username and password
 */
export async function createUser(data: {
  username: string;
  passwordHash: string;
  name?: string;
  email?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.insert(users).values({
      username: data.username,
      passwordHash: data.passwordHash,
      name: data.name,
      email: data.email,
      loginMethod: "custom",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });
    
    // Return the created user
    return getUserByUsername(data.username);
  } catch (error: any) {
    if (error.message?.includes("Duplicate entry")) {
      throw new Error("Username already exists");
    }
    throw error;
  }
}

/**
 * Update last signed in timestamp
 */
export async function updateLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, userId));
}
