# Low-Level Design

## 1. Implementation baseline

Recommended baseline:

- Node.js with TypeScript in strict mode;
- Express;
- PostgreSQL;
- a migration-capable typed database layer;
- schema validation at every HTTP boundary;
- structured logging;
- standards-based JWT signing/verification;
- a modern password-hashing implementation;
- a test runner with HTTP integration support.

Package versions should be pinned during implementation after compatibility and
support checks. Domain and application code must remain independent of the
chosen validation, ORM/query, logging, and token packages.

## 2. Project structure

```text
backend/
  src/
    app/
      create-app.ts
      create-container.ts
      config.ts
      server.ts
      worker.ts
    platform/
      auth/
      authorization/
      database/
      errors/
      http/
      idempotency/
      logging/
      observability/
      outbox/
      security/
      validation/
    modules/
      identity/
        domain/
        application/
        infrastructure/
        http/
      business/
      catalogue/
      workforce/
      orders/
      bookings/
      customers/
      engagement/
      configuration/
      analytics/
      media/
      admin/
    shared/
      domain/
      types/
  migrations/
  tests/
    unit/
    integration/
    contract/
    security/
```

Within a module:

```text
orders/
  domain/
    order.ts
    order-status.ts
    money.ts
    order-errors.ts
  application/
    create-order.ts
    transition-order.ts
    list-orders.ts
    ports.ts
  infrastructure/
    postgres-order-repository.ts
  http/
    order-router.ts
    order-schemas.ts
    order-dto.ts
```

Imports flow inward:

```text
http -> application -> domain
infrastructure -> application ports + domain
composition root -> all concrete implementations
```

Modules may call another module only through an application/query port exposed
by that module.

## 3. Request pipeline

Middleware order:

1. trusted proxy and connection metadata;
2. request ID;
3. security headers;
4. CORS;
5. body size and content-type enforcement;
6. structured request logging;
7. route-specific rate limit;
8. access-token/session authentication;
9. request schema validation;
10. handler/application service;
11. response DTO mapping;
12. not-found handler;
13. centralized error mapper.

Protected business routes add authorization after parameter validation and
before the use case:

```ts
type Principal =
  | { kind: "anonymous" }
  | { kind: "guest"; subjectId: string; sessionId: string }
  | { kind: "customer"; identityId: string; customerId: string; sessionId: string }
  | {
      kind: "business";
      identityId: string;
      membershipId: string;
      businessId: string;
      role: "owner" | "manager" | "employee";
      sessionId: string;
    }
  | { kind: "platform_admin"; identityId: string; sessionId: string; role: string };
```

Authorization receives a principal plus resource context:

```ts
await authorization.require({
  principal,
  permission: "takeOrders",
  businessId: order.businessId,
  storefrontId: order.storefrontId,
  entitlement: null
});
```

## 4. Persistence model

All primary keys are opaque IDs. Every mutable table has `created_at`,
`updated_at`, and usually `version`. Timestamps are UTC.

### Identity

#### `identities`

| Column | Notes |
|---|---|
| `id` | primary key |
| `kind` | `person`, `platform_admin`, `customer` |
| `email_normalized` | nullable, unique when present |
| `phone_e164` | nullable, unique when present |
| `display_name` | required |
| `status` | `active`, `disabled`, `archived` |
| timestamps/version | audit and concurrency |

#### `password_credentials`

| Column | Notes |
|---|---|
| `identity_id` | unique FK |
| `password_hash` | never selected into DTO queries |
| `password_changed_at` | session invalidation reference |
| `must_change` | temporary staff password support |

#### `sessions`

| Column | Notes |
|---|---|
| `id` | access token subject reference |
| `identity_id` | nullable for guest |
| `guest_subject_id` | nullable |
| `refresh_token_hash` | random token hash |
| `family_id` | rotation/reuse family |
| `expires_at`, `revoked_at` | lifecycle |
| `last_used_at`, `ip_hash`, `user_agent_hash` | security metadata |

#### `otp_challenges`

Contains challenge ID, phone, purpose, code hash/provider reference, expiry,
attempts, resend count, consumed timestamp, and request metadata.

### Business and access

#### `businesses`

