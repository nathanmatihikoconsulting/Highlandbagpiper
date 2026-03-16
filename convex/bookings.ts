import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const getBookingForPayment = internalQuery({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => ctx.db.get(args.bookingId),
});

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
    // Rich venue details
    venueName: v.optional(v.string()),
    guestCount: v.optional(v.number()),
    indoorOutdoor: v.optional(v.string()),
    // Music preferences
    tuneRequests: v.optional(v.string()),
    musicGenre: v.optional(v.string()),
    musicNotes: v.optional(v.string()),
    // Dress
    dressPreference: v.optional(v.string()),
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

    const tunes = args.tuneRequests
      ? args.tuneRequests.split(/[\n,]+/).map((t) => t.trim()).filter(Boolean)
      : undefined;

    const bookingId = await ctx.db.insert("bookings", {
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
      eventDetails: {
        type: args.eventType,
        date: args.eventDate,
        time: args.eventTime,
        venue: {
          name: args.venueName,
          address: args.location,
          indoorOutdoor: args.indoorOutdoor,
        },
        guestCount: args.guestCount,
      },
      musicPreferences: (tunes || args.musicGenre || args.musicNotes) ? {
        tunes,
        genre: args.musicGenre,
        notes: args.musicNotes,
      } : undefined,
      dressPreference: args.dressPreference,
    });

    // Prefer the piper's explicit contact email; fall back to their auth account email
    let piperEmail: string | undefined = bagpiper.email;
    if (!piperEmail) {
      const piperUser = await ctx.db.get(bagpiper.userId);
      piperEmail = (piperUser as any)?.email as string | undefined;
    }

    // Email the piper about the new enquiry (only if email is available)
    if (piperEmail) {
      await ctx.scheduler.runAfter(0, internal.email.bookingEnquiryToPiper, {
        piperEmail,
        piperName: bagpiper.name,
        customerName: args.customerName,
        customerEmail: args.customerEmail,
        customerPhone: args.customerPhone,
        eventType: args.eventType,
        eventDate: args.eventDate,
        eventTime: args.eventTime,
        location: args.location,
        specialRequests: args.specialRequests,
      });
    }

    // Email the customer a confirmation
    await ctx.scheduler.runAfter(0, internal.email.bookingConfirmationToCustomer, {
      customerEmail: args.customerEmail,
      customerName: args.customerName,
      piperName: bagpiper.name,
      eventType: args.eventType,
      eventDate: args.eventDate,
      eventTime: args.eventTime,
      location: args.location,
    });

    // In-app notification to the piper
    await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
      userId: bagpiper.userId,
      type: "new_booking",
      title: "New booking enquiry",
      message: `${args.customerName} has sent an enquiry for a ${args.eventType} on ${args.eventDate}.`,
    });

    return bookingId;
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
      v.literal("enquiry"),
      v.literal("quoted"),
      v.literal("accepted"),
      v.literal("deposit_paid"),
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("paid"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("disputed")
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

    // Only the piper for this booking can update status
    const bagpiper = await ctx.db.get(booking.bagpiperId);
    if (!bagpiper || bagpiper.userId !== userId) {
      throw new Error("Not authorized to update this booking");
    }

    await ctx.db.patch(args.bookingId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // Email the customer about the status change
    await ctx.scheduler.runAfter(0, internal.email.statusUpdateToCustomer, {
      customerEmail: booking.customerEmail,
      customerName: booking.customerName,
      piperName: bagpiper.name,
      eventType: booking.eventType,
      eventDate: booking.eventDate,
      newStatus: args.status,
    });

    // In-app notification to the customer
    const statusLabel = args.status.replace(/_/g, " ");
    await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
      userId: booking.customerId,
      type: "booking_update",
      title: "Booking status updated",
      message: `Your ${booking.eventType} booking with ${bagpiper.name} is now ${statusLabel}.`,
    });
  },
});

/** Piper submits a quote for a booking. Sets status → "quoted". */
export const submitQuote = mutation({
  args: {
    bookingId: v.id("bookings"),
    performanceFee: v.number(),
    travelFee: v.optional(v.number()),
    accommodationFee: v.optional(v.number()),
    currency: v.string(),
    notes: v.optional(v.string()),
    validUntil: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    const bagpiper = await ctx.db.get(booking.bagpiperId);
    if (!bagpiper || bagpiper.userId !== userId)
      throw new Error("Not authorised to quote this booking");

    const totalFee =
      args.performanceFee +
      (args.travelFee ?? 0) +
      (args.accommodationFee ?? 0);

    await ctx.db.patch(args.bookingId, {
      status: "quoted",
      updatedAt: Date.now(),
      quote: {
        performanceFee: args.performanceFee,
        travelFee: args.travelFee,
        accommodationFee: args.accommodationFee,
        totalFee,
        currency: args.currency,
        notes: args.notes,
        validUntil: args.validUntil,
      },
    });

    // Notify the customer
    await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
      userId: booking.customerId,
      type: "quote_received",
      title: "Quote received",
      message: `${bagpiper.name} has sent a quote of ${args.currency} ${totalFee.toFixed(2)} for your ${booking.eventType}.`,
    });
  },
});

/** Customer accepts or declines a quote. */
export const respondToQuote = mutation({
  args: {
    bookingId: v.id("bookings"),
    accept: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in");

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.customerId !== userId)
      throw new Error("Not authorised to respond to this quote");
    if (booking.status !== "quoted")
      throw new Error("No active quote to respond to");

    const newStatus = args.accept ? "accepted" : "cancelled";
    await ctx.db.patch(args.bookingId, {
      status: newStatus,
      updatedAt: Date.now(),
    });

    const bagpiper = await ctx.db.get(booking.bagpiperId);
    if (bagpiper) {
      await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
        userId: bagpiper.userId,
        type: "booking_update",
        title: args.accept ? "Quote accepted" : "Quote declined",
        message: args.accept
          ? `${booking.customerName} has accepted your quote for the ${booking.eventType} on ${booking.eventDate}.`
          : `${booking.customerName} has declined your quote for the ${booking.eventType} on ${booking.eventDate}.`,
      });
    }
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
