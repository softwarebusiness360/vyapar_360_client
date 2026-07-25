/**
 * useStorefronts — read + mutate a vendor's storefronts.
 *
 * Reads through the mock store today; when the real backend lands, swap the
 * internals for the API adapter without touching any consumer component.
 */
import { useCallback, useMemo, useState } from "react";
import {
  addStorefront as _add,
  deleteStorefront as _delete,
  updateStorefront as _update,
  getAllowedStorefronts,
} from "../lib/store";
import { useAuth } from "../lib/auth";

export default function useStorefronts() {
  const { vendor, employee, refresh } = useAuth();
  const [busy, setBusy] = useState(false);

  const all = vendor?.storefronts || [];
  const allowed = useMemo(() => getAllowedStorefronts(vendor, employee), [vendor, employee]);

  const addStorefront = useCallback(
    async (payload) => {
      setBusy(true);
      try {
        const sf = _add(vendor.id, payload);
        refresh();
        return sf;
      } finally {
        setBusy(false);
      }
    },
    [vendor, refresh],
  );

  const updateStorefront = useCallback(
    async (storefrontId, patch) => {
      setBusy(true);
      try {
        const sf = _update(vendor.id, storefrontId, patch);
        refresh();
        return sf;
      } finally {
        setBusy(false);
      }
    },
    [vendor, refresh],
  );

  const removeStorefront = useCallback(
    async (storefrontId) => {
      setBusy(true);
      try {
        _delete(vendor.id, storefrontId);
        refresh();
      } finally {
        setBusy(false);
      }
    },
    [vendor, refresh],
  );

  return { storefronts: all, allowed, busy, addStorefront, updateStorefront, removeStorefront };
}
