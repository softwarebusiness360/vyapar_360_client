import { getVendorById } from "./businessRepository";
import { getOrders } from "./orderRepository";
import { getBookings } from "./bookingRepository";

function _resolveStorefrontId(vendor, record) {
  if (record.storefrontId) return record.storefrontId;
  return vendor.storefronts?.[0]?.id || null;
}

export function getVendorTransactions(vendorId, { storefrontIds, from, to, includeCancelled = false } = {}) {
  const v = getVendorById(vendorId);
  if (!v) return { orders: [], bookings: [] };
  const okStore = (rec) => {
    if (!storefrontIds || storefrontIds.length === 0) return true;
    return storefrontIds.includes(_resolveStorefrontId(v, rec));
  };
  const inRange = (iso) => {
    if (!iso) return false;
    if (from && iso < from) return false;
    if (to && iso > to) return false;
    return true;
  };
  const notCancelled = (rec) => includeCancelled || rec.status !== "cancelled";
  const orders = getOrders(vendorId).filter((o) =>
    okStore(o) && notCancelled(o) && (!from && !to ? true : inRange(o.createdAt)),
  );
  const bookings = getBookings(vendorId).filter((b) =>
    okStore(b) && notCancelled(b) && (!from && !to ? true : inRange(b.createdAt)),
  );
  return { orders, bookings };
}

/**
 * Compute revenue/count KPIs for a set of orders + bookings.
 */
export function computeKPIs({ orders = [], bookings = [] }) {
  const orderRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const bookingRevenue = bookings.reduce((s, b) => s + (b.service?.price || 0), 0);
  const revenue = orderRevenue + bookingRevenue;
  const txCount = orders.length + bookings.length;
  return {
    revenue,
    orderRevenue,
    bookingRevenue,
    orders: orders.length,
    bookings: bookings.length,
    txCount,
    avgTicket: txCount > 0 ? Math.round(revenue / txCount) : 0,
  };
}

/**
 * Per-storefront KPI breakdown for the owner's consolidated dashboard.
 */
export function getPerStoreStats(vendorId, { from, to } = {}) {
  const v = getVendorById(vendorId);
  if (!v) return [];
  return (v.storefronts || []).map((sf) => {
    const { orders, bookings } = getVendorTransactions(vendorId, { storefrontIds: [sf.id], from, to });
    return { storefront: sf, ...computeKPIs({ orders, bookings }) };
  });
}
