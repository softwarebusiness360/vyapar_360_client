# Vyapar360 — Complete Understanding

> Everything about the platform — personas, routing, data flow, features — in one place.

**Version**: MVP Phase 1
**Stack**: React 18 · React Router 6 · Tailwind CSS 3 · Framer Motion · LocalStorage
**Domain strategy**: Single-domain multi-tenant (no subdomains)

---

## 1. What Vyapar360 is

Vyapar360 gives local businesses (Restaurants + Salons today, more coming) a
ready-to-use digital storefront. No websites. No developers. No commission.

Instead of every neighbourhood business building their own site, they get a
polished storefront at `vyapar360.com/store/{their-slug}` in minutes and manage
orders/bookings from a beautiful dashboard.

---

## 2. The three personas

The whole system revolves around three types of users. Each one has their own
routes, their own sessions, their own screens.

| Persona | Who | Goal | Session key (LocalStorage) |
|---|---|---|---|
| 🌍 **Customer** | Anonymous visitor | Order food / book an appointment | *(no session — anonymous)* |
| 🏪 **Vendor** | Business owner | Run their store, manage orders/catalogue | `vyapar360.session` |
| 🛡️ **Admin** | Vyapar360 platform team | See all vendors, orders, bookings; edit landing page | `vyapar360.admin_session` |

The three sessions are **completely independent** — an admin can also be logged
in as a vendor in the same browser without either affecting the other.

---

## 3. Full URL map (with persona)

### 🌍 Public (no auth required)

