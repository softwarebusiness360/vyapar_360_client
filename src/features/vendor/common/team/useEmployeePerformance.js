/**
 * useEmployeePerformance — per-employee KPIs for the owner's team page.
 *
 * Returns `[{ employee, assignedStores, revenue, orders, bookings, txCount, avgTicket }]`
 * scoped by the current period + optional storefront filter.
 */
import { useMemo } from "react";
import * as repository from "@/data/workforceRepository";

export default function useEmployeePerformance({ vendor, storefrontIds, from, to }) {
  const { getEmployeePerformance } = repository;
  return useMemo(() => {
    if (!vendor) return [];
    return getEmployeePerformance(vendor.id, { storefrontIds, from, to })
      // Owners sort by top revenue first — most useful signal.
      .sort((a, b) => b.revenue - a.revenue);
  }, [vendor, storefrontIds, from, to]);
}
