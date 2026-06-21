import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-change-in-production";
const HASH_SALT = process.env.HASH_SALT || "default-salt-change-in-production";

/**
 * Hash a phone number using SHA256 + salt
 * Never store raw phone numbers in the database
 */
export function hashPhoneNumber(phoneNumber: string): string {
  const normalized = phoneNumber.replace(/\D/g, "");
  return crypto
    .createHash("sha256")
    .update(normalized + HASH_SALT)
    .digest("hex");
}

/**
 * Hash email address using SHA256 + salt
 */
export function hashEmail(email: string): string {
  const normalized = email.toLowerCase().trim();
  return crypto
    .createHash("sha256")
    .update(normalized + HASH_SALT)
    .digest("hex");
}

/**
 * Hash message text using SHA256
 */
export function hashMessage(text: string): string {
  return crypto
    .createHash("sha256")
    .update(text + HASH_SALT)
    .digest("hex");
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string, maxLength = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>\"']/g, (char) => {
      const map: Record<string, string> = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
      };
      return map[char] || char;
    });
}

/**
 * Validate phone number format (basic validation)
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  const digits = phoneNumber.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Rate limiting helper - simple in-memory store
 * In production, use Redis or similar
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string,
  maxRequests = 10,
  windowMs = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count < maxRequests) {
    record.count++;
    return true;
  }

  return false;
}

/**
 * Generate a simple risk score based on common spam indicators
 * This is a helper; the main scoring comes from LLM
 */
export function calculateBaseRiskScore(indicators: {
  isBlacklisted?: boolean;
  hasSpamKeywords?: boolean;
  isNewNumber?: boolean;
  hasHighReportCount?: boolean;
}): number {
  let score = 0;

  if (indicators.isBlacklisted) score += 40;
  if (indicators.hasSpamKeywords) score += 30;
  if (indicators.isNewNumber) score += 15;
  if (indicators.hasHighReportCount) score += 25;

  return Math.min(score, 100);
}

/**
 * Determine verdict based on risk score
 */
export function getVerdictFromScore(score: number): "spam" | "safe" | "warning" {
  if (score >= 70) return "spam";
  if (score >= 40) return "warning";
  return "safe";
}

/**
 * Determine threat level for emails
 */
export function getThreatLevelFromScore(score: number): "safe" | "warning" | "critical" {
  if (score >= 80) return "critical";
  if (score >= 50) return "warning";
  return "safe";
}
