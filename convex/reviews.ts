import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createReview = mutation({
  args: {
    bookingId: v.id("bookings"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to leave a review");
    }

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.customerId !== userId) {
      throw new Error("Not authorized to review this booking");
    }

    if (booking.status !== "completed") {
      throw new Error("Can only review completed bookings");
    }

    // Check if review already exists
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .unique();

    if (existingReview) {
      throw new Error("Review already exists for this booking");
    }

    // Create review
    await ctx.db.insert("reviews", {
      bookingId: args.bookingId,
      customerId: userId,
      bagpiperId: booking.bagpiperId,
      rating: args.rating,
      comment: args.comment,
      customerName: booking.customerName,
    });

    // Update bagpiper's average rating
    await updateBagpiperRating(ctx, booking.bagpiperId);
  },
});

async function updateBagpiperRating(ctx: any, bagpiperId: any) {
  const reviews = await ctx.db
    .query("reviews")
    .withIndex("by_bagpiper", (q: any) => q.eq("bagpiperId", bagpiperId))
    .collect();

  const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  await ctx.db.patch(bagpiperId, {
    averageRating,
    totalReviews: reviews.length,
  });
}

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
