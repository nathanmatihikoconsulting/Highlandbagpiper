import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createBooking = mutation({
  args: {
    bagpiperId: v.id("bagpipers"),
    eventType: v.string(),
    eventDate: v.string(),
    eventTime: v.string(),
    duration: v.number(),
    location: v.string(),
    specialRequests: v.optional(v.string()),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create booking");
    }

    const bagpiper = await ctx.db.get(args.bagpiperId);
    if (!bagpiper) {
      throw new Error("Bagpiper not found");
    }

    // Calculate amounts
    const subtotal = bagpiper.hourlyRate * args.duration;
    const platformFee = subtotal * 0.05; // 5% platform fee
    const totalAmount = subtotal + platformFee;
    const bagpiperAmount = subtotal;

    return await ctx.db.insert("bookings", {
      customerId: userId,
      bagpiperId: args.bagpiperId,
      eventType: args.eventType,
      eventDate: args.eventDate,
      eventTime: args.eventTime,
      duration: args.duration,
      location: args.location,
      specialRequests: args.specialRequests,
      totalAmount,
      platformFee,
      bagpiperAmount,
      status: "pending",
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
    });
  },
});

export const getMyBookings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_customer", (q) => q.eq("customerId", userId))
      .collect();

    return await Promise.all(
      bookings.map(async (booking) => {
        const bagpiper = await ctx.db.get(booking.bagpiperId);
        return {
          ...booking,
          bagpiper,
        };
      })
    );
  },
});

export const getBagpiperBookings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Get bagpiper profile
    const bagpiper = await ctx.db
      .query("bagpipers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!bagpiper) {
      return [];
    }

    return await ctx.db
      .query("bookings")
      .withIndex("by_bagpiper", (q) => q.eq("bagpiperId", bagpiper._id))
      .collect();
  },
});

export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("paid"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Check if user is the bagpiper for this booking
    const bagpiper = await ctx.db.get(booking.bagpiperId);
    if (!bagpiper || bagpiper.userId !== userId) {
      throw new Error("Not authorized to update this booking");
    }

    await ctx.db.patch(args.bookingId, {
      status: args.status,
    });
  },
});

export const getBookingById = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) return null;

    const bagpiper = await ctx.db.get(booking.bagpiperId);
    return {
      ...booking,
      bagpiper,
    };
  },
});
