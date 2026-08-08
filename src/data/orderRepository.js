import { uid } from "../lib/utils";
import { read, write, STORAGE_KEYS as KEYS } from "./storage";
import { DEFAULT_CHECKOUT_FIELDS, normalizeChannel } from "./modelDefaults";
import { getVendorById, getVendorBySlug } from "./businessRepository";
import { seedIfNeeded } from "./seedData";
import { getCustomerTransactions } from "./engagementRepository";
import {
  ORDER_STATUSES,
  calculateOrderTotals,
  canAddItems,
  canCancelOrder,
  canTransitionOrder,
  normalizeRestaurantOrder,
} from "../domain/restaurantOrders";

export const ORDER_STORAGE_KEY = KEYS.orders;
export const getAllowedStorefronts = (vendor, employee) => {
  if (!vendor) return [];
  if (!employee) return vendor.storefronts || [];
  return (vendor.storefronts || []).filter(({ id }) => employee.storefrontIds.includes(id));
};
export const RESTAURANT_ORDER_STATUSES = ORDER_STATUSES;

export function getOrders(vendorId) {
  const all = read(KEYS.orders, []);
  const filtered = vendorId ? all.filter((o) => o.vendorId === vendorId) : all;
  return filtered.map(normalizeRestaurantOrder);
}
export function createOrder(order) {
  const vendor = getVendorById(order?.vendorId);
  if (!vendor || vendor.businessType !== "restaurant") throw new Error("Choose a valid restaurant before creating an order.");
  const storefront = vendor.storefronts?.find(({ id }) => id === order.storefrontId) || (!order.storefrontId ? vendor.storefronts?.[0] : null);
  if (!storefront) throw new Error("Choose a valid storefront before creating an order.");
  const source = order.source === "table" ? "table" : "counter";
  const tableEnabled = vendor.capabilities?.tableOrdering && ["table", "both"].includes(vendor.orderMode);
  const table = source === "table" ? vendor.tables?.find(({ id, storefrontId }) => id === order.tableId && storefrontId === storefront.id) : null;
  if (source === "table" && (!tableEnabled || !table)) throw new Error("Choose a valid table owned by this storefront.");
  if (source === "counter" && vendor.orderMode === "table" && tableEnabled) throw new Error("This store requires a table order.");
  const all = read(KEYS.orders, []);
  const code =
    "ORD-" +
    Math.floor(1000 + Math.random() * 9000).toString();
  const items = Array.isArray(order.items) ? order.items.map(({ id, name, price, qty }) => ({ id, name, price: Number(price) || 0, qty: Number.isInteger(qty) && qty > 0 ? qty : 1 })) : [];
  const totals = calculateOrderTotals(items);
  const o = {
    customer: order.customer && typeof order.customer === "object" ? { ...order.customer } : { name: "", phone: "" },
    notes: typeof order.notes === "string" ? order.notes : "",
    employeeId: typeof order.employeeId === "string" ? order.employeeId : null,
    items,
    ...totals,
    id: uid("ord"),
    code,
    status: "new",
    vendorId: vendor.id,
    source,
    storefrontId: storefront.id,
    tableId: table?.id || null,
    tableLabel: table?.label || null,
    channel: normalizeChannel(order.channel),
    createdAt: new Date().toISOString(),
  };
  all.unshift(o);
  write(KEYS.orders, all);
  return o;
}
export function updateOrderStatus(orderId, status) {
  const all = read(KEYS.orders, []);
  const idx = all.findIndex((o) => o.id === orderId);
  if (idx >= 0 && canTransitionOrder(all[idx].status, status)) {
    all[idx].status = status;
    write(KEYS.orders, all);
    return all[idx];
  }
  return null;
}
export function cancelOrder(orderId) {
  const all = read(KEYS.orders, []);
  const idx = all.findIndex((order) => order.id === orderId);
  if (idx < 0 || !canCancelOrder(all[idx].status)) return null;
  all[idx] = { ...all[idx], status: "cancelled", cancelledAt: new Date().toISOString() };
  write(KEYS.orders, all);
  return normalizeRestaurantOrder(all[idx]);
}
export function completeTable(orderId) {
  const all = read(KEYS.orders, []);
  const idx = all.findIndex((order) => order.id === orderId);
  const status = idx >= 0 ? normalizeRestaurantOrder(all[idx]).status : null;
  if (idx < 0 || all[idx].source !== "table" || !["completed", "cancelled"].includes(status)) return null;
  all[idx] = { ...all[idx], tableClosedAt: new Date().toISOString() };
  write(KEYS.orders, all);
  return normalizeRestaurantOrder(all[idx]);
}
export function addOrderItems(orderId, additions) {
  const all = read(KEYS.orders, []);
  const idx = all.findIndex((order) => order.id === orderId);
  if (idx < 0 || !canAddItems(all[idx].status) || !Array.isArray(additions) || additions.length === 0) return null;
  if (additions.some((item) => !item?.id || !Number.isFinite(Number(item.price)) || !Number.isInteger(item.qty) || item.qty < 1)) return null;
  const items = [...(all[idx].items || [])];
  additions.forEach((addition) => {
    const existing = items.find((item) => item.id === addition.id);
    if (existing) existing.qty += addition.qty;
    else items.push({ ...addition });
  });
  const totals = calculateOrderTotals(items);
  all[idx] = { ...all[idx], items, ...totals };
  write(KEYS.orders, all);
  return normalizeRestaurantOrder(all[idx]);
}
export { DEFAULT_CHECKOUT_FIELDS, getCustomerTransactions, getVendorBySlug, seedIfNeeded };
