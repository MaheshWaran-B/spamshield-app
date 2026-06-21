import { describe, expect, it, vi, beforeEach } from "vitest";
import { analyzeCallSpam, analyzeSmsSpam, analyzeEmailSpam } from "./aiAnalysis";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

import { invokeLLM } from "./_core/llm";

const mockInvokeLLM = invokeLLM as ReturnType<typeof vi.fn>;

describe("AI Analysis Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("analyzeCallSpam", () => {
    it("should return valid structure with LLM response", async () => {
      mockInvokeLLM.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                riskScore: 75,
                verdict: "spam",
                reasoning: "Matches known spam patterns",
              }),
            },
          },
        ],
      });

      const result = await analyzeCallSpam("+1234567890");

      expect(result).toHaveProperty("riskScore");
      expect(result).toHaveProperty("verdict");
      expect(result).toHaveProperty("reasoning");
      expect(result.riskScore).toBe(75);
      expect(result.verdict).toBe("spam");
      expect(result.reasoning).toBe("Matches known spam patterns");
    });

    it("should clamp risk score between 0 and 100", async () => {
      mockInvokeLLM.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                riskScore: 150,
                verdict: "spam",
                reasoning: "Test",
              }),
            },
          },
        ],
      });

      const result = await analyzeCallSpam("+1234567890");

      expect(result.riskScore).toBe(100);
    });

    it("should fallback to random scoring when LLM fails", async () => {
      mockInvokeLLM.mockRejectedValueOnce(new Error("LLM error"));

      const result = await analyzeCallSpam("+1234567890");

      expect(result).toHaveProperty("riskScore");
      expect(result).toHaveProperty("verdict");
      expect(result.reasoning).toContain("unavailable");
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
    });

    it("should fallback when LLM returns no content", async () => {
      mockInvokeLLM.mockResolvedValueOnce({
        choices: [{ message: { content: null } }],
      });

      const result = await analyzeCallSpam("+1234567890");

      expect(result.reasoning).toContain("unavailable");
    });
  });

  describe("analyzeSmsSpam", () => {
    it("should return valid structure with LLM response", async () => {
      mockInvokeLLM.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                riskScore: 85,
                verdict: "spam",
                keywords: ["verify account", "click here"],
                reasoning: "Phishing indicators detected",
              }),
            },
          },
        ],
      });

      const result = await analyzeSmsSpam("Click here to verify your account");

      expect(result).toHaveProperty("riskScore");
      expect(result).toHaveProperty("verdict");
      expect(result).toHaveProperty("keywords");
      expect(result).toHaveProperty("reasoning");
      expect(Array.isArray(result.keywords)).toBe(true);
      expect(result.keywords).toContain("verify account");
    });

    it("should handle empty keywords array", async () => {
      mockInvokeLLM.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                riskScore: 20,
                verdict: "safe",
                keywords: [],
                reasoning: "No spam indicators",
              }),
            },
          },
        ],
      });

      const result = await analyzeSmsSpam("Hello, how are you?");

      expect(Array.isArray(result.keywords)).toBe(true);
      expect(result.keywords.length).toBe(0);
    });

    it("should fallback with empty keywords when LLM fails", async () => {
      mockInvokeLLM.mockRejectedValueOnce(new Error("LLM error"));

      const result = await analyzeSmsSpam("Test message");

      expect(Array.isArray(result.keywords)).toBe(true);
      expect(result.keywords.length).toBe(0);
    });
  });

  describe("analyzeEmailSpam", () => {
    it("should return valid structure with LLM response", async () => {
      mockInvokeLLM.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                category: "phishing",
                confidenceScore: 92,
                threatLevel: "critical",
                reasoning: "Suspicious sender and urgent language",
              }),
            },
          },
        ],
      });

      const result = await analyzeEmailSpam(
        "Urgent: Verify Your Account",
        "Click here immediately to verify..."
      );

      expect(result).toHaveProperty("category");
      expect(result).toHaveProperty("confidenceScore");
      expect(result).toHaveProperty("threatLevel");
      expect(result).toHaveProperty("reasoning");
      expect(result.category).toBe("phishing");
      expect(result.confidenceScore).toBe(92);
      expect(result.threatLevel).toBe("critical");
    });

    it("should validate category enum", async () => {
      mockInvokeLLM.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                category: "promotions",
                confidenceScore: 45,
                threatLevel: "safe",
                reasoning: "Marketing email",
              }),
            },
          },
        ],
      });

      const result = await analyzeEmailSpam("Sale Offer", "50% off today!");

      expect(["inbox", "promotions", "spam", "phishing"]).toContain(
        result.category
      );
    });

    it("should clamp confidence score between 0 and 100", async () => {
      mockInvokeLLM.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                category: "spam",
                confidenceScore: 200,
                threatLevel: "critical",
                reasoning: "Test",
              }),
            },
          },
        ],
      });

      const result = await analyzeEmailSpam("Test", "Test body");

      expect(result.confidenceScore).toBe(100);
    });

    it("should fallback to inbox category when LLM fails", async () => {
      mockInvokeLLM.mockRejectedValueOnce(new Error("LLM error"));

      const result = await analyzeEmailSpam("Test Subject", "Test body");

      expect(result.category).toBe("inbox");
      expect(result.reasoning).toContain("unavailable");
    });

    it("should map confidence score to threat level on fallback", async () => {
      mockInvokeLLM.mockRejectedValueOnce(new Error("LLM error"));

      const result = await analyzeEmailSpam("Test", "Test");

      expect(["safe", "warning", "critical"]).toContain(result.threatLevel);
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed JSON from LLM", async () => {
      mockInvokeLLM.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: "{ invalid json",
            },
          },
        ],
      });

      const result = await analyzeCallSpam("+1234567890");

      // Should fallback gracefully
      expect(result).toHaveProperty("riskScore");
      expect(result).toHaveProperty("verdict");
      expect(result.reasoning).toContain("unavailable");
    });

    it("should handle missing choices in LLM response", async () => {
      mockInvokeLLM.mockResolvedValueOnce({
        choices: [],
      });

      const result = await analyzeCallSpam("+1234567890");

      expect(result.reasoning).toContain("unavailable");
    });

    it("should handle null message content", async () => {
      mockInvokeLLM.mockResolvedValueOnce({
        choices: [{ message: null }],
      });

      const result = await analyzeSmsSpam("Test");

      expect(result.reasoning).toContain("unavailable");
    });
  });
});
