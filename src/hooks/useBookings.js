/**
 * useBookings — sibling of useOrders for salon appointments.
 */
import { useCallback, useMemo, useState } from "react";
import { getBookings, updateBookingStatus, getAllowedStorefronts } from "../lib/store";
import { useAuth } from "../lib/auth";

export default function useBookings({ storefrontId } = {}) {
  const { vendor, employee, refresh } = useAuth();
  const [tick, setTick] = useState(0);

  const scopedStoreIds = useMemo(() => {
    const allowed = getAllowedStorefronts(vendor, employee).map((s) => s.id);
    if (storefrontId && storefrontId !== "all") {
      return allowed.filter((id) => id === storefrontId);
    }
    return allowed;
  }, [vendor, employee, storefrontId]);

  const bookings = useMemo(() => {
    if (!vendor) return [];
    const all = getBookings(vendor.id);
    const legacyFallbackId = vendor.storefronts?.[0]?.id;
    return all.filter((b) => {
      const sid = b.storefrontId || legacyFallbackId;
      return scopedStoreIds.includes(sid);
    });
  }, [vendor, scopedStoreIds, tick]);

  const setStatus = useCallback(
    async (bookingId, status) => {
      const b = updateBookingStatus(bookingId, status);
      setTick((t) => t + 1);
      refresh();
      return b;
    },
    [refresh],
  );

  return { bookings, setStatus, allowedStorefrontIds: scopedStoreIds };
}
