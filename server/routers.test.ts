import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

describe("Spam Detection Routers", () => {
  describe("calls.scan", () => {
    it("should reject invalid phone numbers", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.calls.scan({ phoneNumber: "123" }) // Too short
      ).rejects.toThrow();
    });

    it("should accept valid phone numbers", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.calls.scan({ phoneNumber: "+1234567890" });

      expect(result).toHaveProperty("riskScore");
      expect(result).toHaveProperty("verdict");
      expect(result.success).toBe(true);
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
      expect(["spam", "safe", "warning"]).toContain(result.verdict);
    });

    it("should return valid verdict", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.calls.scan({ phoneNumber: "+1234567890" });

      // Verdict should be one of the valid options
      expect(["spam", "safe", "warning"]).toContain(result.verdict);
    });
  });

  describe("sms.scan", () => {
    it("should reject empty messages", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.sms.scan({ message: "" })).rejects.toThrow();
    });

    it("should reject messages over 500 characters", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const longMessage = "a".repeat(501);
      await expect(caller.sms.scan({ message: longMessage })).rejects.toThrow();
    });

    it("should accept valid SMS messages", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.sms.scan({
        message: "Click here to verify your account",
      });

      expect(result).toHaveProperty("riskScore");
      expect(result).toHaveProperty("verdict");
      expect(result).toHaveProperty("keywords");
      expect(result.success).toBe(true);
      expect(Array.isArray(result.keywords)).toBe(true);
    });
  });

  describe("emails.scan", () => {
    it("should reject invalid sender email", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.emails.scan({
          senderEmail: "not-an-email",
          subject: "Test",
          body: "Test body",
        })
      ).rejects.toThrow();
    });

    it("should reject empty subject", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.emails.scan({
          senderEmail: "sender@example.com",
          subject: "",
          body: "Test body",
        })
      ).rejects.toThrow();
    });

    it("should accept valid email", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.emails.scan({
        senderEmail: "sender@example.com",
        subject: "Important Update",
        body: "Please review the attached document.",
      });

      expect(result).toHaveProperty("category");
      expect(result).toHaveProperty("confidenceScore");
      expect(result).toHaveProperty("threatLevel");
      expect(result.success).toBe(true);
      expect(["inbox", "promotions", "spam", "phishing"]).toContain(
        result.category
      );
      expect(["safe", "warning", "critical"]).toContain(result.threatLevel);
    });

    it("should return confidence score between 0 and 100", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.emails.scan({
        senderEmail: "test@example.com",
        subject: "Test Subject",
        body: "Test body content",
      });

      expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(result.confidenceScore).toBeLessThanOrEqual(100);
    });
  });

  describe("calls.history", () => {
    it("should return call history for authenticated user", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const history = await caller.calls.history();

      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe("sms.history", () => {
    it("should return SMS history for authenticated user", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const history = await caller.sms.history();

      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe("emails.history", () => {
    it("should return email history for authenticated user", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const history = await caller.emails.history();

      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe("auth.logout", () => {
    it("should clear session cookie on logout", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result.success).toBe(true);
      expect(ctx.res.clearCookie).toHaveBeenCalled();
    });
  });
});
