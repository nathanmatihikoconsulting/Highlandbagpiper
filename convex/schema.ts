import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    role: v.union(v.literal("piper"), v.literal("admin")),
    createdAt: v.number(),
  }).index("by_clerkUserId", ["clerkUserId"]),

  pipers: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    baseLocation: v.string(),
    bio: v.optional(v.string()),
    contactEmail: v.string(),

    fromPriceNZD: v.optional(v.number()),
    services: v.optional(v.array(v.object({
      name: v.string(),
      desc: v.string(),
      fromPriceNZD: v.optional(v.number()),
    }))),
    repertoireGroups: v.optional(v.array(v.object({
      title: v.string(),
      items: v.array(v.string()),
    }))),
    travelNotes: v.optional(v.string()),

    photoFileId: v.optional(v.id("_storage")),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_published", ["isPublished"])
    .index("by_published_location", ["isPublished", "baseLocation"]),

  media: defineTable({
    piperId: v.id("pipers"),
    type: v.union(v.literal("audio"), v.literal("video")),
    title: v.string(),
    fileId: v.id("_storage"),
    createdAt: v.number(),
  }).index("by_piperId", ["piperId"]),

  enquiries: defineTable({
    piperId: v.id("pipers"),
    eventType: v.string(),
    eventDate: v.string(),
    eventTime: v.string(),
    location: v.string(),
    message: v.string(),
    clientName: v.string(),
    clientEmail: v.string(),
    clientPhone: v.string(),
    status: v.union(v.literal("pending_verification"), v.literal("sent"), v.literal("closed")),
    createdAt: v.number(),
  }).index("by_piperId", ["piperId"]),

  emailVerifications: defineTable({
    enquiryId: v.id("enquiries"),
    email: v.string(),
    codeHash: v.string(),
    expiresAt: v.number(),
    attempts: v.number(),
    createdAt: v.number(),
  }).index("by_enquiryId", ["enquiryId"]),
});
