import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const uploadFile = mutation({
  args: {
    bagpiperId: v.id("bagpipers"),
    fileId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.union(
      v.literal("audio"),
      v.literal("certificate"),
      v.literal("document"),
      v.literal("image")
    ),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    // Verify the bagpiper belongs to the user
    const bagpiper = await ctx.db.get(args.bagpiperId);
    if (!bagpiper || bagpiper.userId !== userId) {
      throw new Error("Not authorized to upload files for this bagpiper");
    }

    return await ctx.db.insert("bagpiperFiles", {
      bagpiperId: args.bagpiperId,
      fileId: args.fileId,
      fileName: args.fileName,
      fileType: args.fileType,
      description: args.description,
      isPublic: args.isPublic,
    });
  },
});

export const getBagpiperFiles = query({
  args: { 
    bagpiperId: v.id("bagpipers"),
    publicOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    // If publicOnly is true, only return public files
    // If false or undefined, check if user owns the bagpiper profile
    if (args.publicOnly) {
      const files = await ctx.db
        .query("bagpiperFiles")
        .withIndex("by_bagpiper_and_public", (q) => 
          q.eq("bagpiperId", args.bagpiperId).eq("isPublic", true)
        )
        .collect();

      return await Promise.all(
        files.map(async (file) => ({
          ...file,
          url: await ctx.storage.getUrl(file.fileId),
        }))
      );
    }

    // Check if user owns this bagpiper profile
    const bagpiper = await ctx.db.get(args.bagpiperId);
    if (!bagpiper || (userId && bagpiper.userId !== userId)) {
      // If not the owner, only return public files
      const files = await ctx.db
        .query("bagpiperFiles")
        .withIndex("by_bagpiper_and_public", (q) => 
          q.eq("bagpiperId", args.bagpiperId).eq("isPublic", true)
        )
        .collect();

      return await Promise.all(
        files.map(async (file) => ({
          ...file,
          url: await ctx.storage.getUrl(file.fileId),
        }))
      );
    }

    // User owns the profile, return all files
    const files = await ctx.db
      .query("bagpiperFiles")
      .withIndex("by_bagpiper", (q) => q.eq("bagpiperId", args.bagpiperId))
      .collect();

    return await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.fileId),
      }))
    );
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("bagpiperFiles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Verify the bagpiper belongs to the user
    const bagpiper = await ctx.db.get(file.bagpiperId);
    if (!bagpiper || bagpiper.userId !== userId) {
      throw new Error("Not authorized to delete this file");
    }

    // Delete the file record
    await ctx.db.delete(args.fileId);
    
    // Note: We don't delete from storage as other records might reference it
    // Convex will handle cleanup of unreferenced storage files
  },
});

export const updateFileVisibility = mutation({
  args: {
    fileId: v.id("bagpiperFiles"),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Verify the bagpiper belongs to the user
    const bagpiper = await ctx.db.get(file.bagpiperId);
    if (!bagpiper || bagpiper.userId !== userId) {
      throw new Error("Not authorized to update this file");
    }

    await ctx.db.patch(args.fileId, {
      isPublic: args.isPublic,
    });
  },
});
