# Backend Component Design

## 1. Component rules

Each business module contains four layers:

- **HTTP**: route registration, request schema, DTO mapping;
- **application**: use cases, transaction boundary, authorization port calls;
- **domain**: entities, value objects, state rules, domain errors;
- **infrastructure**: PostgreSQL repositories and external-provider adapters.

Routes never query the database directly. Repositories never decide actor
permissions. Domain services do not depend on Express.

## 2. Shared platform components

| Component | Responsibility | Must not do |
|---|---|---|
| API composition root | create dependencies and mount routers | contain domain behavior |
| Request context | request ID, principal, locale, clock | load arbitrary business data |
| Authentication middleware | validate access session, create principal | decide resource authorization |
| Authorization service | role, permission, assignment, entitlement checks | serialize HTTP responses |
| Validation middleware | parse/coerce/reject unknown input | mutate state |
| Error mapper | domain/application error to stable HTTP error | leak stack/internal SQL |
| Transaction manager | callback-scoped DB transaction | hide external network calls in a DB transaction |
| Idempotency service | reserve, replay, reject key misuse | replace domain uniqueness constraints |
| Audit writer | append security/admin audit record | alter business behavior |
| Outbox writer | append integration event in transaction | call providers before commit |
| Clock/ID generator | deterministic test seams | embed business rules |

## 3. Identity and access component

### Responsibilities

- identity creation and normalized email/phone uniqueness;
- password credential verification and reset;
- owner/staff/platform-admin/customer login;
- session issuance, rotation, revocation, and reuse detection;
- guest subject issuance;
- OTP challenge lifecycle;
- `Principal` construction.

### Application services

- `RegisterBusinessOwner`
- `LoginBusinessActor`
- `LoginPlatformAdmin`
- `CreateGuestSession`
- `RequestCustomerOtp`
- `VerifyCustomerOtp`
- `RefreshSession`
- `LogoutSession`
- `GetCurrentActor`
- `RevokeIdentitySessions`

### Ports

```ts
interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(hash: string, plain: string): Promise<boolean>;
}

interface OtpProvider {
  send(input: { phone: string; code: string; expiresAt: Date }): Promise<void>;
}

interface SessionRepository {
  create(session: NewSession): Promise<Session>;
  rotate(input: RotateSession): Promise<RotatedSession>;
  revoke(sessionId: string): Promise<void>;
  revokeForIdentity(identityId: string): Promise<void>;
}
```

## 4. Business and storefront component

### Responsibilities

- business lifecycle: draft, active, suspended, archived;
- onboarding completion;
- storefront CRUD, publication, profile, form schema, opening hours;
- global slug registry;
- plan assignment and feature override storage;
- public storefront projection.

### Application services

- `CompleteBusinessOnboarding`
- `GetBusinessWorkspace`
- `UpdateBusinessProfile`
- `CreateStorefront`
- `UpdateStorefront`
- `PublishStorefront`
- `UnpublishStorefront`
- `ArchiveStorefront`
- `ResolvePublicStorefront`
- `SearchPublicStorefronts`
- `SuspendBusiness`
- `ReactivateBusiness`

### Invariants

- every business has at least one active owner membership;
- an active business has at least one non-archived storefront;
- a storefront belongs to exactly one business;
- normalized active slug is globally unique;
- storefront count may not exceed the effective plan limit;
- only published active storefronts of active businesses are public;
- business type cannot change after transactions exist without a migration.

## 5. Catalogue component

### Responsibilities

- categories;
- restaurant menu items;
- salon services;
- availability states and public projections;
- prices, currency, duration, sort order, and media associations.

### Application services

- category `List/Create/Update/Archive`;
- menu item `List/Create/Update/Archive`;
- service `List/Create/Update/Archive`;
- `GetPublicCatalogue`;
- `ResolveOrderableItems`;
- `ResolveBookableService`.

### Invariants

- category and entry belong to the same storefront;
- menu items exist only for restaurant storefronts;
- services exist only for salon storefronts;
- price is a non-negative integer minor amount;
- duration is a positive bounded number of minutes;
- only `available` entries may be ordered/booked;
- archive is non-destructive and transaction snapshots remain intact.

## 6. Workforce component

### Responsibilities

- membership lifecycle;
- role and permission management;
- storefront assignment;
- plan member limits;
- session revocation after security-sensitive changes.

### Application services

- `ListMembers`
- `CreateMember`
- `UpdateMemberAccess`
- `DisableMember`
- `EnableMember`
- `ArchiveMember`
- `InitiateMemberPasswordReset`
- `GetMemberPerformance`

### Invariants

- owner role is managed separately from manager/employee presets;
- a member is assigned only to storefronts in its business;
- email is globally unique among login identities;
- active member count respects plan limits;
- the last active owner cannot be disabled or archived;
- a member cannot elevate their own role or permissions.

## 7. Order component

### Responsibilities

- online and walk-in creation;
- authoritative price/tax calculation;
- immutable line snapshots;
- customer/guest ownership;
- status transition history;
- staff list/detail queries;
- opaque confirmation access.

### Collaborators

- catalogue query port;
- storefront policy port;
- customer subject port;
- tax policy;
- idempotency service;
- transaction manager;
- audit/outbox writers.

