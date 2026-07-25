# Vyapar360 — Test Credentials

All auth is LocalStorage-backed (mock). Seed runs on first landing-page load.

## Platform Admin (`/admin/login`)
- Email: `admin@vyapar360.com` · Password: `admin123` · Role: `superadmin`

## Vendors (`/login`) — one-click dummy logins on the sign-in page
### Pizza Hub (Restaurant, Pro plan)
- **Owner**: `owner@pizzahub.com` / `demo1234`
- **Store Manager**: `manager@pizzahub.com` / `demo1234` (Ravi Kumar)
- **Employee**: `employee@pizzahub.com` / `demo1234` (Priya Sharma)

### Style Salon (Salon, Pro plan)
- **Owner**: `owner@stylesalon.com` / `demo1234`
- **Store Manager**: `manager@stylesalon.com` / `demo1234` (Neha Verma)

## Customer
- No password. Enter name at any storefront → guest session.
- Optional: click "Save my details" → phone + **OTP `1234`** (any 4+ digit works).
- Customer profile: `/me` (must be signed in as a customer).

## Roles reference (RBAC)
- **Business Owner**: full access to their workspace.
- **Store Manager**: takeOrders + takeBookings + viewInsights + editCatalogue. No team/settings/billing.
- **Employee**: takeOrders + takeBookings only.
- **Platform Admin**: full platform-level control.
- **Customer**: storefront + own orders/profile.
