"use node";

import { Resend } from "resend";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";

const FROM = "Highland Bagpiper <bookings@highlandbagpiper.io>";
const ADMIN_BCC = "nathanmatihikoconsulting@gmail.com";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY environment variable is not set in Convex");
  return new Resend(key);
}

async function deliver(to: string, subject: string, html: string) {
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    bcc: ADMIN_BCC,
    subject,
    html,
  });
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
}

// ---------------------------------------------------------------------------
// HTML template helpers
// ---------------------------------------------------------------------------

function emailTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#EFEAE7;font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:600px;margin:0 auto;">

    <!-- Header -->
    <div style="background:#1F3A2E;padding:24px 32px;">
      <span style="color:white;font-size:22px;font-weight:600;letter-spacing:0.5px;">
        Highland Bagpiper
      </span>
    </div>

    <!-- Body -->
    <div style="padding:32px;background:#EFEAE7;">
      <h2 style="color:#1E1E1E;margin-top:0;font-size:20px;">${title}</h2>
      ${body}
      <p style="margin-top:32px;">
        <a href="https://highlandbagpiper.io"
           style="background:#1F3A2E;color:white;padding:12px 24px;text-decoration:none;
                  border-radius:4px;display:inline-block;font-size:14px;font-family:Arial,sans-serif;">
          Open Highland Bagpiper
        </a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#1E1E1E;padding:16px 32px;">
      <p style="color:#999;font-size:12px;margin:0;font-family:Arial,sans-serif;">
        &copy; 2026 Highland Bagpiper &middot; Connecting tradition with celebration
      </p>
    </div>

  </div>
</body>
</html>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 16px;color:#666;white-space:nowrap;vertical-align:top;
               font-size:14px;font-family:Arial,sans-serif;border-bottom:1px solid #e8e4e0;">
      ${label}
    </td>
    <td style="padding:10px 16px;color:#1E1E1E;font-weight:600;vertical-align:top;
               font-size:14px;font-family:Arial,sans-serif;border-bottom:1px solid #e8e4e0;">
      ${value}
    </td>
  </tr>`;
}

function detailTable(rows: string[]): string {
  return `<table style="width:100%;border-collapse:collapse;margin:20px 0;
                         background:white;border-radius:6px;overflow:hidden;">
    ${rows.join("")}
  </table>`;
}

// ---------------------------------------------------------------------------
// Exported internal actions
// ---------------------------------------------------------------------------

/**
 * Notify the piper that a new booking enquiry has arrived.
 * Scheduled from createBooking mutation.
 */
export const bookingEnquiryToPiper = internalAction({
  args: {
    piperEmail: v.string(),
    piperName: v.string(),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    eventType: v.string(),
    eventDate: v.string(),
    eventTime: v.string(),
    location: v.string(),
    specialRequests: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const rows = [
      detailRow("Event type", args.eventType),
      detailRow("Date", args.eventDate),
      detailRow("Time", args.eventTime),
      detailRow("Location", args.location),
      detailRow("Customer name", args.customerName),
      detailRow("Customer email", args.customerEmail),
      detailRow("Customer phone", args.customerPhone),
      ...(args.specialRequests ? [detailRow("Special requests", args.specialRequests)] : []),
    ];

    const body = `
      <p style="color:#444;font-family:Arial,sans-serif;">Hi ${args.piperName},</p>
      <p style="color:#444;font-family:Arial,sans-serif;">
        You have received a new booking enquiry. Here are the details:
      </p>
      ${detailTable(rows)}
      <p style="color:#444;font-family:Arial,sans-serif;">
        Log in to Highland Bagpiper to respond to this enquiry and begin the conversation.
      </p>`;

    await deliver(
      args.piperEmail,
      `New enquiry from ${args.customerName} — ${args.eventType}`,
      emailTemplate("New Booking Enquiry", body),
    );
  },
});

/**
 * Confirm to the customer that their enquiry has been sent.
 * Scheduled from createBooking mutation.
 */
export const bookingConfirmationToCustomer = internalAction({
  args: {
    customerEmail: v.string(),
    customerName: v.string(),
    piperName: v.string(),
    eventType: v.string(),
    eventDate: v.string(),
    eventTime: v.string(),
    location: v.string(),
  },
  handler: async (_ctx, args) => {
    const rows = [
      detailRow("Piper", args.piperName),
      detailRow("Event type", args.eventType),
      detailRow("Date", args.eventDate),
      detailRow("Time", args.eventTime),
      detailRow("Location", args.location),
    ];

    const body = `
      <p style="color:#444;font-family:Arial,sans-serif;">Hi ${args.customerName},</p>
      <p style="color:#444;font-family:Arial,sans-serif;">
        Your enquiry has been sent to <strong>${args.piperName}</strong>.
        They will review your request and be in touch shortly.
      </p>
      ${detailTable(rows)}
      <p style="color:#444;font-family:Arial,sans-serif;">
        You can track the status of your booking and message ${args.piperName}
        directly from your dashboard.
      </p>`;

    await deliver(
      args.customerEmail,
      `Your enquiry to ${args.piperName} has been sent`,
      emailTemplate("Booking Enquiry Sent", body),
    );
  },
});

/**
 * Notify the customer when the piper updates the booking status.
 * Scheduled from updateBookingStatus mutation.
 */
export const statusUpdateToCustomer = internalAction({
  args: {
    customerEmail: v.string(),
    customerName: v.string(),
    piperName: v.string(),
    eventType: v.string(),
    eventDate: v.string(),
    newStatus: v.string(),
  },
  handler: async (_ctx, args) => {
    const statusLabels: Record<string, { label: string; message: string }> = {
      confirmed: {
        label: "Confirmed",
        message: `${args.piperName} has confirmed your booking. We look forward to your event!`,
      },
      quoted: {
        label: "Quote Received",
        message: `${args.piperName} has sent you a quote. Log in to review and accept it.`,
      },
      accepted: {
        label: "Accepted",
        message: `${args.piperName} has accepted your booking request.`,
      },
      deposit_paid: {
        label: "Deposit Paid",
        message: "Your deposit has been received. Your booking is secured.",
      },
      completed: {
        label: "Completed",
        message: `Thank you for booking with ${args.piperName}. We hope your event was memorable. You can now leave a review.`,
      },
      cancelled: {
        label: "Cancelled",
        message: `Unfortunately your booking with ${args.piperName} has been cancelled. Please contact us if you need assistance.`,
      },
      disputed: {
        label: "Under Review",
        message: "Your booking has been flagged for review. Our team will be in touch.",
      },
    };

    const { label, message } = statusLabels[args.newStatus] ?? {
      label: args.newStatus,
      message: `Your booking status has been updated to "${args.newStatus}".`,
    };

    const rows = [
      detailRow("Piper", args.piperName),
      detailRow("Event", args.eventType),
      detailRow("Date", args.eventDate),
      detailRow("New status", label),
    ];

    const body = `
      <p style="color:#444;font-family:Arial,sans-serif;">Hi ${args.customerName},</p>
      <p style="color:#444;font-family:Arial,sans-serif;">${message}</p>
      ${detailTable(rows)}`;

    await deliver(
      args.customerEmail,
      `Booking update: ${label} — ${args.piperName}`,
      emailTemplate(`Booking ${label}`, body),
    );
  },
});