### Core interfaces

```ts
type CreateOrderCommand = {
  storefrontId: string;
  actor: Principal;
  channel: "online" | "walk_in";
  lines: Array<{ itemId: string; quantity: number }>;
  customer: Record<string, string>;
  notes?: string;
  idempotencyKey: string;
};

interface PricingPolicy {
  calculate(input: {
    lines: Array<{ unitPriceMinor: number; quantity: number }>;
    storefront: StorefrontPricingContext;
  }): MoneyBreakdown;
}
```

### Invariants

- at least one line and positive bounded quantities;
- every item is currently orderable in the target storefront;
- client-supplied prices/totals are ignored or rejected;
- configured required customer fields are present;
- actor is assigned to the storefront for POS;
- one idempotency key maps to one command fingerprint;
- transition follows the order state machine;
- each successful transition increments `version`.

## 8. Booking component

### Responsibilities

- opening-hours and service-duration availability;
- slot/capacity calculation;
- atomic booking reservation;
- online and walk-in creation;
- immutable service snapshot;
- status history and confirmation access.

### Collaborators

- service query port;
- storefront schedule port;
- customer subject port;
- capacity repository;
- idempotency service;
- transaction manager;
- outbox writer.

### Invariants

- service belongs to and is available in the storefront;
- requested start is aligned to scheduling rules and falls in opening hours;
- end is derived from service duration;
- non-cancelled capacity cannot exceed configured capacity;
- configured required customer fields are present;
- transition follows the booking state machine;
- cancellation releases capacity in the same transaction.

## 9. Customer component

### Responsibilities

- verified customer profile;
- guest subject;
- transaction ownership link;
- own transaction history and grouping.

Customer history queries use `customer_id` or immutable `guest_subject_id`.
Phone/name fallback may be used only by an explicit one-time migration, not by
runtime authorization.

## 10. Engagement component

### Responsibilities

- conversation ownership and lifecycle;
- append-only messages;
- deterministic auto-response adapter;
- future handoff to human support.

```ts
interface ConversationResponder {
  respond(input: {
    conversationId: string;
    text: string;
    context: ConversationContext;
  }): Promise<{ text: string; kind: "bot" | "none" }>;
}
```

Appending a customer message commits first; any response is produced
asynchronously or with a strict timeout so a responder failure does not lose the
customer message.

## 11. Configuration component

### Responsibilities

- plan definitions and limits;
- effective entitlement resolution;
- per-business feature overrides;
- feature/persona visibility configuration;
- landing CMS draft, publish, and reset;
- configuration versioning and audit.

Entitlement resolution:

```text
effective entitlement =
  plan entitlement
  overridden by explicit business feature override
  constrained by hard platform safety policy
```

Persona visibility is a separate presentation result:

```text
visible feature =
  persona matrix allows it
  and entitlement allows it
  and actor authorization allows the backing operation
```

## 12. Analytics component

### Responsibilities

- realized revenue and transaction aggregates;
- daily trend;
- per-storefront results;
- per-member performance;
- stable date/timezone semantics.

It uses read repositories/projections and performs no transactional mutation.
The initial implementation queries source tables. A future rollup projector may
consume domain events without changing the API contract.

## 13. Media component

### Responsibilities

- validate upload intent;
- produce scoped, expiring signed URLs;
- verify completed object metadata;
- attach media to resources;
- archive and clean orphaned objects;
- return CDN-safe public URLs.

Database records use states `pending`, `ready`, `attached`, `rejected`,
`archived`.

## 14. Platform admin component

Platform admin routes compose application services from business, order,
booking, and configuration modules rather than bypassing their invariants.
Cross-tenant read repositories are separate and injectable only into admin
queries.

Every mutation requires a reason for suspension, plan override, or destructive
archive and writes an audit record.

## 15. Events

Domain mutations append these integration events to the outbox:

- `business.registered`
- `business.onboarding_completed`
- `business.suspended`
- `storefront.published`
- `member.created`
- `member.disabled`
- `order.created`
- `order.status_changed`
- `booking.created`
- `booking.status_changed`
- `customer.phone_verified`
- `landing.published`

Event envelope:

```json
{
  "eventId": "evt_opaque",
  "eventType": "order.created",
  "occurredAt": "2026-07-31T10:00:00.000Z",
  "aggregateType": "order",
  "aggregateId": "ord_opaque",
  "businessId": "biz_opaque",
  "schemaVersion": 1,
  "payload": {}
}
```

Events carry IDs and minimal notification data, not credentials or unnecessary
personal data.

## 16. Frontend-to-component traceability

| Frontend area | Backend components |
|---|---|
| landing | configuration |
| discover/store page | business/storefront + catalogue |
| checkout/order confirmation | order + catalogue + customer |
| booking flow/confirmation | booking + catalogue + customer |
| customer profile | customer + order + booking |
| customer chat | engagement + customer |
| vendor onboarding/settings | business/storefront + media |
| catalogue | catalogue + media |
| POS | order or booking + workforce |
| orders/bookings boards | order/booking + authorization |
| storefront management | business/storefront + configuration |
| team | workforce + identity |
| insights/profile analytics | analytics |
| admin business screens | platform admin + business |
| admin plans/personas/landing | configuration + audit |

