import { httpRouter } from "convex/server";
import { handleStripeWebhook } from "./stripeWebhook";

const http = httpRouter();

http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: handleStripeWebhook,
});

export default http;
