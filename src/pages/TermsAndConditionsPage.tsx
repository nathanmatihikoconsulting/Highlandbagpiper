import { useNavigate } from "react-router-dom";

export function TermsAndConditionsPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate("/")}
        className="text-teal hover:text-teal-hover hover:underline font-medium text-sm mb-8 block"
      >
        ← Back to Highland Bagpiper
      </button>

      <h1 className="text-4xl font-heading font-bold text-charcoal mb-2">Terms and Conditions</h1>
      <p className="text-gray-500 text-sm mb-10">Last updated: March 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">1. About these terms</h2>
          <p>
            These Terms and Conditions govern the relationship between bagpipers ("Pipers") and event organisers
            ("Clients") who use the Highland Bagpiper platform to request, quote for, and confirm bookings.
            By using the platform, both Pipers and Clients agree to be bound by these terms.
          </p>
          <p className="mt-3">
            Highland Bagpiper acts solely as an intermediary platform connecting Pipers with Clients.
            Highland Bagpiper is not a party to the agreement between a Piper and a Client and is not
            responsible for the performance of either party.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">2. Enquiries and quotes</h2>
          <p className="mb-3">
            When a Client submits an enquiry through the platform, they are inviting the Piper to provide a quote.
            An enquiry does not constitute a binding booking.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>A Piper may accept or decline any enquiry at their discretion.</li>
            <li>Quotes provided by a Piper are valid for <strong>14 days</strong> from the date they are issued, unless otherwise stated in the quote.</li>
            <li>A quote sets out the Piper's fee, availability, and any specific conditions for the engagement.</li>
            <li>Quotes are subject to the Piper's availability at the time of acceptance. Availability is not guaranteed until a booking is confirmed.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">3. Confirming a booking</h2>
          <p className="mb-3">
            A booking is confirmed when both of the following conditions have been met:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>The Client has accepted the Piper's quote.</li>
            <li>Payment has been made in accordance with the agreed payment terms (see section 5).</li>
          </ol>
          <p className="mt-3">
            Upon confirmation, both parties are bound by the terms of the booking, including the event date,
            location, duration, agreed repertoire (if specified), and the agreed fee.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">4. Changes to a confirmed booking</h2>
          <p className="mb-3">
            Any changes to a confirmed booking — including changes to the event date, time, location, or
            duration — must be agreed in writing by both parties via the platform.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The Piper may charge an additional fee for material changes to the scope of the engagement.</li>
            <li>If the parties cannot agree on revised terms, either party may treat the booking as cancelled subject to the cancellation policy in section 6.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">5. Payment</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>The full fee agreed between the Piper and Client is due in accordance with the Piper's stated payment terms.</li>
            <li>Unless otherwise agreed, full payment is due no later than <strong>7 days before the event date</strong>.</li>
            <li>Payments are processed securely via Stripe. Highland Bagpiper does not store payment card details.</li>
            <li>The Piper is responsible for any applicable taxes on fees received.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">6. Cancellation policy</h2>

          <h3 className="text-base font-semibold text-charcoal mt-4 mb-2">Cancellation by the Client</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>More than 30 days before the event:</strong> Full refund, less any transaction fees.</li>
            <li><strong>14–30 days before the event:</strong> 50% of the agreed fee is retained by the Piper.</li>
            <li><strong>Less than 14 days before the event:</strong> The full fee is non-refundable.</li>
          </ul>
          <p className="mt-3 text-sm text-gray-500">
            Individual Pipers may apply different cancellation terms, provided these are clearly stated in their quote before the booking is confirmed. In that case, the Piper's stated terms take precedence.
          </p>

          <h3 className="text-base font-semibold text-charcoal mt-4 mb-2">Cancellation by the Piper</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>If a Piper cancels a confirmed booking, the Client is entitled to a full refund of all amounts paid.</li>
            <li>The Piper should make reasonable efforts to find a suitable replacement piper and notify the Client as early as possible.</li>
            <li>Repeated cancellations by a Piper may result in removal from the platform.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">7. Performance obligations</h2>
          <p className="mb-3">The Piper agrees to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Arrive at the agreed venue at least 30 minutes before the engagement is due to begin, unless otherwise agreed.</li>
            <li>Perform in a professional manner appropriate to the nature of the event.</li>
            <li>Dress in appropriate Highland attire unless otherwise agreed with the Client.</li>
            <li>Communicate promptly with the Client through the platform if any issues arise.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">8. Force majeure</h2>
          <p>
            Neither party shall be liable for failure to perform their obligations where that failure results
            from circumstances beyond their reasonable control, including severe weather, serious illness,
            bereavement, or other events that make performance impossible. In such circumstances, the parties
            should communicate as early as possible and seek to agree a fair resolution, which may include
            rescheduling or a partial refund.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">9. Liability</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Highland Bagpiper is not liable for any loss, damage, or disappointment arising from a Piper's performance or non-performance.</li>
            <li>Pipers are responsible for holding any necessary public liability insurance for their engagements.</li>
            <li>Highland Bagpiper's total liability in connection with use of the platform shall not exceed the platform fees (if any) paid in the 12 months preceding the claim.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">10. Disputes</h2>
          <p>
            If a dispute arises between a Piper and a Client, both parties agree to first attempt to resolve it
            directly and in good faith via the platform's messaging system. If a resolution cannot be reached,
            either party may contact Highland Bagpiper at{" "}
            <a href="mailto:nathanmatihikoconsulting@gmail.com" className="text-teal hover:underline">
              nathanmatihikoconsulting@gmail.com
            </a>{" "}
            to request assistance. Highland Bagpiper may assist in facilitating a resolution but is not
            obliged to adjudicate.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">11. Governing law</h2>
          <p>
            These terms are governed by the laws of Scotland. Any disputes that cannot be resolved informally
            shall be subject to the exclusive jurisdiction of the Scottish courts.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">12. Contact</h2>
          <p>
            Questions about these terms should be directed to{" "}
            <a href="mailto:nathanmatihikoconsulting@gmail.com" className="text-teal hover:underline">
              nathanmatihikoconsulting@gmail.com
            </a>.
          </p>
        </section>

      </div>
    </div>
  );
}
