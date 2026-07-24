import React from "react";
import { Link } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";

export default function UpgradeGate({ feature, description }) {
  return (
    <div className="card-surface p-10 sm:p-16 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-brand to-fuchsia-500 grid place-items-center shadow-glow">
        <Lock className="h-6 w-6 text-white" />
      </div>
      <div className="mt-5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] uppercase tracking-widest bg-brand-soft border border-brand/30 text-brand">
        <Sparkles className="h-3 w-3" /> Pro / Growth feature
      </div>
      <h2 className="mt-4 font-display text-2xl font-medium tracking-tight" data-testid="upgrade-gate-title">
        {feature} is available on paid plans
      </h2>
      <p className="mt-3 text-ink-secondary max-w-md mx-auto">{description}</p>
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to="/#pricing" className="btn-primary inline-flex items-center gap-2">
          See plans
        </Link>
        <a href="mailto:sales@vyapar360.com" className="btn-ghost">Contact sales</a>
      </div>
      <p className="mt-6 text-[11px] text-ink-muted">
        MVP note: platform admin can enable this per vendor from <span className="font-mono">/admin/businesses/&lt;id&gt;</span>.
      </p>
    </div>
  );
}
