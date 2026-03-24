import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const saveStripeAccountId = internalMutation({
  args: { bagpiperId: v.id("bagpipers"), stripeAccountId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bagpiperId, { stripeAccountId: args.stripeAccountId });
  },
});

const feeBreakdownValidator = v.object({
  piperBaseFee: v.number(),
  piperGst: v.number(),
  piperFeeIncGst: v.number(),
  platformFeeExGst: v.number(),
  platformGst: v.number(),
  platformFeeIncGst: v.number(),
  totalCharged: v.number(),
  piperGstRegistered: v.boolean(),
  platformFeeRate: v.number(),
});

export const markPaid = internalMutation({
  args: {
    bookingId: v.id("bookings"),
    amountPaid: v.number(),
    stripePaymentIntentId: v.string(),
    feeBreakdown: v.optional(feeBreakdownValidator),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) return;

    await ctx.db.patch(args.bookingId, {
      status: "paid",
      stripePaymentIntentId: args.stripePaymentIntentId,
      totalAmount: args.feeBreakdown?.totalCharged ?? args.amountPaid,
      platformFee: args.feeBreakdown?.platformFeeIncGst ?? 0,
      bagpiperAmount: args.feeBreakdown?.piperFeeIncGst ?? args.amountPaid,
      feeBreakdown: args.feeBreakdown,
      payment: {
        depositAmount: args.amountPaid,
        depositPaidAt: Date.now(),
        stripePaymentIntentId: args.stripePaymentIntentId,
      },
    });

    const piper = await ctx.db.get(booking.bagpiperId);
    if (piper) {
      await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
        userId: piper.userId,
        type: "booking_update",
        title: "Payment received!",
        message: `${booking.customerName} has paid in full for ${booking.eventType} on ${booking.eventDate}.`,
      });
    }
  },
});

export const markStripeConnected = internalMutation({
  args: { stripeAccountId: v.string() },
  handler: async (ctx, args) => {
    const pipers = await ctx.db.query("bagpipers").collect();
    const piper = pipers.find((p) => p.stripeAccountId === args.stripeAccountId);
    if (piper) {
      await ctx.db.patch(piper._id, { stripeChargesEnabled: true });
    }
  },
});
