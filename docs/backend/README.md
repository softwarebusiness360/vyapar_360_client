# Vyapar360 Backend Design Pack

This directory is the backend design baseline derived from the React application
as it exists today. The target implementation is a Node.js, TypeScript, and
Express backend. No backend code is included in this design pass.

Read the documents in this order:

1. [Contract analysis](./contract-analysis.md) — what the frontend does today,
   the real contract surface, gaps, risks, and the required backend API.
2. [API contracts](./api-contracts.md) — common protocol rules and the complete
   REST endpoint catalogue.
3. [High-level design](./hld.md) — system boundaries, containers, data stores,
   security, deployment, and major flows.
4. [Component design](./component-design.md) — responsibilities and
   dependencies of every backend module.
5. [Low-level design](./lld.md) — data model, middleware, services,
   transactions, state machines, and code structure.
6. [Traceability](./traceability.md) — every frontend route and repository
   mapped to its target backend contract.

## Decisions fixed by this pack

- Start with a modular monolith, not microservices.
- Use `/api/v1` REST contracts with JSON.
- Use Node.js + TypeScript + Express and PostgreSQL.
- Keep tenant, storefront, catalogue, workforce, transaction, customer, and
  platform configuration data in separate persistence models.
- Treat every price, tax, permission, plan limit, slot, and tenant identifier
  supplied by a client as untrusted.
- Return separate public and authenticated DTOs. Never serialize database
  entities directly.
- Make customer order/booking confirmation accessible through customer
  authentication or a short-lived opaque access token, never by an enumerable
  record ID alone.

## Scope boundary

This design covers the behavior currently represented by the frontend:

- public marketing, discovery, and storefronts;
- vendor owner and employee authentication;
- onboarding, storefronts, catalogue, settings, and workforce;
- restaurant orders and POS orders;
- salon bookings, slots, and POS bookings;
- customer guest/phone identity, history, and chat;
- admin business, plan, persona, landing CMS, order, and booking operations;
- analytics and employee performance.

Payment collection, WhatsApp delivery, custom domains, human support tooling,
and subscriptions are modeled as extension points because the UI advertises or
gates them but does not implement their operational flows.
