import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createProfile = mutation({
  args: {
    name: v.string(),
    bio: v.string(),
    location: v.string(),
    city: v.string(),
    country: v.string(),
    zipCode: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    currency: v.optional(v.string()),
    hourlyRate: v.number(),
    minimumBooking: v.number(),
    travelRadius: v.number(),
    youtubeVideos: v.array(v.string()),
    specialties: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create profile");
    }

    // Check if profile already exists
    const existing = await ctx.db
      .query("bagpipers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      throw new Error("Profile already exists");
    }

    return await ctx.db.insert("bagpipers", {
      userId,
      ...args,
      isActive: true,
      totalReviews: 0,
    });
  },
});

export const updateProfile = mutation({
  args: {
    bagpiperId: v.id("bagpipers"),
    name: v.string(),
    bio: v.string(),
    location: v.string(),
    city: v.string(),
    country: v.string(),
    zipCode: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    currency: v.optional(v.string()),
    hourlyRate: v.number(),
    minimumBooking: v.number(),
    travelRadius: v.number(),
    youtubeVideos: v.array(v.string()),
    specialties: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const bagpiper = await ctx.db.get(args.bagpiperId);
    if (!bagpiper || bagpiper.userId !== userId) {
      throw new Error("Not authorized to update this profile");
    }

    const { bagpiperId, ...updates } = args;
    await ctx.db.patch(bagpiperId, updates);
  },
});

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const profile = await ctx.db
      .query("bagpipers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      return null;
    }

    return {
      ...profile,
      profileImageUrl: profile.profileImageId
        ? await ctx.storage.getUrl(profile.profileImageId)
        : null,
    };
  },
});

export const searchBagpipers = query({
  args: {
    searchTerm: v.optional(v.string()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    specialty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let bagpipers;

    if (args.searchTerm) {
      bagpipers = await ctx.db
        .query("bagpipers")
        .withSearchIndex("search_bagpipers", (q) => {
          let searchQuery = q.search("name", args.searchTerm!);
          if (args.city) searchQuery = searchQuery.eq("city", args.city);
          if (args.country) {
            // Try to match both country and state fields for backward compatibility
            searchQuery = searchQuery.eq("country", args.country);
          }
          return searchQuery.eq("isActive", true);
        })
        .collect();
    } else {
      bagpipers = await ctx.db
        .query("bagpipers")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .collect();
    }

    // Filter by city if provided
    if (args.city) {
      bagpipers = bagpipers.filter(bagpiper =>
        bagpiper.city.toLowerCase().includes(args.city!.toLowerCase())
      );
    }

    // Filter by country if provided
    if (args.country) {
      bagpipers = bagpipers.filter(bagpiper =>
        bagpiper.country === args.country
      );
    }

    // Filter by specialty if provided
    let filteredBagpipers = bagpipers;
    if (args.specialty) {
      filteredBagpipers = bagpipers.filter(bagpiper =>
        bagpiper.specialties.includes(args.specialty!)
      );
    }

    // Get profile images
    return await Promise.all(
      filteredBagpipers.map(async (bagpiper) => ({
        ...bagpiper,
        profileImageUrl: bagpiper.profileImageId
          ? await ctx.storage.getUrl(bagpiper.profileImageId)
          : null,
      }))
    );
  },
});

export const getLocations = query({
  args: {},
  handler: async (ctx) => {
    const bagpipers = await ctx.db
      .query("bagpipers")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const cities = [...new Set(bagpipers.map((b) => b.city).filter(Boolean))].sort();
    const countries = [...new Set(bagpipers.map((b) => b.country).filter(Boolean))].sort();

    return { cities, countries };
  },
});

export const getBagpiperById = query({
  args: { bagpiperId: v.id("bagpipers") },
  handler: async (ctx, args) => {
    const bagpiper = await ctx.db.get(args.bagpiperId);
    if (!bagpiper) return null;

    return {
      ...bagpiper,
      profileImageUrl: bagpiper.profileImageId
        ? await ctx.storage.getUrl(bagpiper.profileImageId)
        : null,
    };
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateProfileImage = mutation({
  args: {
    bagpiperId: v.id("bagpipers"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const bagpiper = await ctx.db.get(args.bagpiperId);
    if (!bagpiper || bagpiper.userId !== userId) {
      throw new Error("Not authorized to update this profile");
    }

    await ctx.db.patch(args.bagpiperId, {
      profileImageId: args.storageId,
    });
  },
});
