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

The `/login` page also has one-click "Try a demo" shortcuts for both vendors.
