import crypto from "crypto";

/**
 * Simple password hashing using crypto (bcrypt alternative)
 * In production, use bcryptjs or argon2
 */
export function hashPassword(password: string, salt?: string): string {
  const saltToUse = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, saltToUse, 100000, 64, "sha512")
    .toString("hex");
  return `${saltToUse}:${hash}`;
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  const [salt, storedHash] = hash.split(":");
  if (!salt || !storedHash) {
    return false;
  }

  const computedHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  return computedHash === storedHash;
}

/**
 * Validate username
 */
export function isValidUsername(username: string): boolean {
  if (!username || username.length < 3 || username.length > 64) {
    return false;
  }
  // Allow alphanumeric and underscore only
  return /^[a-zA-Z0-9_]+$/.test(username);
}

/**
 * Validate password
 */
export function isValidPassword(password: string): boolean {
  if (!password || password.length < 8) {
    return false;
  }
  return true;
}
