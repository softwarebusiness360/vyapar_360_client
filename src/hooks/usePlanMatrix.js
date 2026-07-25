/**
 * usePlanMatrix — admin editor state + persistence for the plan-to-feature matrix.
 *
 * Consumers (AdminPlansPage) render fully controlled inputs off this hook.
 */
import { useCallback, useState } from "react";
import {
  getPlanMatrix,
  savePlanMatrix as _save,
  resetPlanMatrix as _reset,
  PLAN_TIERS,
} from "../lib/store";

export default function usePlanMatrix() {
  const [matrix, setMatrix] = useState(() => getPlanMatrix());
  const [busy, setBusy] = useState(false);

  const setTierField = useCallback((tier, field, value) => {
    setMatrix((m) => ({ ...m, [tier]: { ...m[tier], [field]: value } }));
  }, []);

  const save = useCallback(async () => {
    setBusy(true);
    try {
      _save(matrix);
      return matrix;
    } finally {
      setBusy(false);
    }
  }, [matrix]);

  const reset = useCallback(() => {
    const d = _reset();
    setMatrix(d);
    return d;
  }, []);

  return { matrix, tiers: PLAN_TIERS, setTierField, save, reset, busy };
}
