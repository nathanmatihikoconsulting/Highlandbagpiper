# Highland Bagpiper (MVP) — Next.js + Convex + Clerk (Enquiry-only)

This scaffold implements the Highland Bagpiper MVP:
- NZ-first, global-ready
- Enquiry-only (no instant booking, no calendar)
- No client accounts (clients verify email per enquiry)
- Piper accounts via Clerk
- Convex database + functions/actions
- Resend for email (verification + piper notification)
- Optional: Cloudflare Turnstile (anti-spam)

## 1) Prereqs
- Node.js 18+ (20+ recommended)
- Convex account
- Clerk account
- Resend account
- Vercel account (hosting)

## 2) Install & run locally

```bash
npm install
npx convex dev
npm run dev
```

Convex will prompt you to create/link a Convex project and will generate `convex/_generated`.

## 3) Configure Clerk ↔ Convex Auth (JWT)

### In Clerk
1. Go to **Clerk Dashboard → JWT Templates**
2. Create a template named **convex**
3. Set the **Issuer** + **JWKS URL** (Clerk provides these).
   - Leave claims mostly default.

### In Convex
1. Go to **Convex Dashboard → Settings → Authentication**
2. Add a **JWT** provider
3. Set:
   - **Issuer** = the issuer from Clerk JWT template
   - **JWKS URL** = Clerk JWKS URL
   - **Application ID** if required by Convex UI

Now Convex functions can reliably read the signed-in Clerk user via:
`const identity = await ctx.auth.getUserIdentity();`

## 4) Environment variables

### Local (`.env.local`)
Create a `.env.local` in project root:

```bash
# Clerk (Next.js)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Convex (Next.js)
NEXT_PUBLIC_CONVEX_URL=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM="Highland Bagpiper <no-reply@highlandbagpiper.io>"

# Turnstile (optional)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Site URL (used in email copy)
SITE_URL=http://localhost:3000
```

### Convex Environment (Convex Dashboard → Settings → Environment Variables)
Set:
- RESEND_API_KEY
- EMAIL_FROM
- TURNSTILE_SECRET_KEY (if using Turnstile)

## 5) First-time setup: create admin
1. Sign up via Clerk.
2. Visit `/piper/dashboard` once (this auto-creates your `users` row).
3. In Convex Dashboard → Data → `users`, set your `role` to `"admin"` for your user.

## 6) Deploy to Vercel + connect domain
1. Push repo to GitHub and import into Vercel.
2. Add env vars in Vercel (same keys as `.env.local`).
3. In Convex, deploy to **Production** and set Production env vars too.
4. In Vercel: add domain `highlandbagpiper.io` and `www.highlandbagpiper.io`.
5. In your registrar (Vercoe): set DNS records as Vercel instructs.

## 7) Enquiry flow
1. Client fills enquiry form (requires phone).
2. Enquiry is stored with status: `pending_verification`.
3. A 6-digit code is emailed to the client.
4. Client enters code → status becomes `sent`.
5. Piper receives an email; Reply-To is set to the client's email.

## 8) Key files
- `convex/schema.ts` — tables + indexes
- `convex/pipers.ts` — piper queries/mutations
- `convex/enquiries.ts` — enquiry + verification + emails
- `app/` — Next.js pages matching your 4-step flow
- `middleware.ts` — protects `/piper/*` and `/admin/*` with Clerk

