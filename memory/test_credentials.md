# Vyapar360 — Test Credentials

All auth is LocalStorage-backed (mock) — accounts are seeded on first landing-page load
via `seedIfNeeded()` in `src/lib/store.js`.

## Platform Admin (`/admin/login`)
- Email: `admin@vyapar360.com`
- Password: `admin123`
- Role: `superadmin`
- Access: Overview, Businesses, Orders, Bookings, **Landing CMS** (pricing config)

## Vendor — Restaurant (`/login`)
- Email: `owner@pizzahub.com`
- Password: `demo1234`
- Business: Pizza Hub (Mumbai)
- Plan: Pro

## Vendor — Salon (`/login`)
- Email: `owner@stylesalon.com`
- Password: `demo1234`
- Business: Style Salon (Mumbai)
- Plan: Pro

## Sample Store Manager (created in Session 2 demo)
- Email: `ravi@pizzahub.com`
- Password: `ravi1234`
- Role: **manager** (near-owner access; no team/settings/billing)
- Belongs to: Pizza Hub workspace
- Note: You can safely delete/re-invite this from `/dashboard/team`.

The `/login` page also has one-click "Try a demo" shortcuts for both vendors.
