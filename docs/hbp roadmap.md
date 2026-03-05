# Highland Bagpiper — Project Roadmap

**Domain:** highlandbagpiper.io
**Last updated:** March 2026

---

## Current State (MVP Complete)

The core platform is live and functional. A customer can find a bagpiper, view their profile, and submit an enquiry. A piper can create their profile, receive enquiry notifications, and update booking status. The design system is in place using the Highland Bagpiper brand.

---

## Phases

### Phase 1 — Foundation ✅ Done
- [x] Piper search by name, city, country
- [x] Piper profile pages (bio, specialties, pricing, YouTube videos)
- [x] Google OAuth + magic link authentication
- [x] Booking enquiry form
- [x] Customer booking dashboard
- [x] Piper booking dashboard (receive & manage enquiries)
- [x] File uploads (audio samples, certificates, documents)
- [x] Review system for completed bookings
- [x] Brand design system (deep green, stone, Playfair Display)
- [x] ShadCN UI components throughout
- [x] Convex schema extended (messages, notifications, rich booking fields)
- [x] Vercel + Convex production deploy pipeline

---

### Phase 2 — Communication & Engagement 🔴 Next Priority

The biggest gap right now is that customers and pipers cannot communicate after an enquiry is submitted. This is the most critical feature for converting enquiries into bookings.

#### 2.1 Email Notifications (Resend)
**Effort:** Small — 1–2 days
**Why now:** Pipers currently have no way to know a booking arrived. Customers don't get confirmation either.

- [x ] Install and configure Resend (`npm install resend`)
- [x ] Create Convex action `sendEmail` wrapping Resend API
- [x ] Email piper on new booking enquiry (to-do: add `email` field to piper profile)
- [x ] Email customer confirmation on enquiry submission
- [x ] Email customer when piper updates booking status
- [x ] Use `nathanmatihikoconsulting@gmail.com` as admin BCC on all bookings

> **Note:** The piper's email currently comes from their Convex Auth user record, not the bagpipers table. Need to look up `users` table by `userId` to get email.

#### 2.2 In-App Messaging
**Effort:** Medium — 3–5 days
**Why now:** The schema is already built (`messages` table). Customers and pipers need to discuss event details, tunes, dress, and logistics.

- [x ] Convex functions: `sendMessage`, `getMessages` (by bookingId), `markMessageRead`
- [x ] Messaging UI inside Dashboard — thread view per booking
- [x ] Unread message badge on Dashboard nav tab
- [x ] Real-time updates (Convex queries are reactive — works automatically)

#### 2.3 In-App Notifications
**Effort:** Small — 1–2 days
**Why now:** Schema already exists (`notifications` table). Creates a notification feed in the nav.

- [x ] Convex functions: `createNotification` (internal), `getMyNotifications`, `markNotificationRead`
- [x ] Call `createNotification` from booking and message mutations
- [x ] Notification bell icon in nav header with unread count badge
- [x ] Dropdown notification feed

---

### Phase 3 — Booking Lifecycle & Quoting 🟡 Medium Priority

Currently bookings go straight to "pending" with a pre-calculated amount. The real workflow needs a quote-and-accept flow.

#### 3.1 Quote Flow
**Effort:** Medium — 3–5 days

- [x ] Update `updateBookingStatus` mutation to support all new status values (`enquiry`, `quoted`, `accepted`, `deposit_paid`, `confirmed`, `disputed`)
- [x] Piper can submit a quote (performanceFee, travelFee, notes, validUntil) via new `submitQuote` mutation
- [x ] Customer can accept or decline a quote
- [x ] Dashboard shows quote details, accept/decline buttons
- [x ] Email notification when quote is sent / accepted

**Phase 3.1 Quote Flow is done. Here's how it works end-to-end:**

Piper side (Received Bookings tab):

New/pending enquiries show a "Send Quote" button
Expands an inline form: currency (NZD/AUD/USD/GBP/EUR), performance fee, travel fee, accommodation fee, notes, valid-until date
Running total shown as you type
Once sent, shows a blue "Quote sent — awaiting customer response" summary
Piper can click "Update Quote" anytime to revise
Customer side (My Bookings tab):

When status is quoted, a blue quote card appears showing the fee breakdown + total
Accept Quote → status moves to accepted, piper gets an in-app notification
Decline → status moves to cancelled, piper notified
Piper follow-up: Once customer accepts, a "Confirm Booking" button appears to move to confirmed.

#### 3.2 Availability Calendar
**Effort:** Medium — 3–5 days

- [x ] Piper can block out unavailable dates (`availability.blackoutDates` already in schema)
- [x ] Calendar component on piper profile and booking form
- [x ] Booking form prevents selecting a blocked date
- [x ] Dashboard shows upcoming bookings in a calendar view

**Phase 3.2 Reviews is done. Here's what's live:**

Customer side (My Bookings — completed bookings):

"Leave a Review" button expands an inline form with interactive star rating (click to select 1-5), optional title, and required comment
After submitting, shows a green "Review submitted ✓" badge with the star count
Piper side:

Gets an in-app notification when a review is received
replyToReview mutation is ready to wire into a UI when you want pipers to respond to reviews from their Dashboard
Browse view (BagpiperCard details modal):

Full reviews section at the bottom with stars, title, customer name, date, comment, and indented piper response (if any)

#### 3.3 Rich Booking Form
**Effort:** Small — 1–2 days

