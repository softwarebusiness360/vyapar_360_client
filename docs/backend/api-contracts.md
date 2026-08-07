# REST API Contracts

## 1. Protocol

All endpoints are below `/api/v1` and exchange JSON unless an upload URL is
being used. Protected endpoints require an access token. A rotating refresh
token is kept in a secure, `HttpOnly`, `SameSite=Lax` cookie.

Successful single-resource response:

```json
{
  "data": {},
  "meta": {
    "requestId": "req_opaque"
  }
}
```

Successful collection response:

```json
{
  "data": [],
  "page": {
    "nextCursor": null,
    "hasMore": false
  },
  "meta": {
    "requestId": "req_opaque"
  }
}
```

Error response:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request contains invalid fields.",
    "fields": [
      {
        "path": "items.0.quantity",
        "code": "TOO_SMALL",
        "message": "Quantity must be at least 1."
      }
    ],
    "requestId": "req_opaque"
  }
}
```

Common status mapping:

| HTTP | Use |
|---:|---|
| 200 | successful read/update/action |
| 201 | resource created |
| 204 | successful logout/archive with no body |
| 400 | malformed input |
| 401 | missing, expired, or invalid authentication |
| 403 | authenticated but not permitted/entitled/assigned |
| 404 | resource absent or hidden across a tenant boundary |
| 409 | slug, version, idempotency, state, or slot conflict |
| 422 | structurally valid command violates a domain rule |
| 429 | rate limit exceeded |

Common error codes include `AUTHENTICATION_REQUIRED`, `INVALID_CREDENTIALS`,
`OTP_INVALID`, `OTP_EXPIRED`, `FORBIDDEN`, `TENANT_MISMATCH`,
`STOREFRONT_NOT_ASSIGNED`, `ENTITLEMENT_REQUIRED`, `VALIDATION_FAILED`,
`NOT_FOUND`, `SLUG_TAKEN`, `VERSION_CONFLICT`, `INVALID_STATE_TRANSITION`,
`SLOT_UNAVAILABLE`, `IDEMPOTENCY_CONFLICT`, and `RATE_LIMITED`.

## 2. Authentication and sessions

| Method | Path | Actor | Purpose |
|---|---|---|---|
| POST | `/auth/business/register` | public | create owner identity and draft business |
| POST | `/auth/business/login` | public | login owner/manager/employee |
| POST | `/auth/admin/login` | public | login platform admin |
| POST | `/auth/customer/guest` | public | create signed guest identity |
| POST | `/auth/customer/otp/request` | public | request phone OTP |
| POST | `/auth/customer/otp/verify` | public/guest | verify OTP and create/upgrade customer |
| POST | `/auth/refresh` | refresh cookie | rotate tokens |
| POST | `/auth/logout` | any authenticated actor | revoke current session |
| POST | `/auth/logout-all` | authenticated | revoke all actor sessions |
| GET | `/auth/me` | authenticated/guest | bootstrap actor, membership, and permissions |

Business registration:

```json
{
  "email": "owner@example.com",
  "password": "strong-password",
  "businessName": "Pizza Hub"
}
```

Business login:

```json
{
  "email": "person@example.com",
  "password": "strong-password"
}
```

Customer guest:

```json
{
  "name": "Ananya Rao"
}
```

OTP request and verification:

```json
{
  "phone": "+919876543210",
  "purpose": "login"
}
```

```json
{
  "challengeId": "otp_opaque",
  "code": "123456",
  "name": "Ananya Rao"
}
```

`GET /auth/me` returns one of:

- business actor: identity, business membership, effective permissions,
  assigned storefront IDs, business onboarding state, and effective
  entitlements;
- platform admin: identity and platform role;
- customer/guest: customer-safe profile and guest flag.

## 3. Public content, discovery, and storefront

| Method | Path | Actor | Purpose |
|---|---|---|---|
| GET | `/public/landing` | public | published landing CMS configuration |
| GET | `/public/storefronts` | public | discover published storefronts |
| GET | `/public/storefronts/:slug` | public | public storefront and catalogue |
| GET | `/public/storefronts/:storefrontId/availability` | public | service slots for a local date |
| GET | `/public/orders/:orderId/confirmation` | customer/token | reduced confirmation |
| GET | `/public/bookings/:bookingId/confirmation` | customer/token | reduced confirmation |

Discovery filters:

```text
GET /public/storefronts?businessType=restaurant&query=pizza&cursor=...&limit=20
```

Only onboarded, published, non-suspended businesses and enabled storefronts are
returned.

Availability request:

```text
GET /public/storefronts/sf_123/availability?serviceId=svc_123&date=2026-08-01
```

Availability response items contain a start instant, local display time,
duration, remaining capacity, and availability boolean.

Confirmation access requires either the owning customer/guest session or an
opaque `accessToken` returned only when the order/booking was created. A record
ID alone is insufficient.

## 4. Business workspace and onboarding

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/business` | business member | workspace bootstrap |
| PATCH | `/business/profile` | owner | update account/profile fields |
| POST | `/business/onboarding/complete` | owner | atomically complete onboarding |
| GET | `/business/entitlements` | business member | effective plan and limits |

