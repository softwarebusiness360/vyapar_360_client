import React from "react";
import { toast } from "sonner";
import { Loader2, RotateCcw, ShieldCheck, Sparkles, Zap, Crown, Building2 } from "lucide-react";
import usePlanMatrix from "./usePlanMatrix";

/**
 * AdminPlansPage — configure the plan-to-feature matrix used across the app.
 * Platform admin toggles feature flags & sets max-stores / max-employees per
 * tier. Every vendor inherits their tier's config on read.
 */

const TIER_META = {
  free: { icon: Sparkles, tint: "text-ink-secondary" },
  growth: { icon: Zap, tint: "text-brand" },
  pro: { icon: Crown, tint: "text-fuchsia-300" },
  enterprise: { icon: Building2, tint: "text-amber-300" },
};

const BOOL_FIELDS = [
  { key: "multiStore",    label: "Multi-storefront management" },
  { key: "employees",     label: "Team members (employees)" },
  { key: "whatsappNotifs",label: "WhatsApp notifications" },
  { key: "removeBranding",label: "Remove Vyapar360 branding" },
  { key: "customDomain",  label: "Custom domain" },
  { key: "prioritySupport", label: "Priority support" },
];

const INSIGHTS_LEVELS = ["basic", "advanced", "unlimited"];

export default function AdminPlansPage() {
  const { matrix, tiers, setTierField, save, reset, busy } = usePlanMatrix();

  const onSave = async () => {
    await save();
    toast.success("Plan matrix saved. Vendors will inherit changes instantly.");
  };
  const onReset = () => {
    if (!window.confirm("Reset all plan tiers to their factory defaults?")) return;
    reset();
    toast.success("Plan matrix reset to defaults");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-muted">Plans</div>
          <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="admin-plans-title">
            Plan matrix
          </h1>
          <p className="mt-1 text-ink-secondary">
            Toggle features, set store/employee limits, and configure entitlements per plan tier.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onReset} className="btn-ghost inline-flex items-center gap-2" data-testid="admin-plans-reset">
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button
            onClick={onSave}
            disabled={busy}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
            data-testid="admin-plans-save"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Save changes
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tiers.map((tier) => {
          const cfg = matrix[tier];
          const meta = TIER_META[tier] || TIER_META.free;
          const Icon = meta.icon;
          return (
            <div
              key={tier}
              className="card-surface p-5 space-y-4"
              data-testid={`admin-plan-card-${tier}`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl border grid place-items-center ${meta.tint} bg-white/5 border-line`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-ink-muted">Tier</div>
                  <input
                    value={cfg.label}
                    onChange={(e) => setTierField(tier, "label", e.target.value)}
                    className="mt-0.5 bg-transparent border-0 p-0 font-display text-xl font-medium focus:outline-none"
                    data-testid={`admin-plan-label-${tier}`}
                  />
                  <div className="text-[10px] font-mono text-ink-muted uppercase">{tier}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Row label="Max stores">
                  <input
                    type="number"
                    min="1"
                    className="input-field !py-2"
                    value={cfg.maxStores}
                    onChange={(e) => setTierField(tier, "maxStores", Number(e.target.value) || 1)}
                    data-testid={`admin-plan-maxStores-${tier}`}
                  />
                </Row>
                <Row label="Max employees">
                  <input
                    type="number"
                    min="0"
                    className="input-field !py-2"
                    value={cfg.maxEmployees}
                    onChange={(e) => setTierField(tier, "maxEmployees", Number(e.target.value) || 0)}
                    data-testid={`admin-plan-maxEmployees-${tier}`}
                  />
                </Row>
              </div>

              <Row label="Insights depth">
                <select
                  className="input-field !py-2"
                  value={cfg.insights}
                  onChange={(e) => setTierField(tier, "insights", e.target.value)}
                  data-testid={`admin-plan-insights-${tier}`}
                >
                  {INSIGHTS_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </Row>

              <div className="pt-3 border-t border-line/60 space-y-2">
                <div className="text-[11px] uppercase tracking-widest text-ink-muted">Features</div>
                {BOOL_FIELDS.map((f) => (
                  <label
                    key={f.key}
                    className="flex items-center justify-between gap-2 py-1"
                    data-testid={`admin-plan-${tier}-${f.key}`}
                  >
                    <span className="text-sm text-ink-secondary">{f.label}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={!!cfg[f.key]}
                      onClick={() => setTierField(tier, f.key, !cfg[f.key])}
                      className={`relative h-5 w-9 rounded-full transition-colors flex-shrink-0 ${
                        cfg[f.key] ? "bg-brand" : "bg-bg-surface border border-line"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                          cfg[f.key] ? "left-4" : "left-0.5"
                        }`}
                      />
                    </button>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card-surface p-4 text-xs text-ink-muted border border-brand/20 bg-brand-soft/30">
        Changes here apply to every vendor on that tier — including their current
        feature availability, store limits, and employee seats. Per-vendor overrides
        can still be applied from{" "}
        <code className="font-mono px-1 py-0.5 rounded bg-bg-surface border border-line">
          Businesses → &lt;name&gt;
        </code>
        .
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-1">{label}</div>
      {children}
    </label>
  );
}
