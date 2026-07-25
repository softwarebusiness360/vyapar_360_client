/**
 * useLandingConfig — landing-page CMS state + persistence.
 * Container/Presentational split for AdminLandingCMSPage.
 */
import { useCallback, useState } from "react";
import {
  getLandingConfig,
  saveLandingConfig as _save,
  resetLandingConfig as _reset,
} from "../lib/store";

export default function useLandingConfig() {
  const [cfg, setCfg] = useState(() => getLandingConfig());
  const [busy, setBusy] = useState(false);

  const patch = useCallback((updater) => {
    setCfg((prev) => (typeof updater === "function" ? updater(prev) : { ...prev, ...updater }));
  }, []);

  const save = useCallback(async () => {
    setBusy(true);
    try {
      _save(cfg);
      return cfg;
    } finally {
      setBusy(false);
    }
  }, [cfg]);

  const reset = useCallback(() => {
    const d = _reset();
    setCfg(d);
    return d;
  }, []);

  return { cfg, setCfg, patch, save, reset, busy };
}
