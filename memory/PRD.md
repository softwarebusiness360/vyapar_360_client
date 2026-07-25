# Vyapar360 — PRD

## Problem statement (rolling)
Originally cloned from `https://github.com/softwarebusiness360/vyapar_360_client.git`.
Session goals (accumulating):
1. Pricing section like Emergent with monthly/annual toggle, driven by the admin CMS. **Done**.
2. **Multi-Store & Employee Management (Pro Feature)** — full RBAC, plan-configurable limits,
   consolidated + per-store analytics, employee performance metrics, admin-configurable plan
   matrix, and a modular hooks-first codebase (Container/Presentational split). **Done**.

## Architecture
- **Type**: Frontend-only SPA (React 18 + CRA via CRACO + Tailwind + Framer Motion)
- **Backend**: not yet built. All data in LocalStorage via `src/lib/store.js` behind an
  adapter-switching API client (`src/lib/api/`) so it can flip to HTTP later without changing
  consumers.
- **Directory conventions**:
  - `src/hooks/`              → all data-fetching + orchestration hooks (Container layer)
  - `src/components/vendor/`  → business-neutral vendor presentational pieces
  - `src/components/admin/`   → admin presentational pieces (planned)
  - `src/pages/vendor/`       → thin containers that compose hooks + components
  - `src/lib/store.js`        → single source of truth for local data model + business rules
  - `src/lib/rbac.jsx`        → `<RequireOwner>` + `<RequirePermission>` URL-level guards

## Roles & RBAC
Roles: **Business Owner** (implicit, via vendor account) · **Store Manager** (employee.role="manager")
· **Employee** (employee.role="employee") · **Platform Admin** (separate account).

Role permission presets (`ROLE_PRESETS` in `store.js`):
- Manager:  `takeOrders, takeBookings, viewInsights, editCatalogue`
- Employee: `takeOrders, takeBookings`
Override any preset per-employee from the Team modal.

URL-level enforcement in `App.js`:
- `RequireOwner`: `/dashboard` (overview), `/dashboard/storefronts`, `/dashboard/team`, `/dashboard/settings`
- `RequirePermission perm="editCatalogue"`: `/dashboard/catalogue`
- `RequirePermission perm="takeOrders"`: `/dashboard/orders`
- `RequirePermission perm="takeBookings"`: `/dashboard/bookings`
- `RequirePermission perm="viewInsights"`: `/dashboard/insights`
- POS is open to any signed-in user (POS is the default employee landing).

Non-authorised URLs redirect to `/dashboard/pos` (employee home) or `/dashboard` (owner home).

## Plan matrix (admin-configurable — `/admin/plans`)
Persisted at `vyapar360.plan_matrix`. Tiers: `free`, `growth`, `pro`, `enterprise`.
Each tier has editable: `label, multiStore, employees, whatsappNotifs, removeBranding,
customDomain, prioritySupport, insights (basic|advanced|unlimited), maxStores, maxEmployees`.
Limits are enforced at write-time in `addStorefront` and `addEmployee`.

## Cross-store analytics
`useMultiStoreAnalytics({ vendor, storefrontIds, from, to })` yields:
- `kpis`: revenue, orders, bookings, txCount, avgTicket
- `perStore`: per-storefront breakdown (`storefront + KPIs`)
- `trend`: day-wise revenue for the selected window
Backed by store helpers `getVendorTransactions`, `computeKPIs`, `getPerStoreStats`.

## Employee performance
`useEmployeePerformance({ vendor, storefrontIds, from, to })` returns an array of
`{ employee, assignedStores, revenue, orders, bookings, txCount, avgTicket }` sorted by top
revenue. Rendered by `<EmployeePerformanceTable />` on both Team and Insights pages.

## Hooks catalogue (`src/hooks/`)
- `useStorefronts` · `useEmployees` · `usePeriodFilter (Today/7d/30d/MTD/All)`
- `useMultiStoreAnalytics` · `useEmployeePerformance`
- `useOrders` / `useBookings` (auto-scope by employee assignments)
- `usePlanMatrix` · `useAdminBusinesses` · `useLandingConfig`
- Barrel export in `src/hooks/index.js`

## What's implemented (dates)
### 2026-01-25 · Session 1
- Emergent-style pricing section with monthly/annual toggle + full admin CMS config.

### 2026-01-25 · Session 2 (this)
- **Data layer**: 4-tier plan matrix (Free/Growth/Pro/Enterprise), store/employee limits
  enforced, role field on employees (`owner|manager|employee`), `ROLE_PRESETS`,
  cross-store aggregation helpers (`getVendorTransactions`, `getPerStoreStats`,
  `getEmployeePerformance`, `computeKPIs`, `getAllowedStorefronts`).
- **Hooks folder**: 10 custom hooks encapsulating all data-fetching + mutations,
  ready for the HTTP adapter swap.
- **Presentational components**: `StatCard`, `PeriodFilter`, `StoreFilter`,
  `PerStoreBreakdown`, `EmployeePerformanceTable`.
- **Container refactors**: `OverviewPage`, `InsightsPage`, `TeamPage`, `OrdersPage`,
  `BookingsPage` all rewritten around hooks; heavy logic gone from pages.
- **New Owner consolidated dashboard**: cross-store KPIs + per-store breakdown + period
  filter + storefront filter.
- **Employee performance panel**: shown on Team and Insights pages.
- **URL-level RBAC**: `<RequireOwner>` and `<RequirePermission>` guards on every
  restricted route.
- **Store Manager role**: role selector in the Team modal with two presets.
- **Admin Plan Matrix editor**: `/admin/plans` — toggle features + set limits per tier.
- **Admin Business Detail**: added Enterprise tier button + shows computed limits under
  the plan buttons.

## Backlog / Next tasks
- P1: Backend + real REST endpoints (swap `REACT_APP_USE_MOCK_API=false`)
- P1: Stripe / Razorpay for actual plan upgrades
- P1: WhatsApp integration for order/booking notifications
- P2: Custom domain per storefront
- P2: More business types (Gym, Pharmacy, Grocery, Bakery, Boutique, Spa, Clinic,
  Academies, Rental & Property)
- P2: Employee shift scheduling + attendance tracking
- P2: Reviews & ratings, coupons

## Test credentials
See `/app/memory/test_credentials.md`.
