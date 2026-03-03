# Highland Bagpiper — Technical Specification

**Domain:** highlandbagpiper.io
**Version:** 0.1 (MVP)
**Last updated:** March 2026

---

## 1. Overview

Highland Bagpiper is a two-sided marketplace connecting customers who need a professional Highland bagpiper for ceremonies and events with verified bagpipers who can accept and manage bookings. The platform handles discovery, enquiry, booking lifecycle, payments, and reviews.

---

## 2. Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5.7 |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 3 |
| Component library | ShadCN UI (new-york style, stone base) |
| Primitives | Radix UI (Dialog, Select, Tabs, Label, Slot) |
| Variant styling | class-variance-authority |
| Toast notifications | Sonner |
| Icons | Lucide React |

### Backend
| Layer | Technology |
|---|---|
| Backend platform | Convex (serverless, real-time) |
| Database | Convex built-in (document store) |
| Auth | Convex Auth (`@convex-dev/auth`) |
| File storage | Convex Storage |
| API pattern | Queries (read) + Mutations (write) |

### Infrastructure
| Concern | Service |
|---|---|
| Frontend hosting | Vercel (auto-deploy on `git push`) |
| Backend hosting | Convex Cloud |
| Production Convex | `unique-chameleon-750.convex.cloud` |
| Dev Convex | `proper-mammoth-39.convex.cloud` |
| Domain | highlandbagpiper.io |

### Deploy pipeline
```
git push → Vercel build → npx convex deploy (pushes schema + functions to prod) → vite build
```

---

## 3. Brand & Design System

### Colour tokens (from `highlandbagpiper-tokens.css`)
| Token | Hex | Usage |
|---|---|---|
| `--hb-green` / `primary` | `#1F3A2E` | Header, buttons, badges, accents |
| `--hb-teal` | `#2F5F6B` | Secondary actions, links |
| `--hb-stone` | `#EFEAE7` | Page background, input backgrounds |
| `--hb-charcoal` | `#1E1E1E` | Headings, body text |
| `--hb-wine` | `#6B2F3A` | Error states, destructive actions |

### Typography
- **Headings (h1–h6):** Playfair Display (Google Fonts, serif)
- **Body:** System UI / Tailwind default sans

### Layout
- Max width: 1100px (brand) / `max-w-7xl` (Tailwind)
- Border radius: 6px (`--hb-radius`)
- Component radius: `--radius: 0.375rem` (ShadCN)

### Assets
| File | Location | Usage |
|---|---|---|
| Wordmark (horizontal) | `BagpiperBranding/` | Nav header (text replacement used) |
| Piper Kevin photo | `public/piper-kevin.png` | Homepage hero RHS |
| Hero piper (cropped) | `public/hero-piper.png` | Legacy — replaced by Kevin |

---

## 4. Authentication

- Provider: Convex Auth with **Google OAuth** and **email magic link**
- Auth tables managed by `@convex-dev/auth` (users, sessions, accounts, verificationCodes)
- `getAuthUserId(ctx)` used in all mutations for identity
- Post-login redirect: `useEffect` in `Content` component redirects from `"signin"` view to `"search"` on authentication
- Route protection: Convex `<Authenticated>` / `<Unauthenticated>` components wrap views

---

## 5. Data Model

### `bagpipers`
Piper profile, one per user account.

| Field | Type | Notes |
|---|---|---|
| `userId` | `id("users")` | Index: `by_user` |
| `name` | string | Search index: `search_bagpipers` |
| `bio` | string | |
| `location` | string | Full address |
| `city` | string | Filter field for search |
| `country` | string | Filter field for search |
| `zipCode` | string | |
| `phone` | string | |
| `hourlyRate` | number | Base rate in local currency |
| `minimumBooking` | number | Hours |
| `travelRadius` | number | Kilometres |
| `profileImageId` | `id("_storage")?` | Convex storage |
| `youtubeVideos` | string[] | YouTube video IDs |
| `specialties` | string[] | Weddings, Funerals, etc. |
| `isActive` | boolean | Index: `by_active` |
| `stripeAccountId` | string? | Stripe Connect (future) |
| `averageRating` | number? | Computed from reviews |
| `totalReviews` | number | Computed from reviews |
| `pricing` | object? | `{ baseFee, currency, travelRatePerKm?, additionalCosts? }` |
| `availability` | object? | `{ blackoutDates?: string[] }` |
| `verified` | boolean? | Admin-verified status |