| URL | Purpose |
|---|---|
| `/` | Marketing landing page (hero, features, pricing, FAQ, CTA) |
| `/discover` | Public directory of all live storefronts |
| `/store/{slug}` | Storefront (restaurant or salon based on vendor's businessType) |
| `/store/{slug}/checkout` | Restaurant cart → place order |
| `/store/{slug}/book/{serviceId}` | Salon date+time slot picker |
| `/store/{slug}/order/{orderId}` | Restaurant order confirmation |
| `/store/{slug}/booking/{bookingId}` | Salon booking confirmation |
| `*` | 404 page for anything else |

### 🏪 Vendor (auth required — vendor session)

| URL | Purpose |
|---|---|
| `/register` | Vendor sign-up (email + password ≥ 6 chars) |
| `/login` | Vendor sign-in (redirects to /dashboard if onboarded, else /onboarding) |
| `/onboarding` | 3-step wizard (business type → details → branding) |
| `/dashboard` | Overview: revenue, orders/bookings count, 7-day chart, recent activity |
| `/dashboard/catalogue` | Manage menu items (restaurant) or services (salon) + categories |
| `/dashboard/orders` | Orders table (**restaurant only**) with status transitions |
| `/dashboard/bookings` | Bookings table (**salon only**) with status transitions |
| `/dashboard/insights` | 30-day revenue trend + top items/services |
| `/dashboard/settings` | Store profile + branding + **configurable customer fields** |

### 🛡️ Admin (auth required — admin session, isolated from vendor)

| URL | Purpose |
|---|---|
| `/admin/login` | Platform admin sign-in (separate from vendor login) |
| `/admin` | Overview: total businesses, orders, bookings, GMV, recent activity |
| `/admin/businesses` | All vendors table with search + type filter |
| `/admin/businesses/{vendorId}` | Business detail: contact, stats, activity, actions |
| `/admin/orders` | Cross-vendor: every order ever placed |
| `/admin/bookings` | Cross-vendor: every appointment ever booked |
| `/admin/landing` | Landing page CMS (edit hero, stats, pricing, FAQ) |

---

## 4. The single-domain differentiator (very important)

### Q: If Pizza Hub (restaurant) and Style Salon (salon) both use `/store/{slug}`, how does the screen differ?

**A: Same URL pattern, same React component — but different UI branches inside based on `vendor.businessType`.**

```
Customer visits /store/pizza-hub
         ↓
  StorefrontPage looks up vendor by slug
         ↓
  vendor.businessType === "restaurant"
         ↓
  ┌─────────────────────────────────────┐
  │  Cart trigger in header             │
  │  Category chips + search            │
  │  Menu item cards with [Add] buttons │
  │  Cart drawer with +/- controls      │
  │  Checkout → /store/pizza-hub/checkout│
  └─────────────────────────────────────┘

Customer visits /store/style-salon
         ↓
  StorefrontPage looks up vendor by slug
         ↓
  vendor.businessType === "salon"
         ↓
  ┌─────────────────────────────────────────┐
  │  No cart (bookings only)                │
  │  Category chips + search                │
  │  Service cards with [Book] buttons      │
  │  Date+time picker on click              │
  │  Booking flow → /store/style-salon/book/…│
  └─────────────────────────────────────────┘
```

**Additional differentiators baked in:**

| Aspect | Restaurant | Salon |
|---|---|---|
| Accent colour | Orange `#f97316` | Amber/gold `#f59e0b` |
| Type badge on storefront | 🍴 Restaurant | ✂️ Salon |
| CTA per item | "Add" / +/- counter | "Book" |
| Detail modal action | "Add to cart" | "Book this service" |
| Vendor dashboard label | "Menu" / "Orders" | "Services" / "Bookings" |
| Item fields | name, price, image, category | name, price, image, category, **duration** |
| Customer field defaults | Name (req), Phone (opt), Address (off), Notes (off) | Name (req), Phone (opt), Notes (off) |

### Why single-domain wins for MVP

- ✅ Zero DNS / SSL / wildcard cert config per vendor
- ✅ Slug uniqueness enforced at signup (Pizza Hub takes `pizza-hub` → nobody else can)
- ✅ Same session/cookie domain → simple auth
- ✅ Shared domain authority = better SEO for every store
- ✅ Instant onboarding — no waiting for DNS propagation
- ✅ Future upgrade: Pro plan can map `pizzahub.in` → internal `/store/pizza-hub` via reverse proxy (zero UI change needed)

---

## 5. Data model (all in LocalStorage for MVP)

### Vendor

```js
{
  id: "ven_abc123",
  email: "owner@pizzahub.com",
  password: "demo1234",              // plain text — MVP only
  createdAt: "2026-01-15T…Z",
  onboarded: true,
  disabled: false,                   // admin can disable a vendor
  businessType: "restaurant",        // "restaurant" | "salon"
  name: "Pizza Hub",
  slug: "pizza-hub",                 // unique, appears in URL
  tagline: "…",
  description: "…",
  logo: "https://…",
  coverImage: "https://…",
  address: "…",
  phone: "…",
  accent: "restaurant",              // "restaurant" | "salon"
  categories: [{ id, name }],
  items: [ /* restaurant only */ { id, name, description, price, categoryId, image, available } ],
  services: [ /* salon only */    { id, name, description, price, duration, categoryId, image, available } ],
  checkoutFields: {                  // vendor-configurable form
    name:    { enabled: true,  required: true,  label, placeholder },
    phone:   { enabled: true,  required: false, label, placeholder },
    address: { enabled: false, required: false, label, placeholder },
    notes:   { enabled: false, required: false, label, placeholder },
  },
  bookingFields: { /* same shape, without 'address' */ },
}
```

### Order (restaurant)

```js
{
  id: "ord_xyz789",
  code: "ORD-1042",
  vendorId: "ven_abc123",
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled",
  createdAt: "…",
  customer: { name, phone, address },   // only enabled fields filled
  items: [{ id, name, price, qty }],
  subtotal, tax, total,
  notes: "",
}
```

### Booking (salon)

```js
{
  id: "bkg_pqr456",
  code: "BKG-208",
  vendorId: "ven_abc123",
  status: "pending" | "confirmed" | "completed" | "cancelled",
  createdAt: "…",
  customer: { name, phone },
  service: { id, name, price, duration },
  date: "2026-01-16",
  slot: "11:30",
  notes: "",
}
```

### Admin

```js
{
  id: "adm_…",
  email: "admin@vyapar360.com",
  password: "admin123",
  name: "Vyapar Admin",
  role: "superadmin",
  createdAt: "…",
}
```

### Landing Config (editable via admin CMS)

```js
{
  hero: { eyebrow, headlineLine1, headlineLine2, headlineHighlight, headlineLine3, subtitle, ctaPrimary, ctaSecondary, perks: [], socialProof },
  stats: [{ value, label }, …],           // 4 items
  plans: [{ id, name, price, priceSuffix, tagline, badge, icon, ctaLabel, features: [{ text, included }] }],   // 3 plans
  faqs: [{ q, a }, …],
}
```

### LocalStorage keys

| Key | Contains |
|---|---|
| `vyapar360.session` | Vendor session `{ email, vendorId }` |
| `vyapar360.admin_session` | Admin session `{ email, adminId }` |
| `vyapar360.vendors` | `Vendor[]` |
| `vyapar360.admins` | `Admin[]` |
| `vyapar360.orders` | `Order[]` |
| `vyapar360.bookings` | `Booking[]` |
| `vyapar360.landing_config` | CMS-edited landing config (falls back to defaults) |
| `vyapar360.cart.{slug}` | Customer cart per vendor storefront |
| `vyapar360.seed_done` | One-time seed flag |

---

## 6. Key flows (end-to-end)

### 6a. Vendor journey (Restaurant example)

```
Landing (/)
   ↓ click "Launch your store"
Register (/register)
   ↓ email + password
Onboarding step 1: pick Restaurant
   ↓
Onboarding step 2: name (Pizza Hub) → auto-slug (pizza-hub) → tagline, description, address, phone
   ↓
Onboarding step 3: logo URL, cover URL, live preview
   ↓ click "Publish store"
Dashboard (/dashboard)
   ↓ Catalogue → add categories → add menu items with photos
   ↓ Settings → configure which fields customers must fill at checkout
   ↓
Share /store/pizza-hub on WhatsApp, Instagram, flyers
   ↓
Customer orders come in → appear in /dashboard/orders → transition status
   ↓ pending → preparing → ready → delivered
Insights (/dashboard/insights): revenue trend, top items
```

### 6b. Customer journey (Restaurant — Pizza Hub)

```
Visit /store/pizza-hub
   ↓ browse categories, search
Tap an item → detail modal → "Add to cart"
   ↓ (or +/- directly on card)
Cart badge shows count → tap cart trigger
Cart drawer opens with items + subtotal/tax/total
   ↓ tap "Checkout"
/store/pizza-hub/checkout
   ↓ fill Name (required) + Phone (optional) — only fields the vendor enabled
   ↓ tap "Place order · ₹X"
Order saved → cart cleared → redirect to
/store/pizza-hub/order/{orderId}
   ↓ status badge, itemised summary, delivery info
Done. (Meanwhile the vendor sees the order in their dashboard.)
```

### 6c. Customer journey (Salon — Style Salon)

```
Visit /store/style-salon
   ↓ browse services (categories: Hair, Skin, Spa, Grooming)
Tap "Book" on a service (e.g. Signature Haircut)
   ↓
/store/style-salon/book/{serviceId} — step 1
   ↓ pick a date (next 7 days)
   ↓ pick a time slot (10:00–18:30 every 30 min; booked slots grayed out)
   ↓ tap "Continue to details"
Step 2: fill Name (required) + Phone (optional or required per vendor config)
   ↓ tap "Confirm booking"
Booking saved → redirect to
/store/style-salon/booking/{bookingId}
   ↓ confirmation with all appointment details
Done. (Vendor sees it in /dashboard/bookings.)
```

### 6d. Admin journey

```
/admin/login → sign in with admin@vyapar360.com / admin123
   ↓
/admin (overview): total businesses, total orders, total bookings, platform GMV, recent activity
   ↓
/admin/businesses: search / filter every vendor
   ↓ click any row →
/admin/businesses/{id}: contact, stats, orders/bookings, actions (disable, delete)
   ↓
/admin/orders and /admin/bookings: cross-vendor tables with links back to business detail
   ↓
/admin/landing: edit hero copy, pricing, FAQ → save → refresh homepage to see changes
```

---

## 7. Features per persona

### 🌍 Customer (anonymous)
- Landing page with hero, features, "How it works" (4 steps), pricing (3 tiers), business types, testimonials, FAQ
- Discover directory with search + type filter
- Restaurant storefront: category tabs, search, detail modal, cart drawer
- Salon storefront: category tabs, search, detail modal, book flow
- Restaurant checkout (dynamic fields)
- Salon booking (date + time slot picker, dynamic fields)
- Confirmation pages for both

### 🏪 Vendor
- Register / login (mock, LocalStorage)
- 3-step onboarding wizard
- Dashboard Overview (stats + chart + recent list)
- Catalogue CRUD (items/services + categories, image URLs, availability toggle)
- Orders table (restaurant) with detail modal + status transitions
- Bookings table (salon) with detail modal + status transitions
- Insights (30-day trend + top items chart)
- Store settings (branding + slug + address + **configurable customer fields with Show/Required toggles**)
- Logout

### 🛡️ Admin
- Separate login (`/admin/login`)
- Overview stats across all vendors
- All businesses list (search + filter, disable/enable, delete)
- Business detail (per-vendor contact + activity)
- Cross-vendor orders table
- Cross-vendor bookings table
- Landing page CMS (hero, stats, plans, FAQ — save + reset)
- Logout

---

## 8. Design system

- **Theme**: Premium dark (base `#0a0a0c`, surface `#141417`, elevated `#1c1c21`, line `#27272a`)
- **Type**: Outfit (display / headlines) + Manrope (body)
- **Accents**:
  - Brand indigo `#6366f1` (primary)
  - Restaurant orange `#f97316`
  - Salon amber `#f59e0b`
  - Success emerald `#10b981`, Danger red `#ef4444`
- **Motion**: Framer Motion micro-animations, staggered reveals on hero, hover lift on cards
- **Layout**: Mobile-first (390 px baseline) → tablet → desktop up to 1400 px
- **Toasts**: Sonner, top-right, dark card style
- **Icons**: lucide-react (no emoji glyphs used as icons)

---

## 9. Project structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── App.js                 # Routes (public, vendor, admin, customer)
│   ├── index.js               # React root
│   ├── index.css              # Tailwind + global styles
│   ├── components/
│   │   ├── Container.jsx      # Container + Section
│   │   ├── Logo.jsx
│   │   ├── Modal.jsx
│   │   ├── PublicFooter.jsx
│   │   ├── PublicHeader.jsx   # Includes Pricing nav link
│   │   └── StatusBadge.jsx
│   ├── lib/
│   │   ├── auth.jsx           # Vendor auth context (useAuth)
│   │   ├── adminAuth.jsx      # Admin auth context (useAdminAuth)
│   │   ├── cart.jsx           # Cart context (per storefront)
│   │   ├── store.js           # LocalStorage data layer (REST-shaped)
│   │   └── utils.js           # cn(), formatINR(), slugify(), uid(), date helpers
│   └── pages/
│       ├── NotFoundPage.jsx
│       ├── marketing/
│       │   └── LandingPage.jsx       # Reads from landing_config
│       ├── auth/
│       │   ├── LoginPage.jsx         # Vendor login
│       │   └── RegisterPage.jsx      # Vendor register
│       ├── vendor/
│       │   ├── VendorDashboardLayout.jsx  # Sidebar + outlet
│       │   ├── OnboardingPage.jsx    # 3-step wizard
│       │   ├── OverviewPage.jsx
│       │   ├── CataloguePage.jsx
│       │   ├── OrdersPage.jsx        # Restaurant only
│       │   ├── BookingsPage.jsx      # Salon only
│       │   ├── InsightsPage.jsx
│       │   └── StoreSettingsPage.jsx # Includes checkout/booking field config
│       ├── customer/
│       │   ├── DiscoverPage.jsx
│       │   ├── StorefrontPage.jsx    # Renders restaurant OR salon UI
│       │   ├── CheckoutPage.jsx      # Dynamic fields
│       │   ├── BookingFlowPage.jsx   # Dynamic fields (step 2)
│       │   ├── OrderConfirmationPage.jsx
│       │   └── BookingConfirmationPage.jsx
│       └── admin/
│           ├── AdminLoginPage.jsx
│           ├── AdminLayout.jsx       # Sidebar + outlet
│           ├── AdminOverviewPage.jsx
│           ├── AdminBusinessesPage.jsx
│           ├── AdminBusinessDetailPage.jsx
│           ├── AdminOrdersPage.jsx
│           ├── AdminBookingsPage.jsx
│           └── AdminLandingCMSPage.jsx
├── tailwind.config.js
├── craco.config.js            # @/ alias → src
├── postcss.config.js
├── package.json
└── UNDERSTANDING.md           # (this file)
```

---

## 10. Demo credentials

| Persona | Email | Password | Lands on |
|---|---|---|---|
| Restaurant vendor | `owner@pizzahub.com` | `demo1234` | `/dashboard` (Pizza Hub) |
| Salon vendor | `owner@stylesalon.com` | `demo1234` | `/dashboard` (Style Salon) |
| Platform admin | `admin@vyapar360.com` | `admin123` | `/admin` |

Also on `/login`: one-click "Try a demo" buttons for the two vendors.
On `/admin/login`: "Use demo admin" button for the admin.

To reset: clear browser LocalStorage → next page load re-seeds via
`seedIfNeeded()` in `src/lib/store.js`.

---

## 11. Multi-vendor example (10 vendors, one domain)

If you have 5 restaurant vendors and 5 salon vendors, their URLs are simply:

**Restaurants:**
- `vyapar360.com/store/pizza-hub`
- `vyapar360.com/store/chai-point`
- `vyapar360.com/store/biryani-house`
- `vyapar360.com/store/roll-junction`
- `vyapar360.com/store/cafe-mocha`

**Salons:**
- `vyapar360.com/store/style-salon`
- `vyapar360.com/store/glow-studio`
- `vyapar360.com/store/the-barber-co`
- `vyapar360.com/store/bloom-spa`
- `vyapar360.com/store/urban-clip`

Every vendor picks their own slug during onboarding, uniqueness is enforced,
same domain, different tenant. `vendor.businessType` decides restaurant vs
salon UI at render time.

---

## 12. Roadmap / What's next

### Phase 2 (planned)
- **Real vendor auth**: Emergent Google OAuth or JWT-based backend
- **Payment gateway**: Stripe checkout on restaurant place-order
- **WhatsApp notifications**: order + booking alerts to vendors and customers
- **Real REST backend**: swap the LocalStorage adapter (`src/lib/store.js`) for `fetch()` calls to `/api/...` — the shape is designed to match
- **QR code per storefront**: printable QR generated from `/store/{slug}` for restaurant tables and salon reception counters

### Phase 3+
- Additional business types (Gym, Pharmacy, Grocery, Bakery, Boutique, Spa, Clinic)
- Image uploads via Cloudinary / S3 instead of pasted URLs
- Customer-side live order tracking (websockets/polling)
- Reviews & ratings per storefront
- Coupon codes / promo campaigns
- Loyalty program (repeat customer discounts)
- Multi-language storefronts
- Vendor team members with roles (owner, manager, cashier)
- **Custom domain per vendor (Pro plan)** — reverse proxy `pizzahub.in` → `/store/pizza-hub`
- SEO/OG previews per storefront (server-side rendering)

---

## 13. Success testing summary

| Iteration | Scope | Result |
|---|---|---|
| 1 | Initial MVP end-to-end | ✅ ~97% pass · 1 critical bug fixed (Cart hydration race) |
| 2 | Landing page + 3-tier pricing | ✅ All new sections + data-testids verified |
| 3 | Admin dashboard + dynamic fields + landing CMS | ✅ Code review passed (test agent didn't run playwright due to session hop) |

---

## 14. TL;DR

- **One domain**, `vyapar360.com`
- **Three personas**: Customer (anon), Vendor (own dashboard), Admin (platform-wide)
- **`/store/{slug}`** hosts every storefront — the `businessType` field decides the UI
- **Slugs are globally unique** so `/store/pizza-hub` can never collide
- **`/dashboard`** is the same route for every vendor; the session determines whose data they see
- **`/admin/*`** is completely isolated with its own session; vendors and customers can't reach it
- **Configurable checkout fields**: every vendor decides which customer inputs to ask for and which are required
- **CMS-editable landing page**: platform admins can edit hero copy, pricing, and FAQ without shipping code

**All data lives in LocalStorage today** — the code is architected so that swapping to a real REST backend is a change inside `src/lib/store.js` only. No UI code changes needed.
