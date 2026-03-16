import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const saveStripeAccountId = internalMutation({
  args: { bagpiperId: v.id("bagpipers"), stripeAccountId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bagpiperId, { stripeAccountId: args.stripeAccountId });
  },
});

export const markDepositPaid = internalMutation({
  args: {
    bookingId: v.id("bookings"),
    amountPaid: v.number(),
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) return;

    await ctx.db.patch(args.bookingId, {
      status: "deposit_paid",
      stripePaymentIntentId: args.stripePaymentIntentId,
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
        type: "deposit_paid",
        title: "Deposit received!",
        message: `${booking.customerName} paid a ${args.amountPaid.toFixed(2)} deposit for ${booking.eventType} on ${booking.eventDate}.`,
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
