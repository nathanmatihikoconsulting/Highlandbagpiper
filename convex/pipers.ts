import { mutation, query } from "./generated/server";
import { v } from "convex/values";
import { requireAdmin, requireUserRow } from "./util";

export const listPublished = query({
  args: { location: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const published = await ctx.db.query("pipers").withIndex("by_published", (q) => q.eq("isPublished", true)).collect();
    if (!args.location) return published;
    const needle = args.location.toLowerCase();
    return published.filter((p) => p.baseLocation.toLowerCase().includes(needle));
  },
});

export const getPublishedById = query({
  args: { piperId: v.id("pipers") },
  handler: async (ctx, { piperId }) => {
    const p = await ctx.db.get(piperId);
    if (!p || !p.isPublished) return null;
    return p;
  },
});

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUserRow(ctx);
    return await ctx.db.query("pipers").withIndex("by_userId", (q) => q.eq("userId", user._id)).unique();
  },
});

export const upsertMine = mutation({
  args: {
    displayName: v.string(),
    baseLocation: v.string(),
    bio: v.optional(v.string()),
    contactEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUserRow(ctx);
    const existing = await ctx.db.query("pipers").withIndex("by_userId", (q) => q.eq("userId", user._id)).unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        displayName: args.displayName,
        baseLocation: args.baseLocation,
        bio: args.bio,
        contactEmail: args.contactEmail,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("pipers", {
      userId: user._id,
      displayName: args.displayName,
      baseLocation: args.baseLocation,
      bio: args.bio,
      contactEmail: args.contactEmail,
      isPublished: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("pipers").collect();
    return all.filter((p) => !p.isPublished);
  },
});

export const setPublished = mutation({
  args: { piperId: v.id("pipers"), isPublished: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.piperId, { isPublished: args.isPublished, updatedAt: Date.now() });
  },
});
