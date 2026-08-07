/**
 * useAdminBusinesses — admin directory of vendors + plan/feature mutations.
 * Wraps the store fns so the admin pages stay purely presentational.
 */
import { useCallback, useMemo, useState } from "react";
import * as repository from "@/data/adminRepository";

export default function useAdminBusinesses() {
  const { getVendors, saveVendor, deleteVendor: _delete, updateVendorFeatures, updateVendorPlan } = repository;
  const [tick, setTick] = useState(0);
  const vendors = useMemo(() => getVendors(), [tick]); // eslint-disable-line
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const disable = useCallback(
    (v, disabled) => {
      saveVendor({ ...v, disabled });
      refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    (id) => {
      _delete(id);
      refresh();
    },
    [refresh],
  );

  const setPlan = useCallback(
    (id, plan) => {
      updateVendorPlan(id, plan);
      refresh();
    },
    [refresh],
  );

  const setFeature = useCallback(
    (id, key, value) => {
      updateVendorFeatures(id, { [key]: value });
      refresh();
    },
    [refresh],
  );

  return { vendors, refresh, disable, remove, setPlan, setFeature };
}
