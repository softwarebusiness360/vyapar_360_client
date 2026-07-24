# vyapar_360_client

# Vyapar360 — Client (Phase 1)

A modern SaaS multi-vendor storefront platform for local businesses. This branch
(`feat_client_phase_1`) contains the **frontend MVP** — restaurants and salons
can create a digital storefront, and customers can order food or book
appointments.

Everything in this MVP is client-side (LocalStorage-backed) so the app behaves
like a real product without needing any backend, payments, or WhatsApp
integration yet.

## Tech Stack

- **React 18** + **React Router 6** (CRA via CRACO)
- **Tailwind CSS 3** with a premium dark theme
- **Framer Motion** for micro-animations
- **Sonner** for toast notifications
- **lucide-react** for icons
- **Outfit** (display) + **Manrope** (body) fonts

## Getting Started

```bash
# 1. Install dependencies
yarn install

# 2. Set the backend URL (unused in MVP but required by env schema)
cp .env.example .env   # if you add one, otherwise edit .env directly

# 3. Start the dev server
yarn start
```

The app runs on **http://localhost:3000**.

### Environment variables

| Key                     | Purpose                                                 |
| ----------------------- | ------------------------------------------------------- |
| `REACT_APP_BACKEND_URL` | Base URL for future REST API (unused in MVP)            |
| `WDS_SOCKET_PORT`       | Webpack dev server socket port (set to `443` for HTTPS) |

## Project Structure

```
.
├── public/
│   └── index.html
├── src/
│   ├── App.js                 # Routes
│   ├── index.js               # Entry
│   ├── index.css              # Global + Tailwind
│   ├── App.css
│   ├── components/            # Shared UI (Logo, Modal, StatusBadge, headers)
│   ├── lib/
│   │   ├── auth.jsx           # Mock LocalStorage auth (vendor)
│   │   ├── cart.jsx           # Customer cart context (per storefront)
│   │   ├── store.js           # LocalStorage data layer (mirrors a REST API)
│   │   └── utils.js           # cn(), formatINR(), slugify(), uid(), dates
│   └── pages/
│       ├── marketing/         # Landing page
│       ├── auth/              # Login, Register
│       ├── vendor/            # Onboarding, Dashboard (Overview, Catalogue,
│       │                     #   Orders, Bookings, Insights, Settings)
│       └── customer/          # Discover, Storefront, Checkout, Booking flow,
│                              #   Order/Booking confirmations
├── tailwind.config.js
├── craco.config.js            # `@/` alias -> src
├── jsconfig.json
└── package.json
```

## Features

### Vendor

- Register + mock login (LocalStorage)
- 3-step onboarding wizard (business type → details → branding)
- Dashboard: Overview, Catalogue (menu/services CRUD), Orders (restaurant) /
  Bookings (salon), Insights, Store settings

### Customer

- Landing page + `/discover` directory
- Storefront at `/store/{slug}` (accent color per business type)
- Restaurant: cart → checkout → order confirmation
- Salon: pick a service → date + time slot → booking confirmation

## Demo credentials

| Business    | Type       | Email                  | Password   |
| ----------- | ---------- | ---------------------- | ---------- |
| Pizza Hub   | Restaurant | `owner@pizzahub.com`   | `demo1234` |
| Style Salon | Salon      | `owner@stylesalon.com` | `demo1234` |

The `/login` page also offers one-click "Try a demo" shortcuts.

## Data model (LocalStorage keys)

| Key                     | Payload                           |
| ----------------------- | --------------------------------- |
| `vyapar360.session`     | `{ email, vendorId }`             |
| `vyapar360.vendors`     | `Vendor[]`                        |
| `vyapar360.orders`      | `Order[]` (restaurant orders)     |
| `vyapar360.bookings`    | `Booking[]` (salon appointments)  |
| `vyapar360.cart.{slug}` | Cart lines per storefront         |
| `vyapar360.seed_done`   | Flag so demo data seeds only once |

`src/lib/store.js` exposes a REST-shaped API (`getVendors`, `createOrder`,
`updateBookingStatus`, `getSlotsForDate`, …) so swapping to a real backend is a
non-UI change.

## Roadmap

- Real vendor auth (Emergent Google OAuth / JWT)
- Stripe checkout for restaurants
- WhatsApp order & booking notifications
- Real REST backend
- More business types (Gym, Pharmacy, Grocery, Bakery, Boutique, Spa, Clinic)
- Image uploads, reviews & ratings, coupons, custom domains

## License

Proprietary — © Vyapar360.

# vyapar_360_client
