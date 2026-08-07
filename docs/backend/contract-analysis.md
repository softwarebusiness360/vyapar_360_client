# Contract Analysis

## 1. Executive summary

The application is a local-first React prototype. Its real data contract is the
set of synchronous functions in `src/data/*Repository.js`, backed by
`localStorage`. The HTTP adapter in `src/lib/api/adapters/http.js` is not used by
the feature code and covers only auth, vendors, orders, bookings, and landing
configuration.

The backend therefore cannot be designed by translating the current HTTP
adapter alone. It must replace the repository behavior used by all screens and
must correct the security, tenancy, consistency, and concurrency assumptions
that are safe only in a browser prototype.

## 2. Evidence inspected

The contract baseline was derived from:

- all route definitions and route guards under `src/app/routes`;
- authentication, customer authentication, admin authentication, cart, and
  RBAC contexts under `src/lib`;
- all repositories under `src/data`;
- vendor, customer, and admin feature consumers under `src/features`;
- model defaults, seed data, repository tests, and `API_CONTRACT.md`;
- the mock and HTTP adapters under `src/lib/api/adapters`.

## 3. Actor contract

| Actor | Current identity | Required backend identity | Effective scope |
|---|---|---|---|
| Anonymous | no server session | anonymous request or signed guest token | public published storefronts and public commands |
| Customer guest | name-only local session | signed guest session with opaque subject ID | own newly created transactions and chat |
| Customer | phone + mock OTP | verified phone identity | own profile, transactions, and chat |
| Owner | vendor email/password | business membership with `owner` role | all resources in one business |
| Manager | employee email/password | business membership with `manager` role | assigned storefronts plus permissions |
| Employee | employee email/password | business membership with `employee` role | assigned storefronts plus permissions |
| Platform admin | separate admin session | platform identity | cross-tenant administration |

The backend must enforce actor, tenant, storefront assignment, explicit
permission, plan entitlement, and resource ownership. Client route guards and
persona visibility are presentation controls only.

## 4. Current repository contracts

### Identity and customer

Current operations:

- vendor or employee login by email/password;
- vendor registration;
- owner, employee, admin, and customer sessions;
- customer guest login by name;
- customer phone login/upgrade using a mock OTP;
- customer transaction lookup by customer ID, then phone, then name.

Required correction:

- hash passwords and never return them;
- use one identity model with business memberships for owners/employees;
- verify OTP through a provider abstraction with expiry, attempts, resend
  limits, and rate limits;
- attach an authenticated or guest `customerId` to created transactions;
- stop using names as durable ownership evidence.

### Business and storefront

Current operations:

- create, read, save, disable, and delete vendors;
- onboard a vendor by replacing most of the vendor object;
- create, update, and delete storefronts;
- find a public storefront by slug;
- apply plan limits for multiple stores.

Required correction:

- split business account from storefront presentation data;
- use command-specific requests instead of accepting a whole vendor aggregate;
- make slugs globally unique and checked transactionally;
- support every storefront slug, not only the legacy first-storefront facade;
- use soft deletion and lifecycle states rather than destructive cascade
  deletion of financial transactions.

### Catalogue and store configuration

Current operations:

- CRUD categories, restaurant items, and salon services by replacing arrays
  inside a storefront/vendor object;
- configure checkout and booking form fields;
- product states: `available`, `out_of_stock`, `coming_soon`,
  `not_available`;
- image fields are URL strings.

Required correction:

- expose resource-level category, item, and service commands;
- enforce category/storefront ownership and business type;
- store money in integer minor units;
- validate configurable fields from an allowlist;
- issue signed media upload URLs and persist media references;
- keep immutable item/service snapshots on transactions.

### Workforce and authorization

Current operations:

- add, update, disable, and delete employees;
- roles: `owner`, `manager`, `employee`;
- permissions: `takeOrders`, `takeBookings`, `viewInsights`,
  `editCatalogue`;
- assign employees to storefront IDs;
- enforce plan employee limits;
- derive employee performance.

Required correction:

- treat employees as identities plus memberships, not nested objects;
- do not allow arbitrary patches to role, password, permissions, or tenant;
- validate all assigned storefronts belong to the same business;
- prevent removing the last owner;
- revoke sessions after disable, password reset, or material role change.

### Orders

Current operations:

- list vendor orders;
- create online and walk-in/POS orders;
- statuses: `pending`, `preparing`, `ready`, `delivered`, `cancelled`;
- update status without transition validation;
- frontend sends product names, prices, subtotal, tax, total, vendor ID,
  storefront ID, and sometimes employee ID.

Required correction:

- public order creation takes `storefrontId`, item IDs/quantities, customer
  fields, and notes only;
- derive business, catalogue snapshots, prices, tax, totals, channel, and actor
  on the server;
- POS actor and employee ID come from authentication;
- enforce a status state machine and optimistic concurrency;
- support idempotency for create commands;
- protect confirmation/history records by ownership or opaque access token.

### Bookings

Current operations:

- list bookings;
- create online and walk-in/POS bookings;
- statuses: `pending`, `confirmed`, `completed`, `cancelled`;
- generate fixed 30-minute slots from 10:00 through 18:30;
- exclude already booked vendor/date/slot combinations;
- update status without transition validation.

Required correction:

- configure opening hours, slot interval, capacity, timezone, and optional
  employee/resource assignment per storefront;
- scope availability by storefront and service, not only vendor and date;
- derive service details and duration on the server;
- reserve a slot in the same database transaction as booking creation;
- prevent double booking with a database constraint or capacity lock;
- enforce a status state machine and cancellation rules.

### Analytics

Current operations:

- filter orders/bookings by business, storefront, and date range;
- exclude cancelled records by default;
- calculate revenue, counts, average ticket, daily trend, per-store results, and
  employee performance.