| Column | Notes |
|---|---|
| `id` | tenant ID |
| `legal/display_name` | account-level name |
| `state` | `draft`, `active`, `suspended`, `archived` |
| `plan_code` | FK to plan |
| `onboarded_at`, `suspended_at`, `archived_at` | lifecycle |
| timestamps/version | concurrency |

#### `memberships`

| Column | Notes |
|---|---|
| `id` | staff actor ID |
| `business_id`, `identity_id` | unique pair |
| `role` | `owner`, `manager`, `employee` |
| `permissions` | bounded JSONB booleans |
| `status` | `active`, `disabled`, `archived` |
| timestamps/version | concurrency |

#### `membership_storefronts`

Composite unique key `(membership_id, storefront_id)`. A database or service
check guarantees both rows belong to the same business.

#### `storefronts`

Contains business ID, normalized unique slug, name, business type, publication
state, tagline, description, media IDs, display address/phone, accent, timezone,
checkout fields JSONB, booking fields JSONB, opening hours JSONB, capacity
settings, archived timestamp, and version.

Suggested constraints:

- unique active `slug_normalized`;
- business type in `restaurant`, `salon`;
- publication state in `draft`, `published`, `unpublished`;
- timezone validated before persistence;
- active storefront count enforced transactionally against entitlement.

### Catalogue

#### `categories`

Business ID, storefront ID, name, sort order, archived timestamp, version.

#### `menu_items`

Business/storefront/category IDs, name, description, price minor, currency,
state, sort order, archived timestamp, version.

#### `services`

Same base fields plus duration minutes and optional capacity policy.

#### `catalogue_media`

Associates ordered media IDs with either a menu item or service. A check
constraint ensures exactly one target type.

### Customer

#### `customers`

ID, identity ID, normalized name, phone, last active timestamp, timestamps and
version. Guest subjects are stored separately with expiry/merge metadata.

Verified guest upgrade reassigns or aliases owned transactions and
conversations in a transaction.

### Orders

#### `orders`

| Column | Notes |
|---|---|
| `id`, `code` | opaque ID and human display code |
| `business_id`, `storefront_id` | immutable scope |
| `customer_id`, `guest_subject_id` | one ownership path |
| `created_by_membership_id` | POS actor, nullable online |
| `channel` | `online`, `walk_in` |
| `status` | state machine |
| `currency` | one currency per order |
| `subtotal_minor`, `tax_minor`, `total_minor` | server-calculated |
| `customer_snapshot` | bounded JSONB permitted fields |
| `notes` | length-limited |
| `confirmation_token_hash` | nullable after expiry |
| timestamps/version | concurrency |

#### `order_lines`

Order ID, source menu item ID, immutable item name/description snapshot, unit
price minor, quantity, line subtotal/tax/total, and sort order.

#### `order_transitions`

Order ID, from/to status, actor type/ID, reason, created timestamp, and request
ID. Append-only.

### Bookings

#### `bookings`

Business/storefront/service source IDs, customer/guest ownership, POS actor,
channel, status, start/end instants, storefront timezone, service name/price/
duration snapshot, customer snapshot, notes, confirmation token hash,
timestamps, and version.

#### `booking_transitions`

Append-only transition history equivalent to orders.

#### `booking_reservations`

Represents consumed capacity for storefront/service/resource and time range.
For the first fixed-capacity implementation, use a normalized slot start and
capacity unit with a unique constraint such as:

```text
(storefront_id, resource_key, slot_start, capacity_position)
```

Creation locks candidate capacity rows or inserts into available positions. A
cancelled booking releases/deactivates its reservation in the same transaction.
If arbitrary overlapping durations are introduced, use range overlap exclusion
or explicit schedule buckets.

### Platform configuration

- `plan_definitions(code, value_json, version, active)`
- `business_feature_overrides(business_id, feature_key, value, reason)`
- `persona_configurations(value_json, version, published_at)`
- `landing_versions(id, state, value_json, version, created_by, published_at)`

Global configuration updates use compare-and-swap on `version`.

### Engagement and media

- `conversations(id, customer_id/guest_subject_id, status, timestamps)`
- `messages(id, conversation_id, author_kind, author_id, text, timestamps)`
- `media(id, business_id, object_key, content_type, byte_size, state, checksum,
  timestamps)`

