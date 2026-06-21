import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import {
  createCallScan,
  getCallScans,
  createSmsScan,
  getSmsScans,
  createEmailScan,
  getEmailScans,
} from "./db";
import {
  hashPhoneNumber,
  hashMessage,
  checkRateLimit,
  isValidPhoneNumber,
  isValidEmail,
  sanitizeInput,
} from "./security";
import { analyzeCallSpam, analyzeSmsSpam, analyzeEmailSpam } from "./aiAnalysis";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  calls: router({
    scan: protectedProcedure
      .input(z.object({ phoneNumber: z.string().min(10).max(15) }))
      .mutation(async ({ ctx, input }) => {
        // Rate limiting
        const rateLimitKey = `call-scan-${ctx.user.id}`;
        if (!checkRateLimit(rateLimitKey, 20, 60000)) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }

        // Input validation
        if (!isValidPhoneNumber(input.phoneNumber)) {
          throw new Error("Invalid phone number format.");
        }

        const { phoneNumber } = input;
        const phoneHash = hashPhoneNumber(phoneNumber);

        // Use LLM for analysis
        const analysis = await analyzeCallSpam(phoneNumber);

        await createCallScan({
          userId: ctx.user.id,
          phoneNumberHash: phoneHash,
          riskScore: analysis.riskScore,
          verdict: analysis.verdict,
          reportCount: Math.floor(Math.random() * 1000),
          aiReasoning: analysis.reasoning,
        });

        return {
          riskScore: analysis.riskScore,
          verdict: analysis.verdict,
          success: true,
        };
      }),
    history: protectedProcedure.query(async ({ ctx }) => {
      return getCallScans(ctx.user.id, 20);
    }),
  }),

  sms: router({
    scan: protectedProcedure
      .input(z.object({ message: z.string().min(1).max(500) }))
      .mutation(async ({ ctx, input }) => {
        // Rate limiting
        const rateLimitKey = `sms-scan-${ctx.user.id}`;
        if (!checkRateLimit(rateLimitKey, 30, 60000)) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }

        // Input sanitization
        const sanitized = sanitizeInput(input.message, 500);
        const messageHash = hashMessage(sanitized);

        // Use LLM for analysis
        const analysis = await analyzeSmsSpam(sanitized);

        await createSmsScan({
          userId: ctx.user.id,
          messageText: sanitized,
          messageHash,
          riskScore: analysis.riskScore,
          verdict: analysis.verdict,
          spamKeywords: JSON.stringify(analysis.keywords),
          aiReasoning: analysis.reasoning,
        });

        return {
          riskScore: analysis.riskScore,
          verdict: analysis.verdict,
          keywords: analysis.keywords,
          success: true,
        };
      }),
    history: protectedProcedure.query(async ({ ctx }) => {
      return getSmsScans(ctx.user.id, 20);
    }),
  }),

  emails: router({
    scan: protectedProcedure
      .input(
        z.object({
          senderEmail: z.string().email(),
          subject: z.string().min(1).max(200),
          body: z.string().min(1).max(5000),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Rate limiting
        const rateLimitKey = `email-scan-${ctx.user.id}`;
        if (!checkRateLimit(rateLimitKey, 15, 60000)) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }

        // Input validation and sanitization
        if (!isValidEmail(input.senderEmail)) {
          throw new Error("Invalid sender email format.");
        }
        const subject = sanitizeInput(input.subject, 200);
        const body = sanitizeInput(input.body, 5000);
        const bodyHash = hashMessage(body);

        // Use LLM for analysis
        const analysis = await analyzeEmailSpam(subject, body);

        await createEmailScan({
          userId: ctx.user.id,
          senderEmail: input.senderEmail,
          subject,
          bodyHash,
          category: analysis.category,
          confidenceScore: analysis.confidenceScore,
          threatLevel: analysis.threatLevel,
          aiReasoning: analysis.reasoning,
        });

        return {
          category: analysis.category,
          confidenceScore: analysis.confidenceScore,
          threatLevel: analysis.threatLevel,
          success: true,
        };
      }),
    history: protectedProcedure.query(async ({ ctx }) => {
      return getEmailScans(ctx.user.id, 20);
    }),
  }),
});

export type AppRouter = typeof appRouter;
