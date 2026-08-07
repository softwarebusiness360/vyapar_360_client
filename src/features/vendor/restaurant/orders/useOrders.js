/**
 * useOrders / useBookings — scoped transaction lists.
 *
 * Handles the RBAC scoping for employees (only their assigned stores)
 * transparently, so pages don't repeat the logic. Owners see everything.
 */
import { useCallback, useMemo, useState } from "react";
import * as repository from "@/data/orderRepository";
import { useAuth } from "../../../../lib/auth";

export default function useOrders({ storefrontId } = {}) {
  const { getOrders, updateOrderStatus, getAllowedStorefronts } = repository;
  const { vendor, employee, refresh } = useAuth();
  const [tick, setTick] = useState(0);

  const scopedStoreIds = useMemo(() => {
    const allowed = getAllowedStorefronts(vendor, employee).map((s) => s.id);
    if (storefrontId && storefrontId !== "all") {
      return allowed.filter((id) => id === storefrontId);
    }
    return allowed;
  }, [vendor, employee, storefrontId]);

  const orders = useMemo(() => {
    if (!vendor) return [];
    const all = getOrders(vendor.id);
    const legacyFallbackId = vendor.storefronts?.[0]?.id;
    return all.filter((o) => {
      const sid = o.storefrontId || legacyFallbackId;
      return scopedStoreIds.includes(sid);
    });
    // tick forces recompute after status updates
  }, [vendor, scopedStoreIds, tick]);

  const setStatus = useCallback(
    async (orderId, status) => {
      const o = updateOrderStatus(orderId, status);
      setTick((t) => t + 1);
      refresh();
      return o;
    },
    [refresh],
  );

  return { orders, setStatus, allowedStorefrontIds: scopedStoreIds };
}
