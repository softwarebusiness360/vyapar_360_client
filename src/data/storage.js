

export const STORAGE_KEYS = Object.freeze({
  session: "vyapar360.session", adminSession: "vyapar360.admin_session",
  customerSession: "vyapar360.customer_session", vendors: "vyapar360.vendors",
  admins: "vyapar360.admins", customers: "vyapar360.customers",
  orders: "vyapar360.orders", bookings: "vyapar360.bookings",
  landing: "vyapar360.landing_config", planMatrix: "vyapar360.plan_matrix",
  personaMatrix: "vyapar360.persona_matrix", chats: "vyapar360.customer_chats",
  seed: "vyapar360.seed_done",
});
export function read(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
}
export const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
export const remove = (key) => localStorage.removeItem(key);
