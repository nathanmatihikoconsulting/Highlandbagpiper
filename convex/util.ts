import { QueryCtx, MutationCtx } from "convex/server";

export async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  // Clerk user id is in `subject`
  return { clerkUserId: identity.subject };
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const { clerkUserId } = await requireIdentity(ctx);
  const user = await ctx.db.query("users").withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId)).unique();
  if (!user || user.role !== "admin") throw new Error("Admin only");
  return user;
}

export async function requireUserRow(ctx: QueryCtx | MutationCtx) {
  const { clerkUserId } = await requireIdentity(ctx);
  const user = await ctx.db.query("users").withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId)).unique();
  if (!user) throw new Error("User row missing. Visit /piper/dashboard once and/or run users.ensureUser.");
  return user;
}
