import { components } from "./_generated/api";
import { Resend } from "@convex-dev/resend";
import { internalMutation } from "./_generated/server";

export const resend: Resend = new Resend(components.resend, {
  testMode:false,
});

export const sendTestEmail = internalMutation({
  handler: async (ctx) => {
    await resend.sendEmail(ctx, {
      from: "HighlandBagpipers <nathanmatihikoconsulting@gmail.com>",
      to: "nathanmatihikoconsulting@gmail.com",
      subject: "Hi there",
      html: "This is a test email",
    });
  },
});