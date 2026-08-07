import { uid } from "../lib/utils";
import { read, write, STORAGE_KEYS as KEYS } from "./storage";
import { DEFAULT_CHECKOUT_FIELDS, normalizeChannel } from "./modelDefaults";
import { getVendorBySlug } from "./businessRepository";
import { seedIfNeeded } from "./seedData";
import { getCustomerTransactions } from "./engagementRepository";

export const ORDER_STORAGE_KEY = KEYS.orders;
export const getAllowedStorefronts = (vendor, employee) => {
  if (!vendor) return [];
  if (!employee) return vendor.storefronts || [];
  return (vendor.storefronts || []).filter(({ id }) => employee.storefrontIds.includes(id));
};
const ORDER_STATUSES = ["pending", "preparing", "ready", "delivered", "cancelled"];
export const RESTAURANT_ORDER_STATUSES = ORDER_STATUSES;

export function getOrders(vendorId) {
  const all = read(KEYS.orders, []);
  return vendorId ? all.filter((o) => o.vendorId === vendorId) : all;
}
export function createOrder(order) {
  const all = read(KEYS.orders, []);
  const code =
    "ORD-" +
    Math.floor(1000 + Math.random() * 9000).toString();
  const o = {
    id: uid("ord"),
    code,
    status: "pending",
    channel: normalizeChannel(order.channel),
    createdAt: new Date().toISOString(),
    ...order,
    channel: normalizeChannel(order.channel), // ensure normalized after spread
  };
  all.unshift(o);
  write(KEYS.orders, all);
  return o;
}
export function updateOrderStatus(orderId, status) {
  const all = read(KEYS.orders, []);
  const idx = all.findIndex((o) => o.id === orderId);
  if (idx >= 0) {
    all[idx].status = status;
    write(KEYS.orders, all);
    return all[idx];
  }
  return null;
}
export { DEFAULT_CHECKOUT_FIELDS, getCustomerTransactions, getVendorBySlug, seedIfNeeded };
