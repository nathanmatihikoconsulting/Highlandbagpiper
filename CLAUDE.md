# Highland Bagpiper Platform — Agent Guide

Membership + booking platform for the Auckland Police Pipe Band (and pipers generally).
Domain: highlandbagpiper.io. Convex deployment: `proper-mammoth-39`.

## Stack
- **Frontend:** Vite + React 19 + TypeScript, React Router v7, Tailwind v3, ShadCN UI (`src/`)
- **Backend:** Convex (`convex/`) — reactive queries/mutations/actions
- **Auth:** Convex Auth (Google OAuth + magic link)
- **Payments:** Stripe Connect (platform fee + piper payout), GST handling for NZ
- **Email:** Resend (`convex/email.ts`, `convex/sendEmails.ts`)
- **Hosting:** Vercel (frontend) + Convex (backend)

## Project layout
- `src/` — React app: `pages/`, `components/`, `lib/`, `utils/`
- `convex/` — backend functions, one file per domain (bookings, bagpipers, stripe, messages, notifications, reviews, userProfiles)
- `convex/schema.ts` — single source of truth for the data model
- `docs/` — `hbp roadmap.md` (drive work from here), `hbp tech-spec.md`, Stripe/GST analysis
- `.cursor/rules/convex_rules.mdc` — Convex coding conventions (follow these)

## Commands
- `npm run dev` — frontend + backend in parallel
- `npm run lint` — typechecks convex + app, runs `convex dev --once`, and `vite build`. **Run this before considering any change done.**
- `npm run build` — production build (`convex deploy`)

## Guardrails — STOP and ask before touching these
- **Auth routes** in `convex/http.ts` / `convex/router.ts` — auth endpoints are deliberately separated from user routes. Do not modify auth handling without explicit sign-off.
- **Payments:** `convex/stripe.ts`, `convex/stripeHelpers.ts`, `convex/stripeWebhook.ts`, `convex/feeCalculations.ts` — money + GST logic. Changes need human review and, ideally, a Stripe test-mode check.
- **Schema migrations** in `convex/schema.ts` that drop/rename fields on existing tables — flag the data-migration impact first.
- **Secrets:** never commit tokens/keys. Use Convex env vars + Vercel env settings. `.env*`, `ghp_*`, `*.pem`, `*.key` are gitignored.

## Conventions
- TypeScript everywhere; match existing file style.
- Convex: follow `.cursor/rules/convex_rules.mdc` (new function syntax, validators, indexes over filters).
- UI: reuse ShadCN components in `src/components`; brand = deep green, stone, Playfair Display.
- Keep one Convex file per domain; export validated args.

## Workflow
- Pick the next item from `docs/hbp roadmap.md` (Phase 2 = current priority).
- Plan → implement → run `npm run lint` → self-review the diff → one PR per roadmap item.
- The human (Nathan) is the approval gate at the PR, not at every step.