Onboarding command:

```json
{
  "businessType": "restaurant",
  "storefront": {
    "name": "Pizza Hub",
    "slug": "pizza-hub",
    "tagline": "Fresh from the oven",
    "description": "Neighbourhood pizza",
    "logoMediaId": "med_123",
    "coverMediaId": "med_456",
    "address": "Bengaluru",
    "publicPhone": "+919876543210",
    "accent": "restaurant"
  }
}
```

The command creates or finalizes the primary storefront and changes business
state from `draft` to `active`. It is idempotent.

## 5. Storefronts and settings

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/business/storefronts` | business member | list authorized storefronts |
| POST | `/business/storefronts` | owner + entitlement | create storefront |
| GET | `/business/storefronts/:id` | assigned member | get internal detail |
| PATCH | `/business/storefronts/:id` | owner | update profile/settings |
| POST | `/business/storefronts/:id/publish` | owner | publish storefront |
| POST | `/business/storefronts/:id/unpublish` | owner | unpublish storefront |
| DELETE | `/business/storefronts/:id` | owner | archive storefront |
| GET | `/slugs/availability` | owner | check a normalized slug |

Create storefront:

```json
{
  "name": "Pizza Hub Indiranagar",
  "slug": "pizza-hub-indiranagar",
  "businessType": "restaurant"
}
```

Storefront patch allowlist:

```json
{
  "version": 4,
  "name": "Pizza Hub",
  "slug": "pizza-hub",
  "tagline": "Fresh from the oven",
  "description": "Neighbourhood pizza",
  "logoMediaId": "med_123",
  "coverMediaId": "med_456",
  "address": "Bengaluru",
  "publicPhone": "+919876543210",
  "accent": "restaurant",
  "timezone": "Asia/Kolkata",
  "checkoutFields": {},
  "bookingFields": {},
  "openingHours": []
}
```

The API rejects deletion of the last active storefront while a business is
active. Archiving does not delete historical transactions.

## 6. Catalogue

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/business/storefronts/:sfId/categories` | assigned member | list categories |
| POST | `/business/storefronts/:sfId/categories` | `editCatalogue` | create category |
| PATCH | `/business/storefronts/:sfId/categories/:id` | `editCatalogue` | rename/reorder |
| DELETE | `/business/storefronts/:sfId/categories/:id` | `editCatalogue` | archive category |
| GET | `/business/storefronts/:sfId/items` | assigned member | list menu items |
| POST | `/business/storefronts/:sfId/items` | `editCatalogue` | create menu item |
| PATCH | `/business/storefronts/:sfId/items/:id` | `editCatalogue` | update menu item |
| DELETE | `/business/storefronts/:sfId/items/:id` | `editCatalogue` | archive menu item |
| GET | `/business/storefronts/:sfId/services` | assigned member | list services |
| POST | `/business/storefronts/:sfId/services` | `editCatalogue` | create service |
| PATCH | `/business/storefronts/:sfId/services/:id` | `editCatalogue` | update service |
| DELETE | `/business/storefronts/:sfId/services/:id` | `editCatalogue` | archive service |

Menu item command:

