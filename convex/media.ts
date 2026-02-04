import { query } from "convex/server";
import { v } from "convex/values";

export const listForPiper = query({
  args: { piperId: v.id("pipers") },
  handler: async (ctx, { piperId }) => {
    return await ctx.db.query("media").withIndex("by_piperId", (q) => q.eq("piperId", piperId)).collect();
  },
});
