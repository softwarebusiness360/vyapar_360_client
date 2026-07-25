/**
 * useEmployees — read + mutate the vendor's team.
 *
 * Encapsulates all team-related state & data access so pages become purely
 * presentational.
 */
import { useCallback, useState } from "react";
import {
  addEmployee as _add,
  updateEmployee as _update,
  deleteEmployee as _delete,
  ROLE_PRESETS,
} from "../lib/store";
import { useAuth } from "../lib/auth";

export default function useEmployees() {
  const { vendor, refresh } = useAuth();
  const [busy, setBusy] = useState(false);

  const employees = vendor?.employees || [];
  const planConfig = vendor?.planConfig;
  const canAddMore = planConfig ? employees.length < planConfig.maxEmployees : false;
  const remainingSeats = planConfig
    ? Math.max(0, planConfig.maxEmployees - employees.length)
    : 0;

  const addTeamMember = useCallback(
    async (payload) => {
      setBusy(true);
      try {
        const emp = _add(vendor.id, payload);
        refresh();
        return emp;
      } finally {
        setBusy(false);
      }
    },
    [vendor, refresh],
  );

  const updateTeamMember = useCallback(
    async (empId, patch) => {
      setBusy(true);
      try {
        const emp = _update(vendor.id, empId, patch);
        refresh();
        return emp;
      } finally {
        setBusy(false);
      }
    },
    [vendor, refresh],
  );

  const removeTeamMember = useCallback(
    async (empId) => {
      setBusy(true);
      try {
        _delete(vendor.id, empId);
        refresh();
      } finally {
        setBusy(false);
      }
    },
    [vendor, refresh],
  );

  return {
    employees,
    canAddMore,
    remainingSeats,
    maxEmployees: planConfig?.maxEmployees || 0,
    busy,
    rolePresets: ROLE_PRESETS,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
  };
}