```json
{
  "name": "Margherita",
  "description": "Tomato, basil, mozzarella",
  "categoryId": "cat_123",
  "priceMinor": 34900,
  "currency": "INR",
  "state": "available",
  "mediaIds": ["med_123"]
}
```

Service command additionally accepts `durationMinutes`. Items are valid only
for restaurant storefronts and services only for salon storefronts.

## 7. Workforce

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/business/members` | owner | list memberships |
| POST | `/business/members` | owner + entitlement | invite/create member |
| PATCH | `/business/members/:id` | owner | update name/role/assignments |
| POST | `/business/members/:id/reset-password` | owner | start credential reset |
| POST | `/business/members/:id/disable` | owner | disable and revoke sessions |
| POST | `/business/members/:id/enable` | owner | enable membership |
| DELETE | `/business/members/:id` | owner | archive membership |
| GET | `/business/members/performance` | `viewInsights` | aggregate performance |

Member create:

```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "temporaryPassword": "one-time-secret",
  "role": "employee",
  "storefrontIds": ["sf_123"],
  "permissions": {
    "takeOrders": true,
    "takeBookings": false,
    "viewInsights": false,
    "editCatalogue": false
  }
}
```

If invitation email delivery is added, `temporaryPassword` is replaced by an
invitation flow without changing the membership resource.

## 8. Orders

| Method | Path | Actor/permission | Purpose |
|---|---|---|---|
| POST | `/public/storefronts/:sfId/orders` | public/customer | create online order |
| POST | `/business/storefronts/:sfId/orders` | `takeOrders` | create walk-in POS order |
| GET | `/business/orders` | `takeOrders` | list authorized orders |
| GET | `/business/orders/:id` | `takeOrders` | get order |
| POST | `/business/orders/:id/transitions` | `takeOrders` | transition status |

Public/POS create request:

```json
{
  "items": [
    {
      "itemId": "item_123",
      "quantity": 2
    }
  ],
  "customer": {
    "name": "Ananya Rao",
    "phone": "+919876543210",
    "address": "Bengaluru"
  },
  "notes": "Less spicy"
}
```

POS may use a walk-in customer with only a name. The server sets `channel`,
`businessId`, `storefrontId`, `employeeMembershipId`, snapshots, prices, taxes,
and totals. `Idempotency-Key` is required.

Transition request:

```json
{
  "to": "preparing",
  "version": 2,
  "reason": null
}
```

Allowed transitions:

- `pending -> preparing | cancelled`
- `preparing -> ready | cancelled`
- `ready -> delivered | cancelled`
- `delivered` and `cancelled` are terminal

Cancellation after `ready` may be restricted by policy later; the current
baseline allows it for authorized staff and records a reason.

## 9. Bookings

| Method | Path | Actor/permission | Purpose |
|---|---|---|---|
| POST | `/public/storefronts/:sfId/bookings` | public/customer | create online booking |
| POST | `/business/storefronts/:sfId/bookings` | `takeBookings` | create walk-in booking |
| GET | `/business/bookings` | `takeBookings` | list authorized bookings |
| GET | `/business/bookings/:id` | `takeBookings` | get booking |
| POST | `/business/bookings/:id/transitions` | `takeBookings` | transition status |

Create request:

```json
{
  "serviceId": "svc_123",
  "startAt": "2026-08-01T05:30:00.000Z",
  "customer": {
    "name": "Meera Iyer",
    "phone": "+919876543210"
  },
  "notes": "Prefer a senior stylist"
}
```

`Idempotency-Key` is required. The server derives service snapshot, duration,
end time, price, business, storefront, channel, customer subject, and employee
actor.

Allowed transitions:

- `pending -> confirmed | cancelled`
- `confirmed -> completed | cancelled`
- `completed` and `cancelled` are terminal

The initial online policy may create directly as `confirmed` when capacity is
reserved, matching the current application behavior.

## 10. Customer profile and engagement

| Method | Path | Actor | Purpose |
|---|---|---|---|
| GET | `/customer/me` | customer/guest | profile |
| PATCH | `/customer/me` | verified customer | update profile |
| GET | `/customer/me/transactions` | customer/guest | own orders/bookings |
| GET | `/customer/me/conversations` | customer/guest | list conversations |
| POST | `/customer/me/conversations` | customer/guest | start conversation |
| GET | `/customer/me/conversations/:id/messages` | owner | transcript |
| POST | `/customer/me/conversations/:id/messages` | owner | append message |

Transaction filters include `statusGroup=current|past`,
`channel=online|walk_in`, `type=order|booking`, cursor, and limit.

Message request:

```json
{
  "text": "Where is my order?"
}
```

Message authors in responses are `customer`, `bot`, `agent`, or `system`.

## 11. Analytics

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/business/analytics/summary` | `viewInsights` | KPIs and daily trend |
| GET | `/business/analytics/storefronts` | `viewInsights` | per-store breakdown |
| GET | `/business/analytics/members` | `viewInsights` | member performance |

