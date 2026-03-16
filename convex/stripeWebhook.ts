import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

/** Stripe webhook endpoint — receives POST from Stripe, delegates to Node.js action for verification. */
export const handleStripeWebhook = httpAction(async (ctx, request) => {
  const sig = request.headers.get("stripe-signature");
  if (!sig) return new Response("Missing stripe-signature header", { status: 400 });

  const body = await request.text();

  try {
    await ctx.runAction(internal.stripe.processWebhookEvent, { body, signature: sig });
  } catch (err: any) {
    return new Response(err.message ?? "Webhook error", { status: 400 });
  }

  return new Response(null, { status: 200 });
});
