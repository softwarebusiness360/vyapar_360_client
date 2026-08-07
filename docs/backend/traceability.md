# Frontend-to-Backend Traceability

This matrix confirms that every routed application area and every current
repository boundary has a target backend contract.

## Route coverage

| Frontend route ID | UI path | Required backend contracts |
|---|---|---|
| `marketing-home` | `/` | `GET /public/landing` |
| `customer-discover` | `/discover` | `GET /public/storefronts` |
| `vendor-login` | `/login` | `POST /auth/business/login`, `GET /auth/me` |
| `vendor-register` | `/register` | `POST /auth/business/register` |
| `vendor-onboarding` | `/onboarding` | `POST /business/onboarding/complete`, media upload |
| `vendor-dashboard` | `/dashboard` | `GET /business`, `GET /business/entitlements` |
| `vendor-overview` | dashboard index | analytics summary and recent order/booking lists |
| `vendor-pos` | `/dashboard/pos` | public catalogue read plus business order/booking create |
| `vendor-catalogue` | `/dashboard/catalogue` | category, item, service, and media endpoints |
| `vendor-orders` | `/dashboard/orders` | business order list/detail/transitions |
| `vendor-bookings` | `/dashboard/bookings` | business booking list/detail/transitions |
| `vendor-insights` | `/dashboard/insights` | analytics summary/storefront/member endpoints |
| `vendor-storefronts` | `/dashboard/storefronts` | storefront list/create/update/archive |
| `vendor-storefront-detail` | `/dashboard/storefronts/:sfId` | storefront detail/update/publish |
| `vendor-team` | `/dashboard/team` | membership CRUD and access control |
| `vendor-settings` | `/dashboard/settings` | storefront profile and field configuration |
| `vendor-profile` | `/dashboard/profile` | auth actor, workspace, member performance |
| `admin-login` | `/admin/login` | `POST /auth/admin/login` |
| `admin-layout` | `/admin` | admin actor bootstrap |
| `admin-overview` | admin index | `GET /admin/overview` |
| `admin-businesses` | `/admin/businesses` | admin business list/lifecycle/plan |
| `admin-business-detail` | `/admin/businesses/:vendorId` | admin business detail and scoped transactions |
| `admin-orders` | `/admin/orders` | cross-tenant admin order list |
| `admin-bookings` | `/admin/bookings` | cross-tenant admin booking list |
| `admin-landing` | `/admin/landing` | landing draft/save/publish/reset |
| `admin-plans` | `/admin/plans` | plan config get/update/reset |
| `admin-personas` | `/admin/personas` | persona config get/update/reset |
| `admin-onboard` | `/admin/onboard` | `POST /admin/businesses` plus media |
| `customer-profile` | `/me` | customer auth/profile/transactions |
| `customer-storefront` | `/store/:slug` | public storefront/catalogue |
| `customer-checkout` | `/store/:slug/checkout` | public order create |
| `customer-book` | `/store/:slug/book/:serviceId` | public availability and booking create |
| `customer-order-confirmation` | `/store/:slug/order/:orderId` | protected public order confirmation |
| `customer-booking-confirmation` | `/store/:slug/booking/:bookingId` | protected public booking confirmation |
| `not-found` | `*` | no domain endpoint |

Chat is rendered as a shared customer feature rather than a route and maps to
the customer conversation/message endpoints.

## Repository coverage

| Current repository | Current responsibility | Target module/API |
|---|---|---|
| `authRepository` | all persona sessions and customer identity | identity and access |
| `businessRepository` | vendor aggregate and account creation | business + identity |
| `storefrontRepository` | storefronts and public lookup | business/storefront + catalogue |
| `workforceRepository` | nested employee CRUD and performance | workforce + analytics |
| `orderRepository` | order persistence/status | orders |
| `bookingRepository` | booking persistence/status/slots | bookings |
| `analyticsRepository` | KPIs, trends, per-store results | analytics |
| `configurationRepository` | landing, plans, personas, feature overrides | configuration |
| `engagementRepository` | transaction history and chat | customer + engagement |
| `adminRepository` | re-exported cross-tenant operations | platform admin composition |

## Contract decisions requiring frontend changes

| Current behavior | Required client change |
|---|---|
| repository calls are synchronous | add loading, retry, error, empty, and conflict states |
| features import `src/data` directly | introduce API-backed repository/client modules |
| whole vendor objects are saved | send narrow onboarding/storefront/catalogue/member commands |
| browser sends totals and prices | send item IDs and quantities only; display server result |
| booking sends copied service object | send service ID and start instant only |
| POS sends employee ID | derive actor from access session |
| customer history may match by name | use guest/customer subject attached at creation |
| confirmation uses record ID in URL | retain opaque confirmation token or customer session |
| public store flow uses legacy vendor slug | resolve every URL through storefront slug |
| fixed browser slot generator | render availability returned by backend |
| status update accepts a string | send transition command with current version |
| logo/cover are arbitrary URL strings | use signed media upload flow |
| broad localStorage session objects | bootstrap actor with `GET /auth/me` |

## Definition of contract parity

Contract parity is achieved when:

1. every route above can operate without domain data in `localStorage`;
2. public responses have automated secret-field leak tests;
3. every mutation is authorized on the server;
4. order totals and booking availability are server-authoritative;
5. all current plans, permissions, product states, channels, and status displays
   can be represented;
6. customer history is identity-linked;
7. admin operations are audited;
8. concurrency and idempotency tests pass.

