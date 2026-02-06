import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireIdentity } from "./util";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
  },
});

export const ensureUser = mutation({
  args: { role: v.optional(v.union(v.literal("piper"), v.literal("admin"))) },
  handler: async (ctx, args) => {
    const { clerkUserId } = await requireIdentity(ctx);
    const existing = await ctx.db.query("users").withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId)).unique();
    if (existing) return existing._id;
    return await ctx.db.insert("users", { clerkUserId, role: args.role ?? "piper", createdAt: Date.now() });
  },
});
