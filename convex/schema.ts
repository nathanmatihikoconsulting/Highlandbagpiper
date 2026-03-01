import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  bagpipers: defineTable({
    userId: v.id("users"),
    name: v.string(),
    bio: v.string(),
    location: v.string(),
    city: v.string(),
    country: v.string(),
    zipCode: v.string(),
    phone: v.string(),
    hourlyRate: v.number(),
    minimumBooking: v.number(), // in hours
    travelRadius: v.number(), // in miles
    profileImageId: v.optional(v.id("_storage")),
    youtubeVideos: v.array(v.string()), // YouTube video IDs
    specialties: v.array(v.string()), // weddings, funerals, etc.
    isActive: v.boolean(),
    stripeAccountId: v.optional(v.string()),
    averageRating: v.optional(v.number()),
    totalReviews: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_location", ["city", "country"])
    .index("by_active", ["isActive"])
    .searchIndex("search_bagpipers", {
      searchField: "name",
      filterFields: ["city", "country", "isActive"]
    }),

  bagpiperFiles: defineTable({
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
    isPublic: v.boolean(), // Whether customers can see this file
  })
    .index("by_bagpiper", ["bagpiperId"])
    .index("by_bagpiper_and_type", ["bagpiperId", "fileType"])
    .index("by_bagpiper_and_public", ["bagpiperId", "isPublic"]),

  bookings: defineTable({
    customerId: v.id("users"),
    bagpiperId: v.id("bagpipers"),
    eventType: v.string(),
    eventDate: v.string(),
    eventTime: v.string(),
    duration: v.number(), // in hours
    location: v.string(),
    specialRequests: v.optional(v.string()),
    totalAmount: v.number(),
    platformFee: v.number(),
    bagpiperAmount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("paid"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    stripePaymentIntentId: v.optional(v.string()),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
  })
    .index("by_customer", ["customerId"])
    .index("by_bagpiper", ["bagpiperId"])
    .index("by_status", ["status"]),

  reviews: defineTable({
    bookingId: v.id("bookings"),
    customerId: v.id("users"),
    bagpiperId: v.id("bagpipers"),
    rating: v.number(), // 1-5 stars
    comment: v.string(),
    customerName: v.string(),
  })
    .index("by_bagpiper", ["bagpiperId"])
    .index("by_booking", ["bookingId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
