# Vyapar360 — PRD

## Problem statement
User cloned `https://github.com/softwarebusiness360/vyapar_360_client.git` into this Emergent
environment and requested a redesigned **Pricing section like Emergent** (with monthly/annual
toggle) that is fully **configurable from the existing admin CMS**, with more configuration
knobs than before. The pricing section must be built first before moving on to other work.

## Architecture
- **Type**: Frontend-only SPA (React 18 + CRA via CRACO + Tailwind + Framer Motion)
- **Backend**: none yet (all data in LocalStorage via `src/lib/store.js`, REST-shaped API)
- **Layout**:
  - `/app/frontend/`  → the repo (moved from repo root to fit Emergent's supervisor config)
  - `/app/backend/`   → empty (backend not yet built)

## Personas
- **Vendor** (restaurant/salon owner) — signs up, onboards, manages a storefront
- **Customer** — orders / books appointments from a storefront
- **Platform admin** — manages businesses and edits landing content via `/admin`

## Core requirements (static)
- Editable landing content (hero, stats, features, pricing, FAQ) via admin
- Pricing section modelled after Emergent's — monthly / annual pill toggle, savings badge,
  auto-computed annual total, per-plan config
- No commission on orders, no vendor lock-in

## What's implemented (this session — 2026-01-25)
### Pricing section — Emergent-style (`src/pages/marketing/LandingPage.jsx`)
- Monthly / Annual pill toggle (`data-testid="pricing-billing-toggle"`)
- Prices switch reactively; annual view shows `total billed yearly` + `Save N%`
- Currency, section eyebrow/title/subtitle, toggle labels, savings badge, footer
  notes are all driven by the CMS config

### Admin CMS — new "Pricing section" block (`src/pages/admin/AdminLandingCMSPage.jsx`)
- Section text: eyebrow, title, subtitle, currency symbol
- Billing toggle controls: show/hide, default cycle, monthly/annual labels,
  savings badge text, monthly plan hint
- Footer notes: add / remove rows with icon selector
- Per-plan: **Monthly Price** + **Annual Price / mo**, icon selector, suffix,
  tagline, badge, CTA, features
- Live editor hint under each plan showing computed annual total + savings %

### Data layer (`src/lib/store.js`)
- Extended `DEFAULT_LANDING_CONFIG` with a `pricing` block
- Migrated plan schema: `price` → `monthlyPrice` + `annualPrice` (per-month when annual)
- `getLandingConfig()` deep-merges pricing config and back-fills legacy plans
  (existing `price` values are auto-upgraded to monthlyPrice + annualPrice)

### Environment setup
- Repo relocated from repo-root layout to `/app/frontend/` (supervisor requirement)
- `/app/frontend/.env` created with `REACT_APP_BACKEND_URL` + `WDS_SOCKET_PORT`
- `yarn install` run, `frontend` supervisor restarted → compiles cleanly

## Backlog / Next tasks (as user hinted "we will move ahead")
- P0: user-driven next section (pending user's next request)
- P1: Real backend for landing config (persist across devices — currently LocalStorage)
- P1: Stripe / Razorpay integration for actual paid plan upgrades
- P1: WhatsApp order & booking notifications
- P2: Custom domain per storefront
- P2: More business types (Gym, Pharmacy, Grocery, Bakery, etc.)

## Test credentials
- **Platform admin**: `admin@vyapar360.com` / `admin123`
- **Vendor (Restaurant)**: `owner@pizzahub.com` / `demo1234`
- **Vendor (Salon)**: `owner@stylesalon.com` / `demo1234`
