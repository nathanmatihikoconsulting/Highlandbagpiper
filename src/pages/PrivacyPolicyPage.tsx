import { useNavigate } from "react-router-dom";

export function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate("/")}
        className="text-teal hover:text-teal-hover hover:underline font-medium text-sm mb-8 block"
      >
        ← Back to Highland Bagpiper
      </button>

      <h1 className="text-4xl font-heading font-bold text-charcoal mb-2">Privacy Policy</h1>
      <p className="text-gray-500 text-sm mb-10">Last updated: March 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">1. About this policy</h2>
          <p>
            Highland Bagpiper ("we", "us", "our") operates the Highland Bagpiper platform, connecting event organisers
            with professional bagpipers across Scotland and beyond. This policy explains what personal data we collect,
            why we collect it, and your rights in relation to it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">2. Data we collect</h2>
          <p className="mb-3">We collect the following categories of personal data:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account information</strong> — your name and email address when you register.</li>
            <li><strong>Profile information</strong> — for bagpipers: biography, location, event types, photos, and pricing you choose to publish.</li>
            <li><strong>Booking details</strong> — event date, location, type, and any notes exchanged between you and a piper.</li>
            <li><strong>Messages</strong> — communications sent through the platform between hirers and pipers.</li>
            <li><strong>Payment information</strong> — payment transactions are processed by Stripe. We do not store your full card details; Stripe handles this securely on our behalf.</li>
            <li><strong>Usage data</strong> — basic technical information such as browser type and pages visited, used to improve the platform.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">3. How we use your data</h2>
          <p className="mb-3">We use your data to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and operate the Highland Bagpiper platform.</li>
            <li>Connect hirers with bagpipers and facilitate bookings.</li>
            <li>Process payments securely via Stripe.</li>
            <li>Send transactional emails related to your bookings and account (via Resend).</li>
            <li>Resolve disputes and enforce our terms of service.</li>
            <li>Improve the platform based on usage patterns.</li>
          </ul>
          <p className="mt-3">We do not sell your personal data to third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">4. Legal basis for processing</h2>
          <p>
            We process your data on the basis of <strong>contractual necessity</strong> (to deliver the service you signed up for),
            <strong> legitimate interests</strong> (platform security and improvement), and where required,
            <strong> your consent</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">5. Data sharing</h2>
          <p className="mb-3">We share data only where necessary:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Stripe</strong> — payment processing. See <a href="https://stripe.com/gb/privacy" target="_blank" rel="noopener noreferrer" className="text-teal hover:underline">stripe.com/gb/privacy</a>.</li>
            <li><strong>Convex</strong> — our cloud database and backend infrastructure provider.</li>
            <li><strong>Resend</strong> — transactional email delivery.</li>
            <li><strong>Other users</strong> — your public profile information is visible to registered users searching for a piper. Hirer contact details are shared with a piper only upon confirmed booking.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">6. Data retention</h2>
          <p>
            We retain your account and booking data for as long as your account is active, and for up to 7 years
            afterwards for legal and financial record-keeping purposes. You may request deletion of your account at
            any time (see section 8).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">7. Cookies</h2>
          <p>
            We use essential cookies and local storage to keep you signed in and remember your session. We do not
            use advertising or tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">8. Your rights</h2>
          <p className="mb-3">Under UK and EU data protection law, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Access</strong> the personal data we hold about you.</li>
            <li><strong>Correct</strong> inaccurate data.</li>
            <li><strong>Delete</strong> your account and associated data.</li>
            <li><strong>Restrict or object</strong> to certain processing.</li>
            <li><strong>Data portability</strong> — receive your data in a structured format.</li>
            <li><strong>Withdraw consent</strong> at any time where consent is the basis for processing.</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, please contact us at the address below.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-3">9. Contact us</h2>
          <p>
            If you have questions about this policy or wish to exercise your data rights, please contact us at{" "}
            <a href="mailto:nathanmatihikoconsulting@gmail.com" className="text-teal hover:underline">
              nathanmatihikoconsulting@gmail.com
            </a>.
          </p>
          <p className="mt-3">
            You also have the right to lodge a complaint with the{" "}
            <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-teal hover:underline">
              Information Commissioner's Office (ICO)
            </a>{" "}
            if you believe your data has been handled unlawfully.
          </p>
        </section>

      </div>
    </div>
  );
}