**Indexes:** `by_user`, `by_location`, `by_active`
**Search index:** `search_bagpipers` on `name`, filtered by `city`, `country`, `isActive`

---

### `bagpiperFiles`
Media and documents uploaded by pipers.

| Field | Type | Notes |
|---|---|---|
| `bagpiperId` | `id("bagpipers")` | |
| `fileId` | `id("_storage")` | Convex storage |
| `fileName` | string | |
| `fileType` | union | `"audio" \| "certificate" \| "document" \| "image"` |
| `description` | string? | |
| `isPublic` | boolean | Visible to customers |

**Indexes:** `by_bagpiper`, `by_bagpiper_and_type`, `by_bagpiper_and_public`

---

### `bookings`
Core booking record, tracks full lifecycle.

| Field | Type | Notes |
|---|---|---|
| `customerId` | `id("users")` | Index: `by_customer` |
| `bagpiperId` | `id("bagpipers")` | Index: `by_bagpiper` |
| `eventType` | string | Legacy flat field |
| `eventDate` | string | Legacy flat field |
| `eventTime` | string | Legacy flat field |
| `duration` | number | Hours (legacy) |
| `location` | string | Legacy flat field |
| `specialRequests` | string? | |
| `totalAmount` | number | |
| `platformFee` | number | 5% of subtotal |
| `bagpiperAmount` | number | Subtotal minus platform fee |
| `status` | union | See status lifecycle below |
| `stripePaymentIntentId` | string? | Direct Stripe field (legacy) |
| `customerName` | string | |
| `customerEmail` | string | |
| `customerPhone` | string | |
| `eventDetails` | object? | Rich: venue, times, guestCount, etc. |
| `musicPreferences` | object? | `{ tunes?, genre?, notes? }` |
| `dressPreference` | string? | |
| `quote` | object? | `{ performanceFee, travelFee?, totalFee, currency, validUntil? }` |
| `payment` | object? | `{ depositAmount?, depositPaidAt?, finalAmount?, stripeTransferId? }` |
| `updatedAt` | number? | Epoch ms timestamp |

**Status lifecycle:**
```
enquiry → quoted → accepted → deposit_paid → confirmed → completed
                                                       ↘ cancelled / disputed
(legacy: pending → confirmed → paid → completed → cancelled)
```

**Indexes:** `by_customer`, `by_bagpiper`, `by_status`

---

### `reviews`
Customer reviews for completed bookings.

| Field | Type | Notes |
|---|---|---|
| `bookingId` | `id("bookings")` | Index: `by_booking` |
| `customerId` | `id("users")` | |
| `bagpiperId` | `id("bagpipers")` | Index: `by_bagpiper` |
| `rating` | number | 1–5 stars |
| `comment` | string | |
| `customerName` | string | |
| `title` | string? | Review headline |
| `response` | string? | Piper's reply |
| `createdAt` | number? | Epoch ms |

---

### `messages` _(schema ready, UI not yet built)_
In-booking threaded messages between customer and piper.

| Field | Type | Notes |
|---|---|---|
| `bookingId` | `id("bookings")` | Index: `by_bookingId` |
| `senderId` | `id("users")` | Index: `by_senderId` |
| `content` | string | |
| `attachmentIds` | `id("_storage")[]?` | |
| `readAt` | number? | Epoch ms; undefined = unread |
| `createdAt` | number | |

---

### `notifications` _(schema ready, UI not yet built)_
Per-user notification feed.

| Field | Type | Notes |
|---|---|---|
| `userId` | `id("users")` | Index: `by_userId` |
| `type` | string | `"new_enquiry" \| "new_message" \| "quote_received" \| "booking_confirmed" \| "review_received"` |
| `title` | string | |
| `message` | string | |
| `linkTo` | string? | Relative URL path |
| `readAt` | number? | Undefined = unread |
| `createdAt` | number | Index: `by_userId_createdAt` |

---

## 6. Convex Functions (current)

