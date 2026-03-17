"use node";

import { v } from "convex/values";
import Stripe from "stripe";
import { action, internalAction } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-02-25.clover" });
}

// ─── Piper: Connect onboarding ────────────────────────────────────────────────

export const createConnectAccountLink = action({
  args: { returnUrl: v.string(), refreshUrl: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    const profile = await ctx.runQuery(api.bagpipers.getMyProfile);
    if (!profile) throw new Error("Piper profile not found");

    const stripe = getStripe();
    let accountId = profile.stripeAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({ type: "express" });
      accountId = account.id;
      await ctx.runMutation(internal.stripeHelpers.saveStripeAccountId, {
        bagpiperId: profile._id,
        stripeAccountId: accountId,
      });
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: args.refreshUrl,
      return_url: args.returnUrl,
      type: "account_onboarding",
    });

    return { url: link.url };
  },
});

// ─── Customer: Deposit checkout ───────────────────────────────────────────────

export const createCheckoutSession = action({
  args: {
    bookingId: v.id("bookings"),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  returns: v.object({ url: v.string() }),
  handler: async (ctx, args): Promise<{ url: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    const booking = await ctx.runQuery(internal.bookings.getBookingForPayment, {
      bookingId: args.bookingId,
    });
    if (!booking) throw new Error("Booking not found");
    if (booking.customerId !== userId) throw new Error("Not your booking");
    if (booking.status !== "accepted") throw new Error("Booking must be accepted before payment");

    const piper = await ctx.runQuery(internal.bagpipers.getBagpiperForPayment, {
      bagpiperId: booking.bagpiperId,
    });
    if (!piper?.stripeAccountId) {
      throw new Error("Piper has not connected Stripe yet — please contact them to arrange payment");
    }

    // Use quote totals if available, otherwise fall back to booking.totalAmount
    const baseFee: number = booking.quote ? (booking.quote as any).totalFee : booking.totalAmount;
    const currency: string = booking.quote ? (booking.quote as any).currency.toLowerCase() : "nzd";
    const totalAmount: number = baseFee * 1.05;
    const applicationFee: number = baseFee * 0.05;

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: booking.eventType,
              description: `${piper.name} · ${booking.eventDate}`,
            },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(applicationFee * 100),
        transfer_data: { destination: piper.stripeAccountId },
      },
      metadata: { bookingId: args.bookingId },
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
    });

    return { url: session.url! };
  },
});

// ─── Webhook processor (called by stripeWebhook.ts httpAction) ────────────────

export const processWebhookEvent = internalAction({
  args: { body: v.string(), signature: v.string() },
  handler: async (ctx, args) => {
    const stripe = getStripe();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        args.body,
        args.signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      throw new Error(`Webhook verification failed: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (bookingId && session.payment_status === "paid") {
        await ctx.runMutation(internal.stripeHelpers.markPaid, {
          bookingId: bookingId as any,
          amountPaid: (session.amount_total ?? 0) / 100,
          stripePaymentIntentId: (session.payment_intent as string) ?? "",
        });
      }
    }

    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      if (account.charges_enabled) {
        await ctx.runMutation(internal.stripeHelpers.markStripeConnected, {
          stripeAccountId: account.id,
        });
      }
    }
  },
});