- [x ] Update `BookingModal` to capture `eventDetails` (venue name/address, guest count, indoor/outdoor)
- [x ] Capture `musicPreferences` (tunes requested, genre, notes)
- [x ] Capture `dressPreference`
- [x ] These map directly to existing schema fields

**Phase 3.3 done. The booking form now has four clear sections:**

Your Event — type, date, start time, duration (unchanged)
Venue — venue name, indoor/outdoor select, full address, guest count
Music Preferences — tune requests (comma or newline separated, parsed into array), genre select, additional notes
Dress & Presentation — Highland/Modern/No Preference select, plus a catch-all special requests field
Contact Details — name, email, phone
Estimated Cost — with a note that the piper will confirm the final price in their quote
All new data is saved into the eventDetails, musicPreferences, and dressPreference fields in the schema. The piper can see everything when reviewing a booking enquiry.

---

### Phase 4 — Trust & Quality 🟡 Medium Priority

#### 4.1 Piper Verification Badge
**Effort:** Small — 1 day

- [ ] Admin can toggle `verified: true` on a bagpiper record
- [ ] Verified badge shown on profile card and profile page
- [ ] Filter in search: "Show verified pipers only"

#### 4.2 Enhanced Reviews
**Effort:** Small — 1 day

- [ ] Update review form to capture `title` and separate `comment`
- [ ] Display review title on profile
- [ ] Piper can submit `response` (reply) to a review
- [ ] `createdAt` timestamp on all new reviews

#### 4.3 Public Piper Profile Pages (URL Routing)
**Effort:** Medium — 2–3 days

Currently there is no URL routing — a piper cannot share a link to their profile. This is a significant SEO and UX limitation.

- [ ] Install `react-router-dom` or use Vite's built-in routing
- [ ] Route: `/pipers/:id` → public piper profile
- [ ] Route: `/bookings/:id` → booking detail (authenticated)
- [ ] Route: `/dashboard` → dashboard
- [ ] Update nav and piper cards to link to `/pipers/:id`
- [ ] SEO meta tags on piper profile pages

---

### Phase 5 — Payments 🔵 Future

Stripe Connect integration to handle deposits and final payments through the platform.

#### 5.1 Stripe Connect Onboarding
**Effort:** Large — 5–10 days

- [ ] Piper completes Stripe Connect onboarding (`stripeAccountId` already in schema)
- [ ] Platform handles deposit collection (e.g. 25% on booking confirmation)
- [ ] Final payment on completion
- [ ] `payment.depositPaidAt`, `payment.finalPaidAt`, `payment.stripeTransferId` already in schema
- [ ] Automatic payout to piper after event completion minus platform fee

#### 5.2 Invoicing
**Effort:** Medium — 2–3 days

- [ ] Generate PDF invoice for each completed booking
- [ ] Send to customer and piper via email
- [ ] Download from dashboard

---

### Phase 6 — Growth & SEO 🔵 Future

- [ ] Public landing pages for major cities (e.g. `/bagpipers/auckland`, `/bagpipers/edinburgh`)
- [ ] Blog / content pages for event types (weddings, funerals, etc.)
- [ ] Sitemap.xml generation
- [ ] Google Analytics / Plausible integration
- [ ] Referral scheme for pipers who refer other pipers
- [ ] FAQs page (referenced in brand mockup nav)
- [ ] Social sharing for piper profiles

---

## Immediate Next Steps (This Week)

These are ordered by impact and effort — start at the top.

| # | Task | Why | Est. |
|---|---|---|---|
| 1 | **Add email to piper profile form + schema** | Needed before Resend emails can work | 1 hr |
| 2 | **Resend: email piper on new enquiry** | Pipers don't know enquiries exist | 2 hrs |
| 3 | **Resend: email customer confirmation** | Basic trust signal after booking | 1 hr |
| 4 | **Fix `updateBookingStatus` to accept new status values** | Schema says `enquiry`, `quoted`, etc. but mutation still uses old union | 30 min |
| 5 | **Messaging: Convex functions** | `messages` table exists, just needs functions | 2 hrs |
| 6 | **Messaging: thread UI in Dashboard** | Customers and pipers need to communicate | 4 hrs |
| 7 | **Notification functions + bell icon** | Schema ready, high visible impact | 3 hrs |
| 8 | **URL routing for piper profiles** | Big for SEO and shareable links | 4 hrs |

---

## Open Questions / Decisions Needed

| Question | Options | Impact |
|---|---|---|
| What currency do pipers set their rate in? | Lock to NZD, or let pipers choose currency | Medium |
| Who pays the platform fee — customer or piper? | Currently added on top (customer pays) | High |
| Should bookings require an account, or allow guest enquiries? | Account required vs. email-only flow | Medium |
| Is the 5% platform fee the right rate? | Currently hardcoded in `createBooking` | Medium |
| Should pipers be manually verified, or can they self-certify? | Admin review vs. document upload | Low |
| Do we want a mobile app eventually? | React Native + Convex would reuse backend | Long term |

---

## Environments

| Environment | URL | Deploy method |
|---|---|---|
| Production | highlandbagpiper.io | `git push` → Vercel auto-build |
| Dev (Convex) | proper-mammoth-39.convex.cloud | `npx convex dev` |
| Local frontend | localhost:5173 | `npm run dev` |
| Convex dashboard | dashboard.convex.dev | Manual — data browsing, monitoring |
