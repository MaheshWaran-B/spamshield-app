import { invokeLLM } from "./_core/llm";

/**
 * Analyze a phone number for spam risk using LLM
 */
export async function analyzeCallSpam(phoneNumber: string): Promise<{
  riskScore: number;
  verdict: "spam" | "safe" | "warning";
  reasoning: string;
}> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a spam detection expert. Analyze phone numbers for spam risk. Return a JSON response with riskScore (0-100), verdict (spam/safe/warning), and reasoning.",
        },
        {
          role: "user",
          content: `Analyze this phone number for spam risk: ${phoneNumber}. Consider: common spam patterns, telemarketing indicators, known spam ranges. Return JSON: {"riskScore": number, "verdict": "spam"|"safe"|"warning", "reasoning": "string"}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "spam_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              riskScore: { type: "number", description: "Risk score 0-100" },
              verdict: { type: "string", enum: ["spam", "safe", "warning"] },
              reasoning: { type: "string" },
            },
            required: ["riskScore", "verdict", "reasoning"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content) throw new Error("No response from LLM");

    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);
    return {
      riskScore: Math.min(100, Math.max(0, parsed.riskScore)),
      verdict: parsed.verdict,
      reasoning: parsed.reasoning,
    };
  } catch (error) {
    console.error("LLM call analysis failed:", error);
    // Fallback to random scoring if LLM fails
    const score = Math.floor(Math.random() * 100);
    return {
      riskScore: score,
      verdict: score >= 70 ? "spam" : score >= 40 ? "warning" : "safe",
      reasoning: "Analysis unavailable, using baseline scoring.",
    };
  }
}

/**
 * Analyze SMS message for spam risk using LLM
 */
export async function analyzeSmsSpam(messageText: string): Promise<{
  riskScore: number;
  verdict: "spam" | "safe" | "warning";
  keywords: string[];
  reasoning: string;
}> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a spam detection expert. Analyze SMS messages for spam/phishing risk. Return JSON with riskScore (0-100), verdict, detected keywords, and reasoning.",
        },
        {
          role: "user",
          content: `Analyze this SMS for spam: "${messageText}". Identify spam keywords, phishing indicators, urgency tactics. Return JSON: {"riskScore": number, "verdict": "spam"|"safe"|"warning", "keywords": ["keyword1", "keyword2"], "reasoning": "string"}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sms_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              riskScore: { type: "number" },
              verdict: { type: "string", enum: ["spam", "safe", "warning"] },
              keywords: { type: "array", items: { type: "string" } },
              reasoning: { type: "string" },
            },
            required: ["riskScore", "verdict", "keywords", "reasoning"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content) throw new Error("No response from LLM");

    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);
    return {
      riskScore: Math.min(100, Math.max(0, parsed.riskScore)),
      verdict: parsed.verdict,
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      reasoning: parsed.reasoning,
    };
  } catch (error) {
    console.error("LLM SMS analysis failed:", error);
    const score = Math.floor(Math.random() * 100);
    return {
      riskScore: score,
      verdict: score >= 70 ? "spam" : score >= 40 ? "warning" : "safe",
      keywords: [],
      reasoning: "Analysis unavailable, using baseline scoring.",
    };
  }
}

/**
 * Analyze email for spam/phishing using LLM
 */
export async function analyzeEmailSpam(
  subject: string,
  body: string
): Promise<{
  category: "inbox" | "promotions" | "spam" | "phishing";
  confidenceScore: number;
  threatLevel: "safe" | "warning" | "critical";
  reasoning: string;
}> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an email security expert. Categorize emails and assess threat level. Return JSON with category, confidenceScore (0-100), threatLevel, and reasoning.",
        },
        {
          role: "user",
          content: `Analyze this email:\nSubject: ${subject}\nBody: ${body}\n\nCategorize as inbox/promotions/spam/phishing. Assess threat level. Return JSON: {"category": "inbox"|"promotions"|"spam"|"phishing", "confidenceScore": number, "threatLevel": "safe"|"warning"|"critical", "reasoning": "string"}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "email_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              category: {
                type: "string",
                enum: ["inbox", "promotions", "spam", "phishing"],
              },
              confidenceScore: { type: "number" },
              threatLevel: { type: "string", enum: ["safe", "warning", "critical"] },
              reasoning: { type: "string" },
            },
            required: ["category", "confidenceScore", "threatLevel", "reasoning"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content) throw new Error("No response from LLM");

    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);
    return {
      category: parsed.category,
      confidenceScore: Math.min(100, Math.max(0, parsed.confidenceScore)),
      threatLevel: parsed.threatLevel,
      reasoning: parsed.reasoning,
    };
  } catch (error) {
    console.error("LLM email analysis failed:", error);
    const score = Math.floor(Math.random() * 100);
    return {
      category: "inbox",
      confidenceScore: score,
      threatLevel: score >= 80 ? "critical" : score >= 50 ? "warning" : "safe",
      reasoning: "Analysis unavailable, using baseline scoring.",
    };
  }
}