Required correction:

- define timezone and inclusive/exclusive date semantics;
- define revenue recognition: delivered orders and completed bookings are
  recommended for realized revenue;
- return aggregate DTOs rather than raw cross-domain entities;
- calculate from transactional tables initially; add rollups only when volume
  requires them.

### Admin configuration

Current operations:

- cross-tenant business, order, and booking lists;
- onboard, disable, or delete a business;
- set a business plan and feature overrides;
- edit global plan matrix;
- edit feature-to-persona visibility matrix;
- edit and reset landing-page CMS configuration.

Required correction:

- audit every platform mutation;
- separate entitlements from UI visibility;
- version global configurations and support compare-and-swap updates;
- prohibit plan/persona configuration from weakening backend authorization;
- use business lifecycle commands (`suspend`, `reactivate`, `archive`) instead
  of saving entire entities.

### Customer engagement

Current operations:

- retrieve customer order/booking history;
- append chat messages;
- generate deterministic automatic replies.

Required correction:

- use conversation and message resources;
- authorize by customer/guest subject;
- distinguish `customer`, `bot`, `agent`, and `system` authors;
- rate-limit anonymous messaging and moderate payload size;
- keep the current deterministic reply engine behind a replaceable responder
  interface.

## 5. Current HTTP adapter coverage gap

| Capability | Current adapter | Required |
|---|---:|---:|
| Vendor/admin auth | Partial | Yes |
| Customer guest/OTP auth | No | Yes |
| Public discovery/storefront | Partial vendor lookup | Yes, public DTO |
| Business onboarding/lifecycle | Partial generic update/delete | Yes, commands |
| Storefront CRUD | No | Yes |
| Catalogue CRUD | No | Yes |
| Checkout/booking field configuration | No | Yes |
| Workforce and permissions | No | Yes |
| Orders | Partial | Yes |
| Bookings/availability | Partial | Yes |
| Customer transaction history | No | Yes |
| Analytics and employee performance | No | Yes |
| Plan matrix and feature overrides | No | Yes |
| Persona visibility matrix | No | Yes |
| Landing CMS | Yes | Yes |
| Chat | No | Yes |
| Media upload | No | Yes |
| Audit trail | No | Yes |

## 6. Canonical domain vocabulary

The backend uses these names consistently:

| Frontend term | Backend term | Reason |
|---|---|---|
| vendor | business | separates tenant/account from storefront |
| employee nested in vendor | membership + identity | supports secure login and authorization |
| item | menu item | restaurant-specific catalogue entry |
| service | service | salon-specific catalogue entry |
| vendor slug facade | storefront slug | every location has its own public URL |
| admin | platform admin | avoids confusion with business owner |
| total/price number | `*Minor` integer | prevents floating-point money errors |

## 7. DTO boundaries

### Public storefront DTO

May include:

- storefront ID, slug, name, business type, branding, contact display fields;
- enabled public form schema;
- categories and orderable catalogue entries;
- opening/availability summary.

Must not include:

- owner email, password hash, internal phone, plan overrides;
- employees, permissions, disabled identities;
- unpublished catalogue entries or internal audit fields.

### Business workspace DTO

Includes business ID, plan summary, effective entitlements, authorized
storefront summaries, and current actor membership. It does not include password
hashes or other users' authentication material.

### Transaction DTO

Includes immutable item/service snapshots, monetary breakdown, status,
timestamps, customer fields allowed for the actor, and a `version`. Public
confirmation DTOs contain a reduced field set.

## 8. Cross-cutting protocol contract

- Base path: `/api/v1`
- Media type: `application/json`
- IDs: opaque strings; clients must not infer type or ordering.
- Time: RFC 3339 UTC instants; local business dates use `YYYY-MM-DD` plus an
  IANA timezone.
- Money: integer minor units plus ISO 4217 currency, default `INR`.
- Pagination: cursor-based with `limit` and `nextCursor`.
- Filtering: explicit query parameters; no arbitrary field/operator grammar.
- Mutation concurrency: `version` in request or `If-Match`.
- Create idempotency: `Idempotency-Key` for orders, bookings, onboarding, and
  other retryable commands.
- Errors: stable machine code, human message, field details, and request ID.
- Correlation: accept/return `X-Request-Id`.
- Soft deletion: archived resources are excluded by default.

## 9. Important frontend defects and migration traps

1. Feature pages bypass `src/lib/api` and call repositories directly. The
   frontend must be migrated repository-by-repository or given API-backed
   repository implementations.
2. `deleteStorefront` calls `read` and `write` without importing them.
3. public pages can receive complete vendor objects, which contain credentials
   and workforce data in the prototype.
4. secondary storefront lookup exists in one repository, while public pages
   still use the legacy vendor-slug path in several flows.
5. cart totals and five-percent tax are calculated by the browser.
6. status updates accept any string and any transition.
7. booking availability is race-prone and too broadly scoped.
8. customer ownership falls back to matching a name.
9. admin and owner screens save broad entity snapshots, causing lost-update and
   over-posting risks.
10. prototype deletions destroy order/booking history; production must preserve
    ledger and audit records.

## 10. Migration contract

The frontend transition should preserve feature behavior while replacing the
repository implementation:

1. introduce async API-backed repositories with the same feature-oriented
   methods;
2. migrate public read APIs and customer commands;
3. migrate auth and session bootstrap;
4. migrate vendor workspace resources;
5. migrate admin/configuration and analytics;
6. remove local seed/persistence paths after parity tests pass.

Existing repository functions are synchronous. Every consumer must be updated
for loading, retry, empty, conflict, forbidden, and validation states when the
repositories become asynchronous.

