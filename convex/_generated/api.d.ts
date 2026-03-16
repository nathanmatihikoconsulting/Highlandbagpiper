/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as bagpipers from "../bagpipers.js";
import type * as bookings from "../bookings.js";
import type * as email from "../email.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as reviews from "../reviews.js";
import type * as router from "../router.js";
import type * as stripe from "../stripe.js";
import type * as stripeHelpers from "../stripeHelpers.js";
import type * as stripeWebhook from "../stripeWebhook.js";
import type * as userProfiles from "../userProfiles.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  bagpipers: typeof bagpipers;
  bookings: typeof bookings;
  email: typeof email;
  files: typeof files;
  http: typeof http;
  messages: typeof messages;
  notifications: typeof notifications;
  reviews: typeof reviews;
  router: typeof router;
  stripe: typeof stripe;
  stripeHelpers: typeof stripeHelpers;
  stripeWebhook: typeof stripeWebhook;
  userProfiles: typeof userProfiles;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
