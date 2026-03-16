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
    email: v.optional(v.string()), // contact email for booking notifications
    hourlyRate: v.number(),
    minimumBooking: v.number(), // in hours
    travelRadius: v.number(), // in kms
    profileImageId: v.optional(v.id("_storage")),
    youtubeVideos: v.array(v.string()), // YouTube video IDs
    specialties: v.array(v.string()), // weddings, funerals, etc.
    isActive: v.boolean(),
    currency: v.optional(v.string()), // preferred payment currency e.g. "NZD"
    stripeAccountId: v.optional(v.string()),
    averageRating: v.optional(v.number()),
    totalReviews: v.number(),
    // Enhanced fields
    pricing: v.optional(v.object({
      baseFee: v.number(),
      currency: v.string(),
      travelRatePerKm: v.optional(v.number()),
      additionalCosts: v.optional(v.string()),
    })),
    availability: v.optional(v.object({
      blackoutDates: v.optional(v.array(v.string())),
    })),
    verified: v.optional(v.boolean()),
    stripeChargesEnabled: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_location", ["city", "country"])
    .index("by_active", ["isActive"])
    .searchIndex("search_bagpipers", {
      searchField: "name",
      filterFields: ["city", "country", "isActive"],
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
    isPublic: v.boolean(),
  })
    .index("by_bagpiper", ["bagpiperId"])
    .index("by_bagpiper_and_type", ["bagpiperId", "fileType"])
    .index("by_bagpiper_and_public", ["bagpiperId", "isPublic"]),

  bookings: defineTable({
    // Existing core fields
    customerId: v.id("users"),
    bagpiperId: v.id("bagpipers"),
    eventType: v.string(),
    eventDate: v.string(),
    eventTime: v.string(),
    duration: v.number(), // in hours (legacy)
    location: v.string(),
    specialRequests: v.optional(v.string()),
    totalAmount: v.number(),
    platformFee: v.number(),
    bagpiperAmount: v.number(),
    status: v.union(
      v.literal("enquiry"),
      v.literal("quoted"),
      v.literal("accepted"),
      v.literal("deposit_paid"),
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("paid"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("disputed")
    ),
    stripePaymentIntentId: v.optional(v.string()),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    // Rich event details
    eventDetails: v.optional(v.object({
      type: v.optional(v.string()),
      date: v.optional(v.string()),
      time: v.optional(v.string()),
      endTime: v.optional(v.string()),
      duration: v.optional(v.number()), // in minutes
      venue: v.optional(v.object({
        name: v.optional(v.string()),
        address: v.optional(v.string()),
        city: v.optional(v.string()),
        region: v.optional(v.string()),
        country: v.optional(v.string()),
        indoorOutdoor: v.optional(v.string()),
      })),
      guestCount: v.optional(v.number()),
      specialRequirements: v.optional(v.string()),
    })),
    musicPreferences: v.optional(v.object({
      tunes: v.optional(v.array(v.string())),
      genre: v.optional(v.string()),
      notes: v.optional(v.string()),
    })),
    dressPreference: v.optional(v.string()),
    quote: v.optional(v.object({
      performanceFee: v.number(),
      travelFee: v.optional(v.number()),
      accommodationFee: v.optional(v.number()),
      totalFee: v.number(),
      currency: v.string(),
      notes: v.optional(v.string()),
      validUntil: v.optional(v.string()),
    })),
    payment: v.optional(v.object({
      depositAmount: v.optional(v.number()),
      depositPaidAt: v.optional(v.number()),
      finalAmount: v.optional(v.number()),
      finalPaidAt: v.optional(v.number()),
      stripePaymentIntentId: v.optional(v.string()),
      stripeTransferId: v.optional(v.string()),
    })),
    updatedAt: v.optional(v.number()),
  })
    .index("by_customer", ["customerId"])
    .index("by_bagpiper", ["bagpiperId"])
    .index("by_status", ["status"]),

  reviews: defineTable({
    // Existing fields
    bookingId: v.id("bookings"),
    customerId: v.id("users"),
    bagpiperId: v.id("bagpipers"),
    rating: v.number(), // 1-5 stars
    comment: v.string(),
    customerName: v.string(),
    // New fields
    title: v.optional(v.string()),
    response: v.optional(v.string()), // piper's reply
    createdAt: v.optional(v.number()),
  })
    .index("by_bagpiper", ["bagpiperId"])
    .index("by_booking", ["bookingId"]),

  messages: defineTable({
    bookingId: v.id("bookings"),
    senderId: v.id("users"),
    content: v.string(),
    attachmentIds: v.optional(v.array(v.id("_storage"))),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_bookingId", ["bookingId"])
    .index("by_senderId", ["senderId"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("piper"), v.literal("hirer")),
  }).index("by_user", ["userId"]),

  // Note: by_userId_unread is implemented in query handlers by filtering readAt === undefined
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(), // "new_enquiry" | "new_message" | "quote_received" | "booking_confirmed" | "review_received"
    title: v.string(),
    message: v.string(),
    linkTo: v.optional(v.string()), // relative URL path
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_createdAt", ["userId", "createdAt"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
