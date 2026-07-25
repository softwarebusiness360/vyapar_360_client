/**
 * useMultiStoreAnalytics — the consolidated cross-store dashboard hook.
 *
 * Consumers pick a period + optional storefront filter and receive:
 *   - overall KPIs (revenue, tx count, avg ticket)
 *   - per-store KPI breakdown
 *   - a day-wise revenue trend for the chosen window
 *
 * All heavy lifting stays here — pages only render the numbers.
 */
import { useMemo } from "react";
import {
  getVendorTransactions,
  getPerStoreStats,
  computeKPIs,
} from "../lib/store";

function daysBetween(fromISO, toISO) {
  if (!fromISO || !toISO) return null;
  const start = new Date(fromISO); start.setHours(0, 0, 0, 0);
  const end = new Date(toISO); end.setHours(0, 0, 0, 0);
  const days = [];
  const d = new Date(start);
  while (d <= end) {
    days.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export default function useMultiStoreAnalytics({ vendor, storefrontIds, from, to }) {
  return useMemo(() => {
    if (!vendor) return null;
    const { orders, bookings } = getVendorTransactions(vendor.id, { storefrontIds, from, to });
    const kpis = computeKPIs({ orders, bookings });

    const perStore = getPerStoreStats(vendor.id, { from, to });
    // If user is filtering to specific stores, honour it in the breakdown too.
    const perStoreFiltered = storefrontIds && storefrontIds.length > 0
      ? perStore.filter((s) => storefrontIds.includes(s.storefront.id))
      : perStore;

    // Trend: bucket by day within [from, to] if provided; else fall back to
    // the last 30 days for a nice-looking chart.
    let trendDays = daysBetween(from, to);
    if (!trendDays || trendDays.length < 2) {
      const end = new Date(); end.setHours(0, 0, 0, 0);
      const start = new Date(end); start.setDate(start.getDate() - 29);
      trendDays = daysBetween(start.toISOString(), end.toISOString());
    }
    const trend = trendDays.map((iso) => {
      const orderRev = orders
        .filter((o) => (o.createdAt || "").slice(0, 10) === iso)
        .reduce((s, o) => s + (o.total || 0), 0);
      const bookingRev = bookings
        .filter((b) => (b.createdAt || "").slice(0, 10) === iso)
        .reduce((s, b) => s + (b.service?.price || 0), 0);
      return { iso, value: orderRev + bookingRev };
    });

    return { kpis, perStore: perStoreFiltered, trend, orders, bookings };
  }, [vendor, storefrontIds, from, to]);
}
