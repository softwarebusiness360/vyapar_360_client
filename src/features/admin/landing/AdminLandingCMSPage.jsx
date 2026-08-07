import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2, RotateCcw, Plus, Trash2, ExternalLink } from "lucide-react";
import * as repository from "@/data/adminRepository";

export default function AdminLandingCMSPage() {
  const { getLandingConfig, saveLandingConfig, resetLandingConfig } = repository;
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
  const setBrand = (k, v) => setCfg({ ...cfg, brand: { ...cfg.brand, [k]: v } });
  const setNavigation = (k, v) => setCfg({ ...cfg, navigation: { ...cfg.navigation, [k]: v } });
  const setNavItem = (idx, patch) => setNavigation("items", cfg.navigation.items.map((item, i) => i === idx ? { ...item, ...patch } : item));
  const setPricing = (k, v) => setCfg({ ...cfg, pricing: { ...cfg.pricing, [k]: v } });
  const setHow = (k, v) => setCfg({ ...cfg, howItWorks: { ...cfg.howItWorks, [k]: v } });
  const setHowStep = (idx, k, v) => setHow("steps", cfg.howItWorks.steps.map((step, i) => i === idx ? { ...step, [k]: v } : step));
  const setFeatures = (k, v) => setCfg({ ...cfg, features: { ...cfg.features, [k]: v } });
  const setFeatureCard = (idx, k, v) => setFeatures("cards", cfg.features.cards.map((card, i) => i === idx ? { ...card, [k]: v } : card));
  const setBusinessTypes = (k, v) => setCfg({ ...cfg, businessTypes: { ...cfg.businessTypes, [k]: v } });
  const setBusinessTypeItem = (group, idx, patch) => setBusinessTypes(group, cfg.businessTypes[group].map((item, i) => i === idx ? { ...item, ...patch } : item));
  const moveBusinessTypeItem = (group, idx, nextGroup) => {
    if (group === nextGroup) return;
    const item = cfg.businessTypes[group][idx];
    setCfg({
      ...cfg,
      businessTypes: {
        ...cfg.businessTypes,
        [group]: cfg.businessTypes[group].filter((_, i) => i !== idx),
        [nextGroup]: [...cfg.businessTypes[nextGroup], item],
      },
    });
  };
  const setFooterNote = (idx, k, v) => {
    const footerNotes = (cfg.pricing.footerNotes || []).map((n, i) =>
      i === idx ? { ...n, [k]: v } : n,
    );
    setPricing("footerNotes", footerNotes);
  };
  const addFooterNote = () =>
    setPricing("footerNotes", [
      ...(cfg.pricing.footerNotes || []),
      { icon: "credit-card", text: "New note" },
    ]);
  const removeFooterNote = (idx) =>
    setPricing(
      "footerNotes",
      (cfg.pricing.footerNotes || []).filter((_, i) => i !== idx),
    );
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
    const plans = cfg.plans.map((p, i) => (i === planIdx ? { ...p, features: [...p.features, { text: "New feature", included: true, visible: true }] } : p));
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
  const setFaqSection = (k, v) => setCfg({ ...cfg, faqSection: { ...cfg.faqSection, [k]: v } });
  const setFinalCta = (k, v) => setCfg({ ...cfg, finalCta: { ...cfg.finalCta, [k]: v } });
  const setFooter = (k, v) => setCfg({ ...cfg, footer: { ...cfg.footer, [k]: v } });
  const setFooterLink = (idx, patch) => setFooter("links", cfg.footer.links.map((item, i) => i === idx ? { ...item, ...patch } : item));
  const setLegal = (page, k, v) => setCfg({ ...cfg, legal: { ...cfg.legal, [page]: { ...cfg.legal[page], [k]: v } } });

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

      <Section title="Brand & navigation">
        <div className="grid gap-4 sm:grid-cols-2">
          <Row label="Brand name"><input className="input-field" value={cfg.brand.name} onChange={(e) => setBrand("name", e.target.value)} data-testid="cms-brand-name" /></Row>
          <Row label="Logo image URL"><input className="input-field" value={cfg.brand.logoUrl} onChange={(e) => setBrand("logoUrl", e.target.value)} placeholder="Optional https://…" data-testid="cms-brand-logo" /></Row>
          {cfg.navigation.items.map((item, i) => <div key={item.id} className="sm:col-span-2 grid grid-cols-[auto_1fr_1fr] items-center gap-2">
            <input type="checkbox" checked={item.visible !== false} onChange={(e) => setNavItem(i, { visible: e.target.checked })} aria-label={`Show ${item.label}`} />
            <input className="input-field" value={item.label} onChange={(e) => setNavItem(i, { label: e.target.value })} />
            <input className="input-field" value={item.href} onChange={(e) => setNavItem(i, { href: e.target.value })} />
          </div>)}
          <Row label="Login label"><input className="input-field" value={cfg.navigation.loginLabel} onChange={(e) => setNavigation("loginLabel", e.target.value)} /></Row>
          <Row label="Login destination"><select className="input-field" value={cfg.navigation.loginTo} onChange={(e) => setNavigation("loginTo", e.target.value)}><option value="/login">/login</option></select></Row>
          <Row label="Primary CTA label"><input className="input-field" value={cfg.navigation.ctaLabel} onChange={(e) => setNavigation("ctaLabel", e.target.value)} /></Row>
          <Row label="Primary CTA destination"><select className="input-field" value={cfg.navigation.ctaTo} onChange={(e) => setNavigation("ctaTo", e.target.value)}><option value="/register">/register</option></select></Row>
        </div>
      </Section>

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
          <Row label="Primary CTA destination"><select className="input-field" value={cfg.hero.ctaPrimaryTo} onChange={(e) => setHero("ctaPrimaryTo", e.target.value)}><option value="/register">/register</option></select></Row>
          <Row label="Secondary CTA destination"><select className="input-field" value={cfg.hero.ctaSecondaryTo} onChange={(e) => setHero("ctaSecondaryTo", e.target.value)}><option value="#how-it-works">#how-it-works</option><option value="#pricing">#pricing</option><option value="#features">#features</option><option value="#business-types">#business-types</option></select></Row>
          {(cfg.hero.flowSteps || []).map((step, index) => <Row key={index} label={`Hero flow step ${index + 1}`}>
            <input className="input-field" value={step} onChange={(e) => setHero("flowSteps", cfg.hero.flowSteps.map((value, i) => i === index ? e.target.value : value))} data-testid={`cms-hero-flow-${index}`} />
          </Row>)}
        </div>
      </Section>

      <Section title="How it works">
        <div className="grid gap-4 sm:grid-cols-2">
          <Row label="Eyebrow"><input className="input-field" value={cfg.howItWorks.eyebrow} onChange={(e) => setHow("eyebrow", e.target.value)} /></Row>
          <Row label="Heading"><input className="input-field" value={cfg.howItWorks.title} onChange={(e) => setHow("title", e.target.value)} /></Row>
          <Row label="Subtext" className="sm:col-span-2"><input className="input-field" value={cfg.howItWorks.subtitle} onChange={(e) => setHow("subtitle", e.target.value)} /></Row>
          {cfg.howItWorks.steps.map((step, index) => <div key={index} className="rounded-lg border border-line bg-bg-elevated p-3 space-y-2">
            <input className="input-field" value={step.title} onChange={(e) => setHowStep(index, "title", e.target.value)} data-testid={`cms-how-title-${index}`} />
            <textarea className="input-field min-h-[60px]" value={step.body} onChange={(e) => setHowStep(index, "body", e.target.value)} data-testid={`cms-how-body-${index}`} />
          </div>)}
        </div>
      </Section>

      <Section title="Features">
        <div className="grid gap-4 sm:grid-cols-2">
          <Row label="Eyebrow"><input className="input-field" value={cfg.features.eyebrow} onChange={(e) => setFeatures("eyebrow", e.target.value)} /></Row>
          <Row label="Heading"><input className="input-field" value={cfg.features.title} onChange={(e) => setFeatures("title", e.target.value)} /></Row>
          <Row label="Subtext" className="sm:col-span-2"><input className="input-field" value={cfg.features.subtitle} onChange={(e) => setFeatures("subtitle", e.target.value)} /></Row>
          {cfg.features.cards.map((card, index) => <div key={index} className="rounded-lg border border-line bg-bg-elevated p-3 space-y-2">
            <input className="input-field" value={card.title} onChange={(e) => setFeatureCard(index, "title", e.target.value)} data-testid={`cms-feature-title-${index}`} />
            <textarea className="input-field min-h-[60px]" value={card.body} onChange={(e) => setFeatureCard(index, "body", e.target.value)} data-testid={`cms-feature-body-${index}`} />
          </div>)}
        </div>
      </Section>

      <Section title="Business types">
        <div className="grid gap-4 sm:grid-cols-2">
          <Row label="Eyebrow"><input className="input-field" value={cfg.businessTypes.eyebrow} onChange={(e) => setBusinessTypes("eyebrow", e.target.value)} /></Row>
          <Row label="Heading"><input className="input-field" value={cfg.businessTypes.title} onChange={(e) => setBusinessTypes("title", e.target.value)} data-testid="cms-business-types-title" /></Row>
          <Row label="Subtext" className="sm:col-span-2"><input className="input-field" value={cfg.businessTypes.subtitle} onChange={(e) => setBusinessTypes("subtitle", e.target.value)} /></Row>
          <Row label="Available label"><input className="input-field" value={cfg.businessTypes.availableLabel} onChange={(e) => setBusinessTypes("availableLabel", e.target.value)} /></Row>
          <Row label="Future label"><input className="input-field" value={cfg.businessTypes.comingLabel} onChange={(e) => setBusinessTypes("comingLabel", e.target.value)} /></Row>
        </div>
        {(["available", "coming"]).map((group) => <div key={group} className="mt-4 pt-4 border-t border-line/60">
          <div className="mb-2 text-[11px] uppercase tracking-widest text-ink-muted">{group === "available" ? cfg.businessTypes.availableLabel : cfg.businessTypes.comingLabel}</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {cfg.businessTypes[group].map((item, index) => <div key={item.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg border border-line bg-bg-elevated p-2" data-testid={`cms-business-type-${item.id}`}>
              <input type="checkbox" checked={item.visible !== false} onChange={(e) => setBusinessTypeItem(group, index, { visible: e.target.checked })} aria-label={`Show ${item.name}`} />
              <input className="input-field !py-2" value={item.name} onChange={(e) => setBusinessTypeItem(group, index, { name: e.target.value })} />
              <select className="input-field !py-2 !w-auto" value={group} onChange={(e) => moveBusinessTypeItem(group, index, e.target.value)} aria-label={`${item.name} status`}>
                <option value="available">Available</option>
                <option value="coming">Coming later</option>
              </select>
            </div>)}
          </div>
        </div>)}
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

      {/* Pricing section (heading, toggle & footer) */}
      <Section title="Pricing section">
        <div className="grid gap-4 sm:grid-cols-2">
          <Row label="Eyebrow"><input className="input-field" value={cfg.pricing.eyebrow} onChange={(e) => setPricing("eyebrow", e.target.value)} data-testid="cms-pricing-eyebrow" /></Row>
          <Row label="Currency symbol"><input className="input-field" value={cfg.pricing.currencySymbol} onChange={(e) => setPricing("currencySymbol", e.target.value)} data-testid="cms-pricing-currency" /></Row>
          <Row label="Title" className="sm:col-span-2"><input className="input-field" value={cfg.pricing.title} onChange={(e) => setPricing("title", e.target.value)} data-testid="cms-pricing-title" /></Row>
          <Row label="Subtitle" className="sm:col-span-2">
            <textarea className="input-field min-h-[80px] resize-y" value={cfg.pricing.subtitle} onChange={(e) => setPricing("subtitle", e.target.value)} data-testid="cms-pricing-subtitle" />
          </Row>
        </div>

        <div className="mt-4 pt-4 border-t border-line/60">
          <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-3">Billing toggle</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-lg border border-line bg-bg-elevated px-3 py-2 cursor-pointer" data-testid="cms-pricing-show-toggle">
              <input
                type="checkbox"
                checked={!!cfg.pricing.showBillingToggle}
                onChange={(e) => setPricing("showBillingToggle", e.target.checked)}
                className="h-3.5 w-3.5"
              />
              <span className="text-sm text-ink-primary">Show monthly / annual toggle</span>
            </label>
            <Row label="Default billing cycle">
              <select
                className="input-field !py-2"
                value={cfg.pricing.defaultBilling}
                onChange={(e) => setPricing("defaultBilling", e.target.value)}
                data-testid="cms-pricing-default-billing"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </Row>
            <Row label="Monthly label"><input className="input-field !py-2" value={cfg.pricing.monthlyLabel} onChange={(e) => setPricing("monthlyLabel", e.target.value)} data-testid="cms-pricing-monthly-label" /></Row>
            <Row label="Annual label"><input className="input-field !py-2" value={cfg.pricing.annualLabel} onChange={(e) => setPricing("annualLabel", e.target.value)} data-testid="cms-pricing-annual-label" /></Row>
            <Row label="Annual savings badge"><input className="input-field !py-2" value={cfg.pricing.annualBadge} onChange={(e) => setPricing("annualBadge", e.target.value)} placeholder="e.g. Save up to 20%" data-testid="cms-pricing-annual-badge" /></Row>
            <Row label="Monthly plan hint"><input className="input-field !py-2" value={cfg.pricing.monthlyNote} onChange={(e) => setPricing("monthlyNote", e.target.value)} /></Row>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-line/60">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-widest text-ink-muted">Footer notes (under plans)</div>
            <button onClick={addFooterNote} className="btn-ghost inline-flex items-center gap-2 text-xs !py-1.5" data-testid="cms-pricing-footer-add"><Plus className="h-3.5 w-3.5" /> Add</button>
          </div>
          <div className="space-y-2">
            {(cfg.pricing.footerNotes || []).map((n, i) => (
              <div key={i} className="grid grid-cols-[130px_1fr_auto] gap-2 items-center rounded-lg border border-line bg-bg-elevated p-2" data-testid={`cms-pricing-footer-note-${i}`}>
                <select className="input-field !py-2" value={n.icon} onChange={(e) => setFooterNote(i, "icon", e.target.value)}>
                  <option value="credit-card">Credit card</option>
                  <option value="message-circle">Message</option>
                  <option value="globe">Globe</option>
                </select>
                <input className="input-field !py-2" value={n.text} onChange={(e) => setFooterNote(i, "text", e.target.value)} />
                <button onClick={() => removeFooterNote(i)} className="h-8 w-8 grid place-items-center rounded-md text-ink-muted hover:text-red-400" aria-label="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
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
                <Row label={`Monthly price (${cfg.pricing.currencySymbol})`}>
                  <input type="number" min="0" className="input-field !py-2" value={p.monthlyPrice} onChange={(e) => setPlanField(i, "monthlyPrice", Number(e.target.value))} data-testid={`cms-plan-monthly-${p.id}`} />
                </Row>
                <Row label={`Annual price / mo (${cfg.pricing.currencySymbol})`}>
                  <input type="number" min="0" className="input-field !py-2" value={p.annualPrice} onChange={(e) => setPlanField(i, "annualPrice", Number(e.target.value))} data-testid={`cms-plan-annual-${p.id}`} />
                </Row>
              </div>
              <div className="text-[10px] text-ink-muted -mt-1">
                {p.monthlyPrice > 0 && p.annualPrice > 0 && p.annualPrice < p.monthlyPrice ? (
                  <>Annual billed as {cfg.pricing.currencySymbol}{(p.annualPrice * 12).toLocaleString("en-IN")} · saves {Math.round(((p.monthlyPrice - p.annualPrice) / p.monthlyPrice) * 100)}%</>
                ) : (
                  <>Set annual &lt; monthly to auto-show a savings badge.</>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Row label="Price suffix"><input className="input-field !py-2" value={p.priceSuffix} onChange={(e) => setPlanField(i, "priceSuffix", e.target.value)} /></Row>
                <Row label="Icon">
                  <select className="input-field !py-2" value={p.icon} onChange={(e) => setPlanField(i, "icon", e.target.value)}>
                    <option value="sparkles">Sparkles</option>
                    <option value="zap">Zap</option>
                    <option value="crown">Crown</option>
                  </select>
                </Row>
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
                    <li key={j} className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-2" data-testid={`cms-plan-${p.id}-feature-${j}`}>
                      <label className="inline-flex items-center gap-1 text-[10px] text-ink-muted" title="Show publicly">
                        <input
                          type="checkbox"
                          checked={f.visible !== false}
                          onChange={(e) => setPlanFeature(i, j, { visible: e.target.checked })}
                          className="h-3.5 w-3.5"
                          data-testid={`cms-plan-${p.id}-feature-${j}-visible`}
                        />
                        Show
                      </label>
                      <label className="inline-flex items-center gap-1 text-[10px] text-ink-muted" title="Included in this plan">
                        <input
                          type="checkbox"
                          checked={f.included}
                          onChange={(e) => setPlanFeature(i, j, { included: e.target.checked })}
                          className="h-3.5 w-3.5"
                        />
                        Include
                      </label>
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
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <Row label="Eyebrow"><input className="input-field" value={cfg.faqSection.eyebrow} onChange={(e) => setFaqSection("eyebrow", e.target.value)} /></Row>
          <Row label="Heading"><input className="input-field" value={cfg.faqSection.title} onChange={(e) => setFaqSection("title", e.target.value)} data-testid="cms-faq-title" /></Row>
          <Row label="Subtext" className="sm:col-span-2"><input className="input-field" value={cfg.faqSection.subtitle} onChange={(e) => setFaqSection("subtitle", e.target.value)} /></Row>
        </div>
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

      <Section title="Final CTA">
        <div className="grid gap-4 sm:grid-cols-2">
          <Row label="Heading" className="sm:col-span-2"><input className="input-field" value={cfg.finalCta.title} onChange={(e) => setFinalCta("title", e.target.value)} data-testid="cms-final-cta-title" /></Row>
          <Row label="Subtext" className="sm:col-span-2"><input className="input-field" value={cfg.finalCta.subtitle} onChange={(e) => setFinalCta("subtitle", e.target.value)} /></Row>
          <Row label="Primary CTA"><input className="input-field" value={cfg.finalCta.primaryLabel} onChange={(e) => setFinalCta("primaryLabel", e.target.value)} /></Row>
          <Row label="Primary destination"><input className="input-field" value={cfg.finalCta.primaryTo} onChange={(e) => setFinalCta("primaryTo", e.target.value)} /></Row>
          <Row label="Secondary CTA"><input className="input-field" value={cfg.finalCta.secondaryLabel} onChange={(e) => setFinalCta("secondaryLabel", e.target.value)} /></Row>
          <Row label="Secondary destination"><input className="input-field" value={cfg.finalCta.secondaryTo} onChange={(e) => setFinalCta("secondaryTo", e.target.value)} /></Row>
        </div>
      </Section>

      <Section title="Footer">
        <div className="grid gap-4 sm:grid-cols-2">
          <Row label="Description" className="sm:col-span-2"><input className="input-field" value={cfg.footer.description} onChange={(e) => setFooter("description", e.target.value)} /></Row>
          <Row label="Copyright suffix" className="sm:col-span-2"><input className="input-field" value={cfg.footer.copyrightSuffix} onChange={(e) => setFooter("copyrightSuffix", e.target.value)} /></Row>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {cfg.footer.links.map((item, index) => <div key={item.id} className="grid grid-cols-[auto_1fr] gap-2 rounded-lg border border-line bg-bg-elevated p-2" data-testid={`cms-footer-link-${item.id}`}>
            <input type="checkbox" checked={item.visible !== false} onChange={(e) => setFooterLink(index, { visible: e.target.checked })} aria-label={`Show ${item.label}`} />
            <input className="input-field !py-2" value={item.label} onChange={(e) => setFooterLink(index, { label: e.target.value })} />
            {!item.action && <input className="input-field !py-2 col-start-2" value={item.to} onChange={(e) => setFooterLink(index, { to: e.target.value })} aria-label={`${item.label} destination`} />}
          </div>)}
        </div>
      </Section>

      <Section title="Legal pages">
        <div className="grid gap-4 md:grid-cols-2">
          {(["privacy", "terms"]).map((page) => <div key={page} className="rounded-lg border border-line bg-bg-elevated p-3 space-y-2">
            <Row label={`${page} title`}><input className="input-field" value={cfg.legal[page].title} onChange={(e) => setLegal(page, "title", e.target.value)} /></Row>
            <Row label="Paragraphs (one per line)"><textarea className="input-field min-h-[150px]" value={cfg.legal[page].paragraphs.join("\n")} onChange={(e) => setLegal(page, "paragraphs", e.target.value.split("\n").filter(Boolean))} /></Row>
          </div>)}
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