Common filters:

```text
?from=2026-07-01&to=2026-07-31&storefrontId=sf_123&timezone=Asia/Kolkata
```

The `to` local date is inclusive. The server converts the range to a
half-open UTC interval `[fromStart, dayAfterToStart)`.

Summary response:

```json
{
  "data": {
    "currency": "INR",
    "revenueMinor": 1250000,
    "orderRevenueMinor": 950000,
    "bookingRevenueMinor": 300000,
    "orders": 40,
    "bookings": 10,
    "transactionCount": 50,
    "averageTicketMinor": 25000,
    "trend": [
      {
        "date": "2026-07-31",
        "revenueMinor": 45000
      }
    ]
  }
}
```

## 12. Media

| Method | Path | Permission | Purpose |
|---|---|---|---|
| POST | `/media/uploads` | owner/`editCatalogue` | request signed upload |
| POST | `/media/uploads/:id/complete` | same actor | verify/finalize upload |
| DELETE | `/media/:id` | resource owner | archive unattached media |

The request includes filename, content type, byte size, and intended use. The
server returns a short-lived signed upload URL and media ID. Public DTOs contain
CDN URLs generated from attached media records.

## 13. Platform administration

All endpoints below require platform-admin authentication and generate audit
events.

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/overview` | cross-platform summary |
| GET | `/admin/businesses` | paginated business directory |
| POST | `/admin/businesses` | admin-assisted onboarding |
| GET | `/admin/businesses/:id` | business detail |
| POST | `/admin/businesses/:id/suspend` | suspend business |
| POST | `/admin/businesses/:id/reactivate` | reactivate business |
| DELETE | `/admin/businesses/:id` | archive business |
| PUT | `/admin/businesses/:id/plan` | change plan |
| PATCH | `/admin/businesses/:id/feature-overrides` | change overrides |
| GET | `/admin/orders` | cross-tenant order list |
| GET | `/admin/bookings` | cross-tenant booking list |
| GET | `/admin/config/plans` | plan matrix |
| PUT | `/admin/config/plans` | versioned plan matrix update |
| POST | `/admin/config/plans/reset` | reset to defaults |
| GET | `/admin/config/personas` | visibility matrix |
| PUT | `/admin/config/personas` | versioned visibility update |
| POST | `/admin/config/personas/reset` | reset to defaults |
| GET | `/admin/config/landing/draft` | landing draft |
| PUT | `/admin/config/landing/draft` | save versioned draft |
| POST | `/admin/config/landing/publish` | publish draft |
| POST | `/admin/config/landing/reset` | reset draft |
| GET | `/admin/audit-events` | query platform audit trail |

Business plan request:

```json
{
  "plan": "pro",
  "reason": "Manual upgrade approved"
}
```

Configuration update:

```json
{
  "version": 7,
  "value": {}
}
```

Plan entitlements control backend capability. Persona configuration controls UI
visibility only and cannot grant an operation denied by RBAC or entitlement.

## 14. List/filter contract

Business transaction lists support:

- `storefrontId`
- `status`
- `channel`
- `from` and `to`
- `query` for code/customer display fields
- `cursor` and `limit`
- `sort=-createdAt` as the fixed default

Platform lists additionally support `businessId` and `businessType`.

The server always applies the actor's tenant and storefront scope before query
filters. Supplying an unauthorized storefront ID returns `404` to avoid
revealing its existence.

