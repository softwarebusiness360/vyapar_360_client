/**
 * Vyapar360 API — HTTP adapter (fetch-based).
 *
 * NOT WIRED UP YET — this file documents what every mock-adapter function will
 * look like once a real REST backend is available at REACT_APP_BACKEND_URL.
 *
 * When the backend team ships, replace the `TODO` implementations with real
 * fetch calls to the paths documented in /API_CONTRACT.md. No consumer code
 * needs to change — the client (index.js) will automatically switch adapters
 * when REACT_APP_USE_MOCK_API=false.
 */

const BASE = process.env.REACT_APP_BACKEND_URL || "";

/**
 * Thin fetch wrapper with:
 *  - JSON in / JSON out
 *  - Bearer token from LocalStorage vendor/admin session
 *  - Consistent error shape `{ code, message }`
 */
async function request(method, path, body, { admin = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  const sessionKey = admin ? "vyapar360.admin_session" : "vyapar360.session";
  try {
    const s = JSON.parse(localStorage.getItem(sessionKey) || "null");
    if (s?.token) headers["Authorization"] = `Bearer ${s.token}`;
  } catch {
    /* no-op */
  }

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = { code: res.status, message: json?.detail || res.statusText };
    throw err;
  }
  return json;
}

const GET = (p, opts) => request("GET", p, undefined, opts);
const POST = (p, b, opts) => request("POST", p, b, opts);
const PATCH = (p, b, opts) => request("PATCH", p, b, opts);
const DELETE = (p, opts) => request("DELETE", p, undefined, opts);

/* ---------- Auth (vendor) ---------- */
export const loginVendor = (body) => POST("/auth/vendor/login", body);
export const registerVendor = (body) => POST("/auth/vendor/register", body);
export const logoutVendor = () => POST("/auth/vendor/logout");
export const getCurrentVendor = () => GET("/auth/vendor/me");

/* ---------- Auth (admin) ---------- */
export const loginAdmin = (body) => POST("/auth/admin/login", body, { admin: true });
export const logoutAdmin = () => POST("/auth/admin/logout", null, { admin: true });
export const getCurrentAdmin = () => GET("/auth/admin/me", { admin: true });

/* ---------- Vendors ---------- */
export const listVendors = ({ q, type } = {}) => {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (type) p.set("type", type);
  return GET(`/vendors${p.toString() ? "?" + p : ""}`);
};
export const getVendor = (id) => GET(`/vendors/${id}`);
export const getVendorBySlug = (slug) => GET(`/vendors/by-slug/${slug}`);
export const updateVendor = (id, patch) => PATCH(`/vendors/${id}`, patch);
export const deleteVendor = (id) => DELETE(`/vendors/${id}`, { admin: true });
export const checkSlug = (slug, exceptId) => {
  const p = new URLSearchParams({ slug });
  if (exceptId) p.set("exceptId", exceptId);
  return GET(`/vendors/check-slug?${p}`);
};

/* ---------- Orders ---------- */
export const listOrders = ({ vendorId, status, q } = {}) => {
  const p = new URLSearchParams();
  if (vendorId) p.set("vendorId", vendorId);
  if (status) p.set("status", status);
  if (q) p.set("q", q);
  return GET(`/orders${p.toString() ? "?" + p : ""}`);
};
export const createOrder = (body) => POST("/orders", body);
export const updateOrderStatus = (orderId, status) => PATCH(`/orders/${orderId}`, { status });

/* ---------- Bookings ---------- */
export const listBookings = ({ vendorId, status, q } = {}) => {
  const p = new URLSearchParams();
  if (vendorId) p.set("vendorId", vendorId);
  if (status) p.set("status", status);
  if (q) p.set("q", q);
  return GET(`/bookings${p.toString() ? "?" + p : ""}`);
};
export const createBooking = (body) => POST("/bookings", body);
export const updateBookingStatus = (bookingId, status) => PATCH(`/bookings/${bookingId}`, { status });
export const getSlots = (vendorId, dateISO) =>
  GET(`/bookings/slots?vendorId=${vendorId}&date=${dateISO}`);

/* ---------- Landing CMS ---------- */
export const getLandingConfig = () => GET("/landing");
export const saveLandingConfig = (cfg) => POST("/landing", cfg, { admin: true });
export const resetLandingConfig = () => DELETE("/landing", { admin: true });
