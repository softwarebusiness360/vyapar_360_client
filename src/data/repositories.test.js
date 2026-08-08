import { createOrder, getOrders, updateOrderStatus, ORDER_STORAGE_KEY } from "./orderRepository";
import { createBooking, getBookings, updateBookingStatus, BOOKING_STORAGE_KEY } from "./bookingRepository";
import { saveVendor, getVendorById, BUSINESS_STORAGE_KEY } from "./businessRepository";
import { setSession, getSession, clearSession, SESSION_STORAGE_KEY } from "./authRepository";
import { normalizeProductState, STOREFRONT_STORAGE_KEY } from "./storefrontRepository";
import { PLAN_STORAGE_KEY, savePlanMatrix, getPlanMatrix } from "./configurationRepository";
import { CHAT_STORAGE_KEY, appendChat, getChatTranscript } from "./engagementRepository";
import { WORKFORCE_STORAGE_KEY } from "./workforceRepository";

beforeEach(() => localStorage.clear());

test("restaurant order flow preserves persisted shape and status transitions", () => {
  saveVendor({ id: "restaurant-1", email: "r@test", businessType: "restaurant", storefronts: [{ id: "sf-1", businessType: "restaurant" }], employees: [], capabilities: { tableOrdering: true }, orderMode: "counter" });
  const order = createOrder({ vendorId: "restaurant-1", storefrontId: "sf-1", items: [{ id: "meal", name: "Meal", price: 400, qty: 1 }], channel: "online" });
  expect(getOrders("restaurant-1")[0]).toMatchObject({ id: order.id, total: 420, status: "new", channel: "online" });
  expect(updateOrderStatus(order.id, "preparing").status).toBe("preparing");
  expect(updateOrderStatus(order.id, "ready").status).toBe("ready");
});

test("salon booking flow preserves persisted shape and status transitions", () => {
  const booking = createBooking({ vendorId: "salon-1", slot: "10:00", channel: "online" });
  expect(getBookings("salon-1")[0]).toMatchObject({ id: booking.id, slot: "10:00", status: "confirmed" });
  expect(updateBookingStatus(booking.id, "completed").status).toBe("completed");
});

test("admin business repository round-trips a business", () => {
  saveVendor({ id: "v1", email: "owner@example.com", storefronts: [], employees: [] });
  expect(getVendorById("v1")).toMatchObject({ id: "v1", email: "owner@example.com" });
});

test("auth repository handles missing and cleared sessions", () => {
  expect(getSession()).toBeNull();
  setSession({ vendorId: "v1", role: "owner" });
  expect(getSession()).toEqual({ vendorId: "v1", role: "owner" });
  clearSession();
  expect(getSession()).toBeNull();
});

test("order repository tolerates malformed persisted data and missing records", () => {
  localStorage.setItem(ORDER_STORAGE_KEY, "{not-json");
  expect(getOrders()).toEqual([]);
  expect(updateOrderStatus("missing-order", "ready")).toBeNull();
});

test("repositories publish and use the existing persistence keys", () => {
  expect({
    session: SESSION_STORAGE_KEY,
    businesses: BUSINESS_STORAGE_KEY,
    storefronts: STOREFRONT_STORAGE_KEY,
    workforce: WORKFORCE_STORAGE_KEY,
    orders: ORDER_STORAGE_KEY,
    bookings: BOOKING_STORAGE_KEY,
    plans: PLAN_STORAGE_KEY,
    chats: CHAT_STORAGE_KEY,
  }).toEqual({
    session: "vyapar360.session",
    businesses: "vyapar360.vendors",
    storefronts: "vyapar360.vendors",
    workforce: "vyapar360.vendors",
    orders: "vyapar360.orders",
    bookings: "vyapar360.bookings",
    plans: "vyapar360.plan_matrix",
    chats: "vyapar360.customer_chats",
  });
});

test("storefront, configuration, and engagement boundaries normalize and persist", () => {
  expect(normalizeProductState({ available: false })).toBe("not_available");
  savePlanMatrix({ free: { label: "Starter", maxStores: 2 } });
  expect(getPlanMatrix().free).toMatchObject({ label: "Starter", maxStores: 2, employees: false });
  appendChat("customer-1", { role: "user", text: "Hello" });
  expect(getChatTranscript("customer-1")).toEqual([
    expect.objectContaining({ role: "user", text: "Hello" }),
  ]);
});
