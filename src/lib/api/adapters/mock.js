/**
 * Vyapar360 API — mock adapter (LocalStorage-backed).
 *
 * Wraps the synchronous `store.js` primitives in async functions with a small
 * artificial latency, so consumer components behave exactly the same when the
 * `http` adapter later hits a real backend.
 *
 * Every function returns a Promise resolving to the same shape the http
 * adapter will return (see /API_CONTRACT.md).
 */
import * as store from "../store";

// Simulated network latency (ms). Set 0 in tests, 100–200 in dev to catch races.
const LATENCY_MS = 120;

function ok(data, latency = LATENCY_MS) {
  return new Promise((resolve) => setTimeout(() => resolve(data), latency));
}
function fail(message, code = 400) {
  return new Promise((_, reject) =>
    setTimeout(() => reject({ code, message }), LATENCY_MS)
  );
}

/* ---------- Auth (vendor) ---------- */
export async function loginVendor({ email, password }) {
  const v = store.getVendorByEmail(email);
  if (!v) return fail("No account found with that email.", 404);
  if (v.password !== password) return fail("Incorrect password.", 401);
  store.setSession({ email: v.email, vendorId: v.id });
  return ok({ vendor: v, sessionToken: `mock_${v.id}` });
}
export async function registerVendor({ email, password }) {
  try {
    const v = store.createVendor({ email, password });
    store.setSession({ email: v.email, vendorId: v.id });
    return ok({ vendor: v, sessionToken: `mock_${v.id}` });
  } catch (e) {
    return fail(e.message, 409);
  }
}
export async function logoutVendor() {
  store.clearSession();
  return ok({ ok: true });
}
export async function getCurrentVendor() {
  const s = store.getSession();
  if (!s?.vendorId) return ok(null);
  return ok(store.getVendorById(s.vendorId));
}

/* ---------- Auth (admin) ---------- */
export async function loginAdmin({ email, password }) {
  const a = store.getAdminByEmail(email);
  if (!a) return fail("No admin account found.", 404);
  if (a.password !== password) return fail("Incorrect password.", 401);
  store.setAdminSession({ email: a.email, adminId: a.id });
  return ok({ admin: a, sessionToken: `mock_${a.id}` });
}
export async function logoutAdmin() {
  store.clearAdminSession();
  return ok({ ok: true });
}
export async function getCurrentAdmin() {
  const s = store.getAdminSession();
  if (!s?.adminId) return ok(null);
  return ok(store.getAdminById(s.adminId));
}

/* ---------- Vendors ---------- */
export async function listVendors({ q, type } = {}) {
  let vendors = store.getVendors();
  if (type && type !== "all") vendors = vendors.filter((v) => v.businessType === type);
  if (q) {
    const needle = q.toLowerCase();
    vendors = vendors.filter(
      (v) =>
        (v.name || "").toLowerCase().includes(needle) ||
        (v.tagline || "").toLowerCase().includes(needle) ||
        (v.slug || "").includes(needle)
    );
  }
  return ok(vendors);
}
export async function getVendor(id) {
  const v = store.getVendorById(id);
  return v ? ok(v) : fail("Vendor not found", 404);
}
export async function getVendorBySlug(slug) {
  const v = store.getVendorBySlug(slug);
  return v ? ok(v) : fail("Vendor not found", 404);
}
export async function updateVendor(id, patch) {
  const existing = store.getVendorById(id);
  if (!existing) return fail("Vendor not found", 404);
  const next = { ...existing, ...patch };
  store.saveVendor(next);
  return ok(next);
}
export async function deleteVendor(id) {
  store.deleteVendor(id);
  return ok({ ok: true });
}
export async function checkSlug(slug, exceptId = null) {
  return ok({ available: store.slugAvailable(slug, exceptId) });
}

/* ---------- Orders ---------- */
export async function listOrders({ vendorId, status, q } = {}) {
  let orders = store.getOrders(vendorId);
  if (status && status !== "all") orders = orders.filter((o) => o.status === status);
  if (q) {
    const needle = q.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.code.toLowerCase().includes(needle) ||
        (o.customer?.name || "").toLowerCase().includes(needle)
    );
  }
  return ok(orders);
}
export async function createOrder(payload) {
  return ok(store.createOrder(payload));
}
export async function updateOrderStatus(orderId, status) {
  const o = store.updateOrderStatus(orderId, status);
  return o ? ok(o) : fail("Order not found", 404);
}

/* ---------- Bookings ---------- */
export async function listBookings({ vendorId, status, q } = {}) {
  let bookings = store.getBookings(vendorId);
  if (status && status !== "all") bookings = bookings.filter((b) => b.status === status);
  if (q) {
    const needle = q.toLowerCase();
    bookings = bookings.filter(
      (b) =>
        b.code.toLowerCase().includes(needle) ||
        (b.customer?.name || "").toLowerCase().includes(needle)
    );
  }
  return ok(bookings);
}
export async function createBooking(payload) {
  return ok(store.createBooking(payload));
}
export async function updateBookingStatus(bookingId, status) {
  const b = store.updateBookingStatus(bookingId, status);
  return b ? ok(b) : fail("Booking not found", 404);
}
export async function getSlots(vendorId, dateISO) {
  return ok(store.getSlotsForDate(vendorId, dateISO));
}

/* ---------- Landing CMS ---------- */
export async function getLandingConfig() {
  return ok(store.getLandingConfig());
}
export async function saveLandingConfig(cfg) {
  return ok(store.saveLandingConfig(cfg));
}
export async function resetLandingConfig() {
  return ok(store.resetLandingConfig());
}
