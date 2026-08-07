import React, { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, RotateCcw, Loader2, Users, Crown, User, Store, ShieldAlert } from "lucide-react";
import * as repository from "@/data/adminRepository";

/**
 * AdminPersonaMatrixPage — configure which persona sees which feature.
 * Owners can see everything by default; the matrix lets platform admin
 * quickly hide/show entire features per persona to match a customer's
 * operational needs.
 */

const PERSONA_META = {
  owner:    { label: "Business Owner", icon: Crown,       tint: "text-emerald-300", bg: "bg-emerald-500/10 border-emerald-500/30" },
  manager:  { label: "Store Manager",  icon: ShieldCheck, tint: "text-fuchsia-300", bg: "bg-fuchsia-500/10 border-fuchsia-500/30" },
  employee: { label: "Employee",       icon: User,        tint: "text-ink-secondary", bg: "bg-white/5 border-line" },
  customer: { label: "Customer",       icon: Store,       tint: "text-brand",       bg: "bg-brand-soft border-brand/30" },
  admin:    { label: "Platform Admin", icon: ShieldAlert, tint: "text-amber-300",   bg: "bg-amber-500/10 border-amber-500/30" },
};

export default function AdminPersonaMatrixPage() {
  const { getPersonaMatrix, savePersonaMatrix, resetPersonaMatrix, PERSONAS, FEATURE_CATALOG } = repository;
  const [matrix, setMatrix] = useState(() => getPersonaMatrix());
  const [busy, setBusy] = useState(false);

  const toggle = (featureId, persona) => {
    setMatrix((prev) => {
      const current = prev[featureId] || [];
      const next = current.includes(persona) ? current.filter((p) => p !== persona) : [...current, persona];
      return { ...prev, [featureId]: next };
    });
  };

  const save = async () => {
    setBusy(true);
    try {
      savePersonaMatrix(matrix);
      toast.success("Persona visibility saved. Applies to new sessions immediately.");
    } finally { setBusy(false); }
  };

  const reset = () => {
    if (!window.confirm("Reset persona visibility to factory defaults?")) return;
    setMatrix(resetPersonaMatrix());
    toast.success("Reset to defaults");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-muted">Access control</div>
          <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="admin-persona-title">
            Feature × persona matrix
          </h1>
          <p className="mt-1 text-ink-secondary">
            Toggle who sees what. Applies to <span className="text-ink-primary">every</span> vendor workspace across the platform.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="btn-ghost inline-flex items-center gap-2" data-testid="admin-persona-reset">
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button onClick={save} disabled={busy} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60" data-testid="admin-persona-save">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Save
          </button>
        </div>
      </div>

      <div className="card-surface overflow-x-auto">
        <table className="w-full min-w-[720px]" data-testid="persona-matrix-table">
          <thead className="border-b border-line">
            <tr>
              <th className="text-left px-4 py-3 text-[11px] uppercase tracking-widest text-ink-muted font-normal">Feature</th>
              {PERSONAS.map((p) => {
                const meta = PERSONA_META[p];
                const Icon = meta.icon;
                return (
                  <th key={p} className="px-2 py-3 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${meta.bg} ${meta.tint}`}>
                      <Icon className="h-3 w-3" />
                      <span>{meta.label}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {FEATURE_CATALOG.map((feature) => (
              <tr key={feature.id} className="hover:bg-white/[0.02]" data-testid={`persona-row-${feature.id}`}>
                <td className="px-4 py-3">
                  <div className="text-sm">{feature.label}</div>
                  <div className="text-[10px] font-mono text-ink-muted">{feature.id}</div>
                </td>
                {PERSONAS.map((persona) => {
                  const on = (matrix[feature.id] || []).includes(persona);
                  return (
                    <td key={persona} className="px-2 py-3 text-center">
                      <button
                        onClick={() => toggle(feature.id, persona)}
                        role="switch"
                        aria-checked={on}
                        data-testid={`persona-cell-${feature.id}-${persona}`}
                        className={`h-6 w-11 rounded-full relative transition-colors ${
                          on ? "bg-brand" : "bg-bg-elevated border border-line"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                            on ? "left-5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-surface p-4 text-xs text-ink-muted border border-brand/20 bg-brand-soft/30">
        Personas here are additive over the plan matrix — a feature toggled off for a persona is invisible
        even if the plan tier allows it. Owners still see everything by default; toggling them off is only
        useful when running a restricted preview.
      </div>
    </div>
  );
}
