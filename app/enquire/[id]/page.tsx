"use client";
import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EVENT_TYPES } from "@/lib/constants";

export default function Enquire({ params }: { params: { id: string } }) {
  const [step, setStep] = useState<"form"|"verify">("form");
  const [enquiryId, setEnquiryId] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [code, setCode] = useState("");

  const createPending = useMutation(api.enquiries.createPending);
  const sendCode = useAction(api.enquiries.sendVerificationCode);
  const verify = useMutation(api.enquiries.verifyCodeAndMarkSent);
  const notifyPiper = useAction(api.enquiries.notifyPiper);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      piperId: params.id as any,
      eventType: String(fd.get("eventType") || ""),
      eventDate: String(fd.get("eventDate") || ""),
      eventTime: String(fd.get("eventTime") || ""),
      location: String(fd.get("location") || ""),
      message: String(fd.get("message") || ""),
      clientName: String(fd.get("clientName") || ""),
      clientEmail: String(fd.get("clientEmail") || ""),
      clientPhone: String(fd.get("clientPhone") || ""),
      turnstileToken: String(fd.get("turnstileToken") || ""),
    };

    const id = await createPending(payload as any);
    setEnquiryId(id);
    setClientEmail(payload.clientEmail);
    await sendCode({ enquiryId: id, email: payload.clientEmail });
    setStep("verify");
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    await verify({ enquiryId: enquiryId as any, code });
    await notifyPiper({ enquiryId: enquiryId as any });
    alert("Enquiry sent. The piper will contact you directly.");
    window.location.href = "/pipers/" + params.id;
  }

  return (
    <main className="container">
      <h1>Send an enquiry</h1>

      {step === "form" && (
        <form className="card" onSubmit={onSubmit}>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label className="label">Event type</label>
              <select className="select" name="eventType" required defaultValue="">
                <option value="" disabled>Select</option>
                {EVENT_TYPES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input className="input" name="eventDate" type="date" required />
            </div>
            <div>
              <label className="label">Time</label>
              <input className="input" name="eventTime" placeholder="e.g., 2:00pm" required />
            </div>
            <div>
              <label className="label">Venue / location</label>
              <input className="input" name="location" placeholder="Town / venue name" required />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label className="label">Message</label>
            <textarea className="textarea" name="message" rows={5} placeholder="Any details that will help the piper respond…" required />
          </div>

          <hr className="hr" />
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label className="label">Your name</label>
              <input className="input" name="clientName" required />
            </div>
            <div>
              <label className="label">Email (verification required)</label>
              <input className="input" name="clientEmail" type="email" required />
            </div>
            <div>
              <label className="label">Phone number (required)</label>
              <input className="input" name="clientPhone" required />
            </div>
          </div>

          {/* Turnstile token goes here if enabled */}
          <input type="hidden" name="turnstileToken" value="" />

          <p className="small" style={{ marginTop: 12 }}>
            Please provide as much detail as you can. The piper will respond directly to confirm availability and details.
          </p>

          <button className="btnPrimary" type="submit">Send verification code</button>
        </form>
      )}

      {step === "verify" && (
        <form className="card" onSubmit={onVerify}>
          <h3 style={{ marginTop: 0 }}>Verify your email</h3>
          <p className="small">We’ve sent a 6-digit code to <b>{clientEmail}</b>.</p>
          <label className="label">Verification code</label>
          <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <button className="btnPrimary" type="submit">Verify & send enquiry</button>
            <button className="btnSecondary" type="button" onClick={async () => {
              await sendCode({ enquiryId: enquiryId as any, email: clientEmail });
              alert("Code resent.");
            }}>Resend code</button>
          </div>
        </form>
      )}
    </main>
  );
}
