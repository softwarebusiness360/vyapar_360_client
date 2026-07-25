# Vyapar360 — API Contract

> The exact shape of every endpoint the frontend expects. This is the source of
> truth the backend team should implement.

**Status**: 🟡 Mocked (LocalStorage) — `REACT_APP_USE_MOCK_API=true` (default)
**Target**: 🟢 Real REST backend at `REACT_APP_BACKEND_URL` — flip
`REACT_APP_USE_MOCK_API=false` to swap.

**Base URL**: `${REACT_APP_BACKEND_URL}/api`
**Auth**: `Authorization: Bearer <sessionToken>` header (from LocalStorage `vyapar360.session.token` for vendor, `vyapar360.admin_session.token` for admin)
**Content-Type**: `application/json`
**Error shape** (non-2xx responses): `{ code: <http_status>, message: "..." }`

---

## Table of contents

- [Auth](#auth)
- [Vendors](#vendors)
- [Orders](#orders)
- [Bookings](#bookings)
- [Landing CMS](#landing-cms)
- [Frontend integration](#frontend-integration)
- [Migration checklist](#migration-checklist)

---

## Auth

### `POST /auth/vendor/register`
Create a new vendor account.

**Request**
```json
{ "email": "owner@example.com", "password": "min6chars" }
```
**Response `201`**
```json
{
  "vendor": { "id": "ven_…", "email": "…", "onboarded": false, "businessType": null, "…": "" },
  "sessionToken": "jwt.or.opaque"
}
```
**Errors**: `409` email already exists.

---

### `POST /auth/vendor/login`
**Request**: `{ "email", "password" }`
**Response `200`**: `{ vendor, sessionToken }`
**Errors**: `404` not found, `401` wrong password.

---

### `POST /auth/vendor/logout`
Auth: required. Invalidates the current session.
**Response `200`**: `{ "ok": true }`

---

### `GET /auth/vendor/me`
Auth: required. Returns the currently signed-in vendor.
**Response `200`**: `Vendor` or `null`.

---

### `POST /auth/admin/login`
Same shape as vendor login but for platform admins.
**Response**: `{ admin, sessionToken }`.

### `POST /auth/admin/logout` · `GET /auth/admin/me`
Admin equivalents of the vendor endpoints.

---

## Vendors

### `GET /vendors?q={search}&type={restaurant|salon|all}`
Public (used by `/discover`) and admin (used by `/admin/businesses`).

**Response `200`**: `Vendor[]` (only `onboarded: true && disabled: false` when called publicly; all when called by admin).

---

### `GET /vendors/{id}`
Auth: vendor (only own) or admin (any).
**Response `200`**: `Vendor`.

### `GET /vendors/by-slug/{slug}`
Public. Used by customer storefront.
**Response `200`**: `Vendor` (must be `onboarded && !disabled`).

### `PATCH /vendors/{id}`
Auth: vendor (self) or admin.
**Request**: partial `Vendor` — any of `name, slug, tagline, description, logo, coverImage, address, phone, businessType, categories, items, services, checkoutFields, bookingFields, onboarded, disabled`.
**Response `200`**: updated `Vendor`.
**Errors**: `409` slug taken.

### `DELETE /vendors/{id}`
Auth: admin only.
**Response `200`**: `{ "ok": true }`
**Side effect**: cascades — deletes all orders & bookings for that vendor.

### `GET /vendors/check-slug?slug={s}&exceptId={id?}`
Public. Used during onboarding & settings to validate slug availability.
**Response `200`**: `{ "available": true|false }`

---

## Orders

### `Order` schema
```ts
{
  id: string;
  code: string;                  // "ORD-1042"
  vendorId: string;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  createdAt: ISO;
  customer: { name: string; phone?: string; address?: string };  // only the fields the vendor enabled
  items: [{ id, name, price: number, qty: number }];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}
```

### `GET /orders?vendorId={id?}&status={status?}&q={search?}`
- Vendor auth → forces `vendorId = current vendor`.
- Admin auth → sees everything unless filters are set.
**Response `200`**: `Order[]` sorted by `createdAt desc`.

### `POST /orders`
Public (customer flow). No auth.
**Request**: `{ vendorId, customer, items, subtotal, tax, total, notes? }`
**Response `201`**: created `Order`.

### `PATCH /orders/{orderId}`
Auth: vendor (only own orders).
**Request**: `{ "status": "…" }`
**Response `200`**: updated `Order`.

---

## Bookings

### `Booking` schema
```ts
{
  id: string;
  code: string;                  // "BKG-208"
  vendorId: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: ISO;
  customer: { name: string; phone?: string };
  service: { id, name, price: number, duration: number };
  date: "YYYY-MM-DD";
  slot: "HH:MM";                 // 30-min increments 10:00..18:30
  notes?: string;
}
```

### `GET /bookings?vendorId={id?}&status={status?}&q={search?}`
Same auth semantics as orders.

### `POST /bookings`
Public. `{ vendorId, customer, service, date, slot, notes? }` → `Booking`.

### `PATCH /bookings/{bookingId}`
Vendor auth. `{ "status": "…" }` → updated `Booking`.

### `GET /bookings/slots?vendorId={id}&date={YYYY-MM-DD}`
Public. Returns the fixed slot schedule with availability flags.
**Response `200`**:
```json
[
  { "time": "10:00", "available": true },
  { "time": "10:30", "available": false },
  …
]
```

---

## Landing CMS

### `GET /landing`
Public. Returns the CMS-edited landing config (or defaults).
**Response `200`**: `LandingConfig` (see `/frontend/src/lib/store.js` `DEFAULT_LANDING_CONFIG`).

### `POST /landing`
Admin auth. Full replace of the landing config.
**Request**: `LandingConfig`
**Response `200`**: saved `LandingConfig`.

### `DELETE /landing`
Admin auth. Reset to defaults.
**Response `200`**: default `LandingConfig`.

---

## Frontend integration

### Where the client lives
```
frontend/src/lib/api/
├── index.js               ← import { api } from "@/lib/api"
├── adapters/
│   ├── mock.js            ← LocalStorage-backed, artificial 120 ms latency
│   └── http.js            ← fetch() against REACT_APP_BACKEND_URL
```

### Toggle at build/dev time
`frontend/.env`:
```
REACT_APP_USE_MOCK_API=true             # default — LocalStorage
REACT_APP_BACKEND_URL=https://…         # required when mock=false
```

### How consumers call it
Every function is **async** — even in mock mode — so nothing changes when
the real backend is enabled:

```js
import { api } from "@/lib/api";

async function loadVendors() {
  try {
    const vendors = await api.listVendors({ type: "restaurant", q: "pizza" });
    setVendors(vendors);
  } catch (err) {
    toast.error(err.message);
  }
}
```

Error shape is standardised across adapters:
```ts
{ code: number, message: string }
```

---

## Migration checklist (when the backend ships)

1. **Backend team implements** every endpoint in this doc.
2. **Deploy backend** to a URL, put it in `REACT_APP_BACKEND_URL`.
3. **Frontend `.env`**: set `REACT_APP_USE_MOCK_API=false`.
4. **Session tokens**: real backend returns proper JWTs from
   `/auth/*/login` and `/auth/*/register`. Store `sessionToken` in
   `vyapar360.session.token` / `vyapar360.admin_session.token` (already
   read by `http.js`).
5. **Seed the DB** with the two demo vendors + admin so the demo credentials
   in `README.md` still work.
6. **Delete** `frontend/src/lib/api/adapters/mock.js` (optional — leave it in
   for offline dev / Storybook).
7. **Run the test suite** — no consumer code has to change.

---

## Additive future endpoints (Phase 2)

- `POST /payments/checkout-session` — Stripe checkout session creation.
- `POST /notifications/whatsapp` — send WhatsApp order/booking confirmation.
- `POST /uploads` — signed URL for direct upload to Cloudinary/S3.
- `GET /insights/{vendorId}?range=30d` — server-computed analytics.
- `GET /storefronts/{slug}/qr` — PNG QR code for a storefront URL.

These are **not required** for parity with the mock adapter — they enable
new features not yet in the UI.
