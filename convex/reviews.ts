import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const createReview = mutation({
  args: {
    bookingId: v.id("bookings"),
    rating: v.number(),
    title: v.optional(v.string()),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in to leave a review");

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.customerId !== userId) throw new Error("Not authorized to review this booking");
    if (booking.status !== "completed") throw new Error("Can only review completed bookings");

    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .unique();
    if (existing) throw new Error("Review already exists for this booking");

    await ctx.db.insert("reviews", {
      bookingId: args.bookingId,
      customerId: userId,
      bagpiperId: booking.bagpiperId,
      rating: args.rating,
      title: args.title,
      comment: args.comment,
      customerName: booking.customerName,
      createdAt: Date.now(),
    });

    await updateBagpiperRating(ctx, booking.bagpiperId);

    // Notify the piper
    const bagpiper = await ctx.db.get(booking.bagpiperId);
    if (bagpiper) {
      await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
        userId: bagpiper.userId,
        type: "review_received",
        title: "New review received",
        message: `${booking.customerName} left you a ${args.rating}-star review.`,
      });
    }
  },
});

/** Piper adds or updates their response to a review. */
export const replyToReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    response: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review not found");

    const bagpiper = await ctx.db.get(review.bagpiperId);
    if (!bagpiper || bagpiper.userId !== userId)
      throw new Error("Not authorised to reply to this review");

    await ctx.db.patch(args.reviewId, { response: args.response.trim() });
  },
});

/** Returns the review for a specific booking, or null if none yet. */
export const getBookingReview = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .unique();
  },
});

export const getBagpiperReviews = query({
  args: { bagpiperId: v.id("bagpipers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_bagpiper", (q) => q.eq("bagpiperId", args.bagpiperId))
      .order("desc")
      .collect();
  },
});

async function updateBagpiperRating(ctx: any, bagpiperId: any) {
  const reviews = await ctx.db
    .query("reviews")
    .withIndex("by_bagpiper", (q: any) => q.eq("bagpiperId", bagpiperId))
    .collect();

  const totalRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  await ctx.db.patch(bagpiperId, {
    averageRating,
    totalReviews: reviews.length,
  });
}
