import { action, mutation, query } from "convex/server";
import { v } from "convex/values";
import crypto from "crypto";
import { Resend } from "resend";
import { verifyTurnstileOrSkip } from "./turnstile";
import { emailClientVerification, emailPiperNotification } from "./email";

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function randomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const createPending = mutation({
  args: {
    piperId: v.id("pipers"),
    eventType: v.string(),
    eventDate: v.string(),
    eventTime: v.string(),
    location: v.string(),
    message: v.string(),
    clientName: v.string(),
    clientEmail: v.string(),
    clientPhone: v.string(),
    turnstileToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await verifyTurnstileOrSkip(args.turnstileToken);

    return await ctx.db.insert("enquiries", {
      piperId: args.piperId,
      eventType: args.eventType,
      eventDate: args.eventDate,
      eventTime: args.eventTime,
      location: args.location,
      message: args.message,
      clientName: args.clientName,
      clientEmail: args.clientEmail,
      clientPhone: args.clientPhone,
      status: "pending_verification",
      createdAt: Date.now(),
    });
  },
});

export const get = query({
  args: { enquiryId: v.id("enquiries") },
  handler: async (ctx, { enquiryId }) => await ctx.db.get(enquiryId),
});

export const sendVerificationCode = action({
  args: { enquiryId: v.id("enquiries"), email: v.string() },
  handler: async (ctx, args) => {
    const enquiry = await ctx.runQuery("enquiries.get", { enquiryId: args.enquiryId });
    if (!enquiry) throw new Error("Enquiry not found");

    const code = randomCode();
    const expiresAt = Date.now() + 1000 * 60 * 15;
    const existing = await ctx.runQuery("enquiries.getVerification", { enquiryId: args.enquiryId });

    if (existing) {
      await ctx.runMutation("enquiries.updateVerification", { id: existing._id, codeHash: hashCode(code), expiresAt });
    } else {
      await ctx.runMutation("enquiries.createVerification", {
        enquiryId: args.enquiryId,
        email: args.email,
        codeHash: hashCode(code),
        expiresAt,
      });
    }

    const resendKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!resendKey || !from) throw new Error("Missing RESEND_API_KEY or EMAIL_FROM");
    const resend = new Resend(resendKey);

    await resend.emails.send({
      from,
      to: args.email,
      subject: "Your verification code — Highland Bagpiper",
      html: emailClientVerification(code),
    });
  },
});

export const verifyCodeAndMarkSent = mutation({
  args: { enquiryId: v.id("enquiries"), code: v.string() },
  handler: async (ctx, args) => {
    const enquiry = await ctx.db.get(args.enquiryId);
    if (!enquiry) throw new Error("Enquiry not found");

    const ver = await ctx.db.query("emailVerifications").withIndex("by_enquiryId", (q) => q.eq("enquiryId", args.enquiryId)).unique();
    if (!ver) throw new Error("Verification not found");
    if (Date.now() > ver.expiresAt) throw new Error("Code expired");
    if (ver.attempts >= 8) throw new Error("Too many attempts");

    const ok = hashCode(args.code.trim()) === ver.codeHash;
    await ctx.db.patch(ver._id, { attempts: ver.attempts + 1 });
    if (!ok) throw new Error("Incorrect code");

    await ctx.db.patch(args.enquiryId, { status: "sent" });
    return true;
  },
});

export const notifyPiper = action({
  args: { enquiryId: v.id("enquiries") },
  handler: async (ctx, args) => {
    const enquiry = await ctx.runQuery("enquiries.get", { enquiryId: args.enquiryId });
    if (!enquiry) throw new Error("Enquiry not found");
    if (enquiry.status !== "sent") throw new Error("Enquiry not verified");

    const piper = await ctx.runQuery("pipers.getPublishedById", { piperId: enquiry.piperId });
    // For notifications we want even unpublished? Use direct get:
    const piperDirect = piper ?? (await ctx.runQuery("enquiries.getPiperDirect", { piperId: enquiry.piperId }));
    if (!piperDirect) throw new Error("Piper not found");

    const resendKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!resendKey || !from) throw new Error("Missing RESEND_API_KEY or EMAIL_FROM");
    const resend = new Resend(resendKey);

    await resend.emails.send({
      from,
      to: piperDirect.contactEmail,
      replyTo: enquiry.clientEmail,
      subject: `New enquiry — ${enquiry.eventType} (${enquiry.eventDate})`,
      html: emailPiperNotification(enquiry, piperDirect),
    });
  },
});

export const getPiperDirect = query({
  args: { piperId: v.id("pipers") },
  handler: async (ctx, { piperId }) => await ctx.db.get(piperId),
});

export const getVerification = query({
  args: { enquiryId: v.id("enquiries") },
  handler: async (ctx, { enquiryId }) =>
    await ctx.db.query("emailVerifications").withIndex("by_enquiryId", (q) => q.eq("enquiryId", enquiryId)).unique(),
});

export const createVerification = mutation({
  args: { enquiryId: v.id("enquiries"), email: v.string(), codeHash: v.string(), expiresAt: v.number() },
  handler: async (ctx, args) =>
    await ctx.db.insert("emailVerifications", { enquiryId: args.enquiryId, email: args.email, codeHash: args.codeHash, expiresAt: args.expiresAt, attempts: 0, createdAt: Date.now() }),
});

export const updateVerification = mutation({
  args: { id: v.id("emailVerifications"), codeHash: v.string(), expiresAt: v.number() },
  handler: async (ctx, args) => await ctx.db.patch(args.id, { codeHash: args.codeHash, expiresAt: args.expiresAt, attempts: 0 }),
});
