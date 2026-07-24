import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2, RotateCcw, Plus, Trash2, ExternalLink } from "lucide-react";
import { getLandingConfig, saveLandingConfig, resetLandingConfig } from "../../lib/store";

export default function AdminLandingCMSPage() {
  const [cfg, setCfg] = useState(() => getLandingConfig());
  const [busy, setBusy] = useState(false);

  const save = () => {
    setBusy(true);
    saveLandingConfig(cfg);
    setTimeout(() => {
      setBusy(false);
      toast.success("Landing page updated");
    }, 300);
  };
  const reset = () => {
    if (!window.confirm("Reset all landing content to defaults?")) return;
    const d = resetLandingConfig();
    setCfg(d);
    toast.success("Reset to defaults");
  };

  const setHero = (k, v) => setCfg({ ...cfg, hero: { ...cfg.hero, [k]: v } });
  const setPlanField = (idx, k, v) => {
    const plans = cfg.plans.map((p, i) => (i === idx ? { ...p, [k]: v } : p));
    setCfg({ ...cfg, plans });
  };
  const setPlanFeature = (planIdx, featIdx, patch) => {
    const plans = cfg.plans.map((p, i) => {
      if (i !== planIdx) return p;
      const features = p.features.map((f, j) => (j === featIdx ? { ...f, ...patch } : f));
      return { ...p, features };
    });
    setCfg({ ...cfg, plans });
  };
  const addPlanFeature = (planIdx) => {
    const plans = cfg.plans.map((p, i) => (i === planIdx ? { ...p, features: [...p.features, { text: "New feature", included: true }] } : p));
    setCfg({ ...cfg, plans });
  };
  const removePlanFeature = (planIdx, featIdx) => {
    const plans = cfg.plans.map((p, i) =>
      i === planIdx ? { ...p, features: p.features.filter((_, j) => j !== featIdx) } : p
    );
    setCfg({ ...cfg, plans });
  };

  const setStat = (idx, k, v) => {
    const stats = cfg.stats.map((s, i) => (i === idx ? { ...s, [k]: v } : s));
    setCfg({ ...cfg, stats });
  };
  const setFaq = (idx, k, v) => {
    const faqs = cfg.faqs.map((f, i) => (i === idx ? { ...f, [k]: v } : f));
    setCfg({ ...cfg, faqs });
  };
  const addFaq = () => setCfg({ ...cfg, faqs: [...cfg.faqs, { q: "New question", a: "Answer" }] });
  const removeFaq = (idx) => setCfg({ ...cfg, faqs: cfg.faqs.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-muted">CMS</div>
          <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="admin-cms-title">Landing page</h1>
          <p className="mt-1 text-ink-secondary">Edit marketing copy, pricing, and FAQ without shipping code.</p>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" rel="noreferrer" className="btn-ghost inline-flex items-center gap-2" data-testid="admin-cms-preview">
            <ExternalLink className="h-4 w-4" /> Preview
          </a>
          <button onClick={reset} className="btn-ghost inline-flex items-center gap-2" data-testid="admin-cms-reset">
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button onClick={save} disabled={busy} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60" data-testid="admin-cms-save">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
          </button>
        </div>
      </div>

      {/* Hero */}
      <Section title="Hero">
        <div className="grid gap-4 sm:grid-cols-2">
          <Row label="Eyebrow"><input className="input-field" value={cfg.hero.eyebrow} onChange={(e) => setHero("eyebrow", e.target.value)} data-testid="cms-hero-eyebrow" /></Row>
          <Row label="Social proof"><input className="input-field" value={cfg.hero.socialProof} onChange={(e) => setHero("socialProof", e.target.value)} data-testid="cms-hero-social" /></Row>
          <Row label="Headline line 1"><input className="input-field" value={cfg.hero.headlineLine1} onChange={(e) => setHero("headlineLine1", e.target.value)} data-testid="cms-hero-h1" /></Row>
          <Row label="Headline line 2"><input className="input-field" value={cfg.hero.headlineLine2} onChange={(e) => setHero("headlineLine2", e.target.value)} data-testid="cms-hero-h2" /></Row>
          <Row label="Headline highlight (gradient word)"><input className="input-field" value={cfg.hero.headlineHighlight} onChange={(e) => setHero("headlineHighlight", e.target.value)} data-testid="cms-hero-highlight" /></Row>
          <Row label="Headline line 3"><input className="input-field" value={cfg.hero.headlineLine3} onChange={(e) => setHero("headlineLine3", e.target.value)} data-testid="cms-hero-h3" /></Row>
          <Row label="Subtitle" className="sm:col-span-2">
            <textarea className="input-field min-h-[80px] resize-y" value={cfg.hero.subtitle} onChange={(e) => setHero("subtitle", e.target.value)} data-testid="cms-hero-subtitle" />
          </Row>
          <Row label="Primary CTA text"><input className="input-field" value={cfg.hero.ctaPrimary} onChange={(e) => setHero("ctaPrimary", e.target.value)} data-testid="cms-hero-cta1" /></Row>
          <Row label="Secondary CTA text"><input className="input-field" value={cfg.hero.ctaSecondary} onChange={(e) => setHero("ctaSecondary", e.target.value)} data-testid="cms-hero-cta2" /></Row>
        </div>
      </Section>

      {/* Stats */}
      <Section title="Stats band">
        <div className="grid gap-3 sm:grid-cols-2">
          {cfg.stats.map((s, i) => (
            <div key={i} className="rounded-lg border border-line bg-bg-elevated p-3 grid grid-cols-2 gap-2" data-testid={`cms-stat-${i}`}>
              <input className="input-field !py-2" value={s.value} onChange={(e) => setStat(i, "value", e.target.value)} placeholder="Value" />
              <input className="input-field !py-2" value={s.label} onChange={(e) => setStat(i, "label", e.target.value)} placeholder="Label" />
            </div>
          ))}
        </div>
      </Section>

      {/* Plans */}
      <Section title="Pricing plans">
        <div className="grid gap-4 md:grid-cols-3">
          {cfg.plans.map((p, i) => (
            <div key={p.id} className="rounded-xl border border-line bg-bg-elevated p-4 space-y-3" data-testid={`cms-plan-${p.id}`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-widest text-ink-muted">Plan {i + 1}</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-brand px-1.5 py-0.5 rounded border border-brand/40 bg-brand-soft">
                  {p.id}
                </span>
              </div>
              <Row label="Name"><input className="input-field !py-2" value={p.name} onChange={(e) => setPlanField(i, "name", e.target.value)} data-testid={`cms-plan-name-${p.id}`} /></Row>
              <div className="grid grid-cols-2 gap-2">
                <Row label="Price (₹)"><input type="number" className="input-field !py-2" value={p.price} onChange={(e) => setPlanField(i, "price", Number(e.target.value))} data-testid={`cms-plan-price-${p.id}`} /></Row>
                <Row label="Price suffix"><input className="input-field !py-2" value={p.priceSuffix} onChange={(e) => setPlanField(i, "priceSuffix", e.target.value)} /></Row>
              </div>
              <Row label="Tagline"><input className="input-field !py-2" value={p.tagline} onChange={(e) => setPlanField(i, "tagline", e.target.value)} /></Row>
              <div className="grid grid-cols-2 gap-2">
                <Row label="Badge"><input className="input-field !py-2" value={p.badge || ""} onChange={(e) => setPlanField(i, "badge", e.target.value)} /></Row>
                <Row label="CTA"><input className="input-field !py-2" value={p.ctaLabel} onChange={(e) => setPlanField(i, "ctaLabel", e.target.value)} /></Row>
              </div>

              <div className="pt-2 border-t border-line/60">
                <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-2">Features</div>
                <ul className="space-y-1.5">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2" data-testid={`cms-plan-${p.id}-feature-${j}`}>
                      <input
                        type="checkbox"
                        checked={f.included}
                        onChange={(e) => setPlanFeature(i, j, { included: e.target.checked })}
                        className="h-3.5 w-3.5"
                      />
                      <input
                        className="flex-1 bg-transparent border-0 p-0 text-xs focus:outline-none"
                        value={f.text}
                        onChange={(e) => setPlanFeature(i, j, { text: e.target.value })}
                      />
                      <button onClick={() => removePlanFeature(i, j)} className="text-ink-muted hover:text-red-400" aria-label="Remove">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
                <button onClick={() => addPlanFeature(i)} className="mt-2 text-xs text-brand hover:text-brand-hover inline-flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add feature
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQs */}
      <Section
        title="FAQ"
        action={<button onClick={addFaq} className="btn-ghost inline-flex items-center gap-2 text-xs !py-1.5" data-testid="cms-faq-add"><Plus className="h-3.5 w-3.5" /> Add</button>}
      >
        <div className="space-y-3">
          {cfg.faqs.map((f, i) => (
            <div key={i} className="rounded-lg border border-line bg-bg-elevated p-3 space-y-2" data-testid={`cms-faq-${i}`}>
              <div className="flex items-start gap-2">
                <input className="input-field !py-2 flex-1" value={f.q} onChange={(e) => setFaq(i, "q", e.target.value)} placeholder="Question" />
                <button onClick={() => removeFaq(i)} className="h-8 w-8 grid place-items-center rounded-md text-ink-muted hover:text-red-400" aria-label="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea className="input-field min-h-[70px] resize-y text-sm" value={f.a} onChange={(e) => setFaq(i, "a", e.target.value)} placeholder="Answer" />
            </div>
          ))}
        </div>
      </Section>

      <div className="flex justify-end gap-2 pt-4">
        <button onClick={reset} className="btn-ghost inline-flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Reset</button>
        <button onClick={save} disabled={busy} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, action, children }) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-medium">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}
function Row({ label, className = "", children }) {
  return (
    <label className={`block ${className}`}>
      <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-1.5">{label}</div>
      {children}
    </label>
  );
}