### `bagpipers.ts`
| Function | Type | Description |
|---|---|---|
| `createProfile` | mutation | Create piper profile for authenticated user |
| `updateProfile` | mutation | Update own profile |
| `getMyProfile` | query | Fetch own profile with image URL |
| `searchBagpipers` | query | Search by name (full-text), city, country, specialty |
| `getLocations` | query | Returns distinct active cities and countries |
| `getBagpiperById` | query | Fetch single piper with image URL |
| `generateUploadUrl` | mutation | Generate Convex storage upload URL |
| `updateProfileImage` | mutation | Set profile image storage ID |

### `bookings.ts`
| Function | Type | Description |
|---|---|---|
| `createBooking` | mutation | Create booking, auto-calculates platform fee (5%) |
| `getMyBookings` | query | Customer's bookings with piper details |
| `getBagpiperBookings` | query | Piper's received bookings |
| `updateBookingStatus` | mutation | Piper updates booking status |
| `getBookingById` | query | Single booking with piper details |

### `reviews.ts`
| Function | Type | Description |
|---|---|---|
| `createReview` | mutation | Submit review for completed booking |
| `getBagpiperReviews` | query | All reviews for a piper |

### `files.ts`
File upload management for piper media/documents.

### `auth.ts`
Authentication helpers (Convex Auth standard).

---

## 7. Frontend Structure

```
src/
├── App.tsx                   # Root layout, nav, view router
├── SignInForm.tsx             # Auth form (Google + magic link)
├── SignOutButton.tsx          # Sign out button
├── index.css                 # CSS variables (ShadCN + brand tokens)
├── main.tsx                  # Vite entry point
├── lib/
│   └── utils.ts              # cn() Tailwind class merger
└── components/
    ├── BagpiperSearch.tsx    # Search form + results grid
    ├── BagpiperCard.tsx      # Piper card + details modal
    ├── BagpiperProfile.tsx   # Piper profile view/edit
    ├── BookingModal.tsx      # Booking enquiry form
    ├── Dashboard.tsx         # Customer & piper booking dashboard
    ├── FileUpload.tsx        # Piper file management
    └── ui/                   # ShadCN components
        ├── button.tsx
        ├── card.tsx
        ├── dialog.tsx
        ├── input.tsx
        ├── label.tsx
        ├── select.tsx
        ├── badge.tsx
        ├── tabs.tsx
        ├── skeleton.tsx
        └── textarea.tsx
```

### View routing
App uses a simple string state `currentView`:
`"search"` | `"profile"` | `"dashboard"` | `"signin"`

No client-side router is installed. Deep-linking to specific bookings or piper profiles is not yet supported.

---

## 8. Current Features (Built)

| Feature | Status |
|---|---|
| Public piper search (name, city, country) | ✅ |
| Piper profile cards with modal detail view | ✅ |
| Google OAuth + magic link auth | ✅ |
| Piper profile creation & editing | ✅ |
| Profile image upload | ✅ |
| YouTube video embeds on profile | ✅ |
| Piper file uploads (audio, certs, docs, images) | ✅ |
| Booking enquiry form | ✅ |
| Customer booking dashboard | ✅ |
| Piper received bookings dashboard | ✅ |
| Booking status management (piper side) | ✅ |
| Review submission (completed bookings) | ✅ |
| Average rating calculation | ✅ |
| Dynamic city/country filter from live data | ✅ |
| Brand design system (ShadCN + Tailwind tokens) | ✅ |
| "How It Works" landing page section | ✅ |

---

## 9. Known Gaps & Technical Debt

| Issue | Priority |
|---|---|
| Booking status enum in `updateBookingStatus` mutation doesn't include new status values (enquiry, quoted, etc.) | High |
| No email notifications on booking or enquiry | High |
| No messaging UI (schema exists) | High |
| No notification UI (schema exists) | Medium |
| No URL routing — can't deep-link to a piper or booking | Medium |
| Platform fee (5%) hardcoded in `createBooking` | Low |
| No Stripe payment integration | Medium |
| No admin/verification interface for pipers | Low |
| `searchBagpipers` still accepts `specialty` arg but UI no longer sends it | Low |
| Git push credential issue in Claude's environment — user must push manually | Workflow |