### Operational

- `idempotency_records(scope, key_hash, request_hash, response_status,
  response_body, state, expires_at)`
- `audit_events(actor, action, target, business_id, metadata, request_id,
  occurred_at)`
- `outbox_events(event_type, aggregate, payload, attempts, available_at,
  processed_at)`

## 5. Repository contracts

Repositories accept explicit scope and transaction handles:

```ts
type BusinessScope = {
  businessId: string;
  allowedStorefrontIds?: readonly string[];
};

interface OrderRepository {
  insert(tx: DbTransaction, order: NewOrder): Promise<Order>;
  findById(scope: BusinessScope, id: string): Promise<Order | null>;
  list(scope: BusinessScope, query: OrderListQuery): Promise<CursorPage<Order>>;
  updateStatus(
    tx: DbTransaction,
    input: { id: string; expectedVersion: number; status: OrderStatus }
  ): Promise<Order>;
}
```

There is no unscoped business repository method in normal application modules.
Cross-tenant query interfaces live only in the admin module.

## 6. Transaction boundaries

### Create order

One database transaction:

1. reserve/replay idempotency key;
2. load and validate business/storefront state;
3. load current catalogue entries with a lock only if necessary;
4. validate configured customer fields;
5. calculate authoritative money;
6. insert order and lines;
7. append initial status history;
8. attach customer or guest subject;
9. insert outbox event;
10. finalize idempotency response and commit.

External notification calls occur after commit through the outbox worker.

### Create booking

One serializable or carefully locked transaction:

1. reserve/replay idempotency key;
2. load active service and storefront schedule;
3. validate start/end and configured customer fields;
4. acquire capacity position for the entire time range;
5. insert booking and reservation;
6. append initial transition;
7. attach customer or guest subject;
8. insert outbox event;
9. finalize idempotency response and commit.

Slot conflict maps to `409 SLOT_UNAVAILABLE`.

### Change order/booking status

One transaction:

1. load resource inside authorized scope;
2. compare expected version;
3. validate state transition;
4. update status/version;
5. append transition;
6. release booking capacity when cancelling;
7. insert outbox/audit event;
8. commit.

### Admin plan/configuration change

One transaction validates version and actor, updates config/assignment, records
reason and audit event, and appends any required entitlement-change event.

## 7. Domain state machines

Order:

```text
pending -> preparing -> ready -> delivered
   |           |          |
   +-----------+----------+-> cancelled
```

Booking:

```text
pending -> confirmed -> completed
   |           |
   +-----------+-> cancelled
```

State transition functions are pure:

```ts
function transitionOrder(current: OrderStatus, next: OrderStatus): OrderStatus {
  if (!ORDER_TRANSITIONS[current].includes(next)) {
    throw new InvalidStateTransition("order", current, next);
  }
  return next;
}
```

The database accepts only known status values, while the domain controls valid
edges.

## 8. Monetary calculation

```ts
type MoneyBreakdown = {
  currency: "INR";
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
};
```

Rules:

- integers only, safe-range checked;
- line subtotal is `unitPriceMinor * quantity`;
- tax comes from server-side storefront/tax policy;
- rounding is deterministic at the defined level;
- total is recomputed and persisted;
- transaction lines keep source ID plus snapshots;
- API never accepts authoritative subtotal, tax, or total.

The prototype's fixed five-percent tax can be represented as the initial
policy, but the rate belongs in server configuration, not the client.

## 9. Dynamic customer fields

Accepted schema keys are allowlisted:

- checkout: `name`, `phone`, `address`, `notes`;
- booking: `name`, `phone`, `notes`.

Each setting has `enabled`, `required`, `label`, and `placeholder`. Backend
rules:

- a required field must also be enabled;
- names and labels have length limits;
- keys outside the allowlist are rejected;
- order/booking create validates required fields using the currently published
  storefront configuration;
- only fields enabled at creation are persisted into the bounded snapshot.

## 10. Idempotency design

Scope is actor/guest/IP policy plus route and target storefront. Store only a
hash of the key. The normalized request body produces a request hash.

