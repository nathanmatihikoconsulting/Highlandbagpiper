import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

/** Verify the current user is either the customer or the piper for a booking. */
async function assertBookingParticipant(ctx: any, bookingId: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Must be logged in");

  const booking = await ctx.db.get(bookingId);
  if (!booking) throw new Error("Booking not found");

  const bagpiper = await ctx.db.get(booking.bagpiperId);
  const isCustomer = booking.customerId === userId;
  const isPiper = bagpiper?.userId === userId;

  if (!isCustomer && !isPiper) throw new Error("Not authorised to access this booking");

  return { userId, booking, bagpiper };
}

// ---------------------------------------------------------------------------

export const sendMessage = mutation({
  args: {
    bookingId: v.id("bookings"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await assertBookingParticipant(ctx, args.bookingId);

    const trimmed = args.content.trim();
    if (!trimmed) throw new Error("Message cannot be empty");

    const messageId = await ctx.db.insert("messages", {
      bookingId: args.bookingId,
      senderId: userId,
      content: trimmed,
      createdAt: Date.now(),
    });

    // Notify the other participant
    const { booking, bagpiper } = await assertBookingParticipant(ctx, args.bookingId);
    const recipientId =
      userId === booking.customerId ? bagpiper?.userId : booking.customerId;
    if (recipientId) {
      const senderUser = await ctx.db.get(userId);
      const senderName =
        (senderUser as any)?.name ?? (senderUser as any)?.email ?? "Someone";
      await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
        userId: recipientId,
        type: "new_message",
        title: "New message",
        message: `${senderName}: ${trimmed.length > 60 ? trimmed.slice(0, 60) + "…" : trimmed}`,
      });
    }

    return messageId;
  },
});

export const getMessages = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) return [];

    const bagpiper = await ctx.db.get(booking.bagpiperId);
    const isCustomer = booking.customerId === userId;
    const isPiper = bagpiper?.userId === userId;
    if (!isCustomer && !isPiper) return [];

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_bookingId", (q) => q.eq("bookingId", args.bookingId))
      .order("asc")
      .collect();

    return await Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        const senderName =
          (sender as any)?.name ??
          (sender as any)?.email ??
          "User";
        return {
          ...msg,
          senderName,
          isOwn: msg.senderId === userId,
        };
      })
    );
  },
});

/** Mark all messages in a booking as read where the sender is not the current user. */
export const markMessagesRead = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_bookingId", (q) => q.eq("bookingId", args.bookingId))
      .collect();

    const now = Date.now();
    await Promise.all(
      messages
        .filter((msg) => msg.senderId !== userId && !msg.readAt)
        .map((msg) => ctx.db.patch(msg._id, { readAt: now }))
    );
  },
});

/** Total unread message count for the current user — used for the nav badge. */
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    // Collect all booking IDs the user is involved in
    const customerBookings = await ctx.db
      .query("bookings")
      .withIndex("by_customer", (q) => q.eq("customerId", userId))
      .collect();

    const bagpiper = await ctx.db
      .query("bagpipers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const piperBookings = bagpiper
      ? await ctx.db
          .query("bookings")
          .withIndex("by_bagpiper", (q) => q.eq("bagpiperId", bagpiper._id))
          .collect()
      : [];

    const bookingIds = new Set([
      ...customerBookings.map((b) => b._id),
      ...piperBookings.map((b) => b._id),
    ]);

    let unread = 0;
    for (const bookingId of bookingIds) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_bookingId", (q) => q.eq("bookingId", bookingId))
        .collect();
      unread += messages.filter((m) => m.senderId !== userId && !m.readAt).length;
    }
    return unread;
  },
});