- same key + same hash + completed: replay stored response;
- same key + same hash + processing: return retryable conflict/in-progress;
- same key + different hash: `409 IDEMPOTENCY_CONFLICT`;
- expired records are cleaned asynchronously.

Orders and bookings require keys. The client generates one key per user submit
and reuses it for retries.

## 11. Public confirmation token

At creation, generate a high-entropy random token, return it once, and store its
hash and expiry. Confirmation lookup accepts authenticated ownership or the
opaque token. Responses exclude sensitive internal/customer data beyond the
confirmation screen's needs.

The raw token is never logged or stored. Token comparison is constant-time.

## 12. Error model

Domain errors have stable code and safe metadata:

```ts
class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    readonly httpStatus: number,
    message: string,
    readonly details?: ReadonlyArray<FieldError>
  ) {
    super(message);
  }
}
```

Infrastructure errors are translated:

- unique slug/email -> `SLUG_TAKEN` / `IDENTITY_EXISTS`;
- optimistic update affected zero rows -> `VERSION_CONFLICT`;
- capacity constraint -> `SLOT_UNAVAILABLE`;
- missing scoped row -> `NOT_FOUND`;
- pool/provider timeout -> safe temporary failure.

Unexpected errors return a generic `INTERNAL_ERROR` plus request ID. Stack,
query, table, and provider secrets remain in redacted internal logs only.

## 13. Pagination

Cursor payload is opaque and signed/encoded. For descending creation order it
contains the last `createdAt` and ID to provide a stable tie-break:

```text
WHERE (created_at, id) < (:cursorCreatedAt, :cursorId)
ORDER BY created_at DESC, id DESC
LIMIT :limit + 1
```

Maximum page size is enforced. Search filters are normalized and length-limited.

## 14. Background worker

The worker leases outbox rows using `FOR UPDATE SKIP LOCKED`, marks attempts, and
processes events idempotently. Retry uses capped exponential backoff with
jitter. Permanently failing records move to a failed state and alert.

Initial handlers:

- order/booking notification;
- membership invitation/reset delivery;
- OTP provider handoff if queued;
- orphan media cleanup;
- expired idempotency/session/guest cleanup.

Provider operations use timeouts and circuit-breaking policy where appropriate.

## 15. Configuration

Environment is parsed once at startup into a typed object. Required groups:

- runtime/port/trust proxy;
- PostgreSQL connection and pool;
- access/refresh token keys and lifetimes;
- allowed frontend origins and cookie settings;
- OTP provider credentials/policy;
- object storage/CDN;
- rate limits;
- logging/telemetry.

Startup fails on missing or invalid production configuration. Secrets are
provided by the deployment secret manager and never committed.

## 16. Testing design

### Unit

- state transition tables;
- price/tax calculation;
- entitlement and permission resolution;
- dynamic field validation;
- schedule/slot generation;
- DTO mappers and public-field leak tests.

### Integration

- PostgreSQL repositories with real migrations;
- booking race test with concurrent create requests;
- idempotency replay and mismatch;
- optimistic concurrency conflicts;
- tenant and storefront isolation;
- session rotation/reuse;
- outbox atomicity.

### Contract

- every endpoint in `api-contracts.md`;
- request/response schemas;
- stable error codes;
- frontend repository parity fixtures;
- public DTO snapshots that explicitly exclude credential/workforce fields.

### End-to-end

- owner registration -> onboarding -> catalogue -> public order -> staff status;
- salon setup -> public availability -> concurrent booking -> completion;
- employee assignment/permission enforcement;
- customer guest -> transaction -> OTP upgrade -> history;
- platform admin suspension and plan/config changes.

## 17. Migration from the frontend prototype

Suggested implementation sequence:

1. scaffold API/platform layers and identity/session model;
2. implement business, storefront, public projection, and media;
3. implement catalogue;
4. implement order and booking commands with idempotency/concurrency;
5. implement workforce and authorization;
6. implement customer history and engagement;
7. implement configuration/admin;
8. implement analytics;
9. add API-backed frontend repositories and migrate each feature;
10. remove localStorage domain persistence after parity and data migration.

During migration, do not send the current full vendor object to generic
`PATCH` endpoints. Adapt each UI mutation to its narrow command. Add
asynchronous loading/error/conflict states to consumers as each repository is
replaced.

