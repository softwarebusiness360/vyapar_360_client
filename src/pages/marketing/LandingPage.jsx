import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShoppingBag,
  CalendarCheck,
  BarChart3,
  Palette,
  Smartphone,
  ShieldCheck,
  Sparkles,
  Utensils,
  Scissors,
  Dumbbell,
  Pill,
  ShoppingCart,
  Cookie,
  Shirt,
  Flower2,
  Stethoscope,
  Check,
  X,
  Zap,
  Crown,
  Rocket,
  Star,
  MessageCircle,
  CreditCard,
  Globe,
  MousePointerClick,
  Upload,
  Send,
  PartyPopper,
  GraduationCap,
  Building2,
} from "lucide-react";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import AiInsightsSection from "../../components/marketing/AiInsightsSection";
import { Container, Section } from "../../components/Container";
import { getLandingConfig, seedIfNeeded } from "../../lib/store";

const PLAN_ICONS = { sparkles: Sparkles, zap: Zap, crown: Crown };
const FOOTER_NOTE_ICONS = {
  "credit-card": CreditCard,
  "message-circle": MessageCircle,
  globe: Globe,
};

const featureList = [
  {
    icon: ShoppingBag,
    title: "Beautiful storefront",
    body: "A polished, mobile-first store at /store/your-brand — ready in minutes.",
  },
  {
    icon: CalendarCheck,
    title: "Orders & bookings",
    body: "Take food orders or appointment bookings from one clean dashboard.",
  },
  {
    icon: BarChart3,
    title: "Real insights",
    body: "Track revenue, top items, and customer trends without a spreadsheet.",
  },
  {
    icon: Palette,
    title: "Your branding",
    body: "Custom logo, cover imagery, tagline, and colour accents per business.",
  },
  {
    icon: Smartphone,
    title: "Mobile-first design",
    body: "Pixel-perfect on every screen — from a 5-inch phone to a 27-inch monitor.",
  },
  {
    icon: ShieldCheck,
    title: "Ready to scale",
    body: "Architected so LocalStorage swaps to real APIs, payments & WhatsApp later.",
  },
];

const businessTypes = [
  { icon: Utensils, name: "Restaurants", available: true },
  { icon: Scissors, name: "Salons", available: true },
  { icon: Dumbbell, name: "Gyms", available: false },
  { icon: Pill, name: "Pharmacies", available: false },
  { icon: ShoppingCart, name: "Grocery", available: false },
  { icon: Cookie, name: "Bakeries", available: false },
  { icon: Shirt, name: "Boutiques", available: false },
  { icon: Flower2, name: "Spas", available: false },
  { icon: Stethoscope, name: "Clinics", available: false },
  // Education & Training Management
  // Supports music academies, dance schools, tuition centers, coaching institutes,
  // sports academies, coding bootcamps, yoga classes, language institutes, art schools, etc.
  // Vendors: Academy Owner, Principal, Teachers, Staff
  // Customers: Students & Parents
  // Core features: Courses, Batches, Timetable, Attendance, Enrollments,
  // Fee Management, Progress Reports, Homework, Notifications.
  { icon: GraduationCap, name: "Academies & Classes", available: false },

  // Rental & Property Management
  // Supports apartment buildings, PGs, hostels, commercial properties,
  // offices, societies, and rental businesses.
  // Vendors: Property Owner, Manager, Employees
  // Customers: Tenants
  // Core features: Property & Unit Management, Tenant Onboarding,
  // Rent Collection, Maintenance Requests, Visitor Management,
  // Notices, Documents, Meter Readings, Expense Tracking.
  { icon: Building2, name: "Rental & Property", available: false },
];

const testimonials = [
  {
    quote:
      "Set up Pizza Hub's online menu in under 20 minutes. Orders started coming the same evening.",
    author: "Rohan M.",
    role: "Owner, Pizza Hub",
  },
  {
    quote:
      "Bookings finally live where our customers already are — on their phones. Cancellations dropped 40%.",
    author: "Nisha K.",
    role: "Founder, Style Salon",
  },
  {
    quote:
      "This is what my brother's bakery has been missing. Clean, modern, no coding.",
    author: "Aditya S.",
    role: "Early user",
  },
];

const howItWorks = [
  {
    icon: MousePointerClick,
    title: "Sign up in 30 seconds",
    body: "One email, one password — no credit card, no waiting list.",
    step: "01",
  },
  {
    icon: Upload,
    title: "Add your menu or services",
    body: "Upload items with photos, prices, and categories in a few clicks.",
    step: "02",
  },
  {
    icon: Send,
    title: "Share your storefront link",
    body: "Send /store/your-brand on WhatsApp, Instagram, or print on flyers.",
    step: "03",
  },
  {
    icon: PartyPopper,
    title: "Take orders & bookings",
    body: "Watch the dashboard light up. Manage everything from your phone.",
    step: "04",
  },
];

export default function LandingPage() {
  const [cfg, setCfg] = useState(() => {
    if (typeof window === "undefined") return null;
    seedIfNeeded();
    return getLandingConfig();
  });

  useEffect(() => {
    // Refresh on focus (so CMS edits show up when the tab regains focus)
    const onFocus = () => setCfg(getLandingConfig());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  if (!cfg) return null;
  const { hero, stats, plans, faqs, pricing } = cfg;
  const [billing, setBilling] = useState(pricing?.defaultBilling === "annual" ? "annual" : "monthly");
  const currency = pricing?.currencySymbol || "₹";
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      {/* HERO */}
      <section className="relative overflow-hidden grain">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 right-1/4 h-[520px] w-[520px] rounded-full bg-brand/20 blur-[140px]" />
          <div className="absolute top-40 -left-32 h-[520px] w-[520px] rounded-full bg-restaurant/12 blur-[160px]" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-[120px]" />
        </div>
        <Container className="pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-ink-secondary"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                {hero.eyebrow}
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="mt-6 font-display font-semibold text-4xl sm:text-5xl lg:text-[64px] tracking-tighter leading-[1.02]"
                data-testid="hero-title"
              >
                {hero.headlineLine1}
                <br />
                {hero.headlineLine2}
                <span className="bg-gradient-to-r from-brand via-fuchsia-400 to-restaurant bg-clip-text text-transparent">
                  {hero.headlineHighlight}
                </span>
                <br />
                {hero.headlineLine3}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-6 text-lg sm:text-xl text-ink-secondary max-w-xl leading-relaxed"
              >
                {hero.subtitle}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
              >
                <Link
                  to="/register"
                  className="btn-primary inline-flex items-center justify-center gap-2 text-base !py-3.5 !px-6"
                  data-testid="hero-cta-register"
                >
                  {hero.ctaPrimary}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#pricing"
                  className="btn-ghost inline-flex items-center justify-center gap-2 text-base !py-3.5 !px-6"
                  data-testid="hero-cta-pricing"
                >
                  {hero.ctaSecondary}
                </a>
              </motion.div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-ink-muted">
                {(hero.perks || []).map((p) => (
                  <span key={p} className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-success" /> {p}
                  </span>
                ))}
              </div>

              {/* Social proof strip */}
              <div className="mt-10 pt-6 border-t border-line">
                <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-3">
                  Trusted by local businesses across India
                </div>
                <div className="flex items-center gap-6 text-ink-muted text-sm">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <span className="hidden sm:inline">
                    4.9 · Early access rating
                  </span>
                  <span className="text-ink-muted/60">·</span>
                  <span>{hero.socialProof}</span>
                </div>
              </div>
            </div>

            {/* Hero visual: mock dashboard preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand/30 via-fuchsia-500/10 to-restaurant/20 blur-2xl" />
                <div className="relative card-surface p-4 rounded-2xl">
                  <div className="flex items-center gap-2 pb-3 border-b border-line">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                    <span className="ml-3 text-xs text-ink-muted font-mono">
                      vyapar360.app/dashboard
                    </span>
                  </div>
                  <div className="pt-4 grid grid-cols-3 gap-3">
                    {[
                      {
                        label: "Revenue",
                        value: "₹48,290",
                        accent: "text-brand",
                      },
                      {
                        label: "Orders",
                        value: "127",
                        accent: "text-restaurant",
                      },
                      { label: "Bookings", value: "42", accent: "text-salon" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="rounded-xl bg-bg-elevated border border-line p-3"
                      >
                        <div className="text-[10px] uppercase tracking-widest text-ink-muted">
                          {s.label}
                        </div>
                        <div
                          className={`mt-1 font-display font-semibold text-lg ${s.accent}`}
                        >
                          {s.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-xl bg-bg-elevated border border-line p-4">
                    <div className="text-xs text-ink-muted mb-3">
                      Weekly revenue
                    </div>
                    <div className="flex items-end gap-1.5 h-24">
                      {[35, 55, 40, 70, 60, 90, 75].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-brand/40 to-brand"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {[
                      {
                        code: "PH-1042",
                        name: "Margherita ×2",
                        status: "Preparing",
                        tone: "bg-blue-500/10 text-blue-300",
                      },
                      {
                        code: "SS-208",
                        name: "Signature Haircut",
                        status: "Confirmed",
                        tone: "bg-emerald-500/10 text-emerald-300",
                      },
                    ].map((o) => (
                      <div
                        key={o.code}
                        className="flex items-center justify-between rounded-lg bg-bg-elevated border border-line px-3 py-2.5"
                      >
                        <div>
                          <div className="text-xs text-ink-muted">{o.code}</div>
                          <div className="text-sm text-ink-primary">
                            {o.name}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full ${o.tone}`}
                        >
                          {o.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* STATS BAND */}
      <section className="border-y border-line bg-bg-surface/40">
        <Container className="py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="text-center md:text-left"
                data-testid={`stat-${i}`}
              >
                <div className="font-display text-3xl sm:text-4xl font-semibold tracking-tighter bg-gradient-to-br from-white to-ink-secondary bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="mt-1.5 text-xs uppercase tracking-widest text-ink-muted">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* HOW IT WORKS */}
      <Section id="how-it-works">
        <Container>
          <div className="max-w-2xl">
            <span className="text-sm uppercase tracking-widest text-brand">
              How it works
            </span>
            <h2
              className="mt-3 text-3xl sm:text-4xl font-display font-medium tracking-tight"
              data-testid="how-title"
            >
              From zero to selling in four steps.
            </h2>
            <p className="mt-4 text-ink-secondary">
              You don't need a website, a designer, or a developer. Just a phone
              and a coffee.
            </p>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {howItWorks.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="relative card-surface p-6 card-hover"
                data-testid={`how-step-${i}`}
              >
                <div className="absolute top-4 right-5 font-display text-4xl font-semibold text-white/5 tracking-tighter select-none">
                  {s.step}
                </div>
                <div className="h-10 w-10 rounded-lg bg-brand-soft border border-brand/30 grid place-items-center">
                  <s.icon className="h-5 w-5 text-brand" />
                </div>
                <h3 className="mt-4 font-display text-lg font-medium">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm text-ink-secondary leading-relaxed">
                  {s.body}
                </p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* FEATURES */}
      <Section id="features" className="border-t border-line">
        <Container>
          <div className="max-w-2xl">
            <span className="text-sm uppercase tracking-widest text-brand">
              Everything included
            </span>
            <h2
              className="mt-3 text-3xl sm:text-4xl font-display font-medium tracking-tight"
              data-testid="features-title"
            >
              A polished storefront and the tools to run it.
            </h2>
            <p className="mt-4 text-ink-secondary">
              No plugins, no themes, no code. Every business gets a premium
              storefront and a dashboard designed for real operators.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featureList.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="card-surface p-6 card-hover"
                data-testid={`feature-card-${i}`}
              >
                <div className="h-10 w-10 rounded-lg bg-brand-soft border border-brand/30 grid place-items-center">
                  <f.icon className="h-5 w-5 text-brand" />
                </div>
                <h3 className="mt-4 font-display text-lg font-medium">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm text-ink-secondary leading-relaxed">
                  {f.body}
                </p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* AI DRIVEN INSIGHTS */}
      <AiInsightsSection />

      {/* PRICING */}
      <Section id="pricing" className="border-t border-line">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-sm uppercase tracking-widest text-brand">
              {pricing.eyebrow}
            </span>
            <h2
              className="mt-3 text-4xl sm:text-5xl font-display font-medium tracking-tighter"
              data-testid="pricing-title"
            >
              {pricing.title}
            </h2>
            <p className="mt-4 text-ink-secondary whitespace-pre-line">
              {pricing.subtitle}
            </p>
          </div>

          {/* Billing toggle */}
          {pricing.showBillingToggle && (
            <div className="mt-10 flex items-center justify-center">
              <div
                role="tablist"
                aria-label="Billing period"
                className="relative inline-flex items-center gap-1 rounded-full border border-line bg-bg-elevated p-1 shadow-inner"
                data-testid="pricing-billing-toggle"
              >
                <button
                  role="tab"
                  aria-selected={billing === "monthly"}
                  onClick={() => setBilling("monthly")}
                  data-testid="pricing-billing-monthly"
                  className={`relative z-10 px-5 py-2 text-sm rounded-full transition-colors ${
                    billing === "monthly"
                      ? "bg-white text-bg-base font-medium shadow-sm"
                      : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  {pricing.monthlyLabel}
                </button>
                <button
                  role="tab"
                  aria-selected={billing === "annual"}
                  onClick={() => setBilling("annual")}
                  data-testid="pricing-billing-annual"
                  className={`relative z-10 px-5 py-2 text-sm rounded-full transition-colors inline-flex items-center gap-2 ${
                    billing === "annual"
                      ? "bg-white text-bg-base font-medium shadow-sm"
                      : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  {pricing.annualLabel}
                  {pricing.annualBadge && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-widest rounded-full ${
                        billing === "annual"
                          ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/40"
                          : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {pricing.annualBadge}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="mt-12 grid md:grid-cols-3 gap-4 lg:gap-6">
            {plans.map((plan, i) => {
              const IconEl = PLAN_ICONS[plan.icon] || Sparkles;
              const highlight = plan.id === "growth";
              const accent =
                plan.id === "growth"
                  ? "border-brand ring-1 ring-brand/40"
                  : plan.id === "pro"
                    ? "border-fuchsia-500/40"
                    : "border-line";

              const monthly = Number(plan.monthlyPrice ?? plan.price ?? 0);
              const annual = Number(plan.annualPrice ?? plan.price ?? 0);
              const isFree = monthly === 0 && annual === 0;
              const displayPrice = billing === "annual" ? annual : monthly;
              const savePct =
                monthly > 0 && annual > 0 && annual < monthly
                  ? Math.round(((monthly - annual) / monthly) * 100)
                  : 0;
              const annualTotal = annual * 12;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className={`relative card-surface p-7 flex flex-col ${accent} ${highlight ? "md:-mt-4 md:mb-4 md:scale-[1.02] shadow-glow" : ""}`}
                  data-testid={`pricing-plan-${plan.id}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-widest ${
                          highlight
                            ? "bg-gradient-to-r from-brand to-fuchsia-500 text-white shadow-glow"
                            : "bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/40"
                        }`}
                      >
                        {highlight && <Sparkles className="h-3 w-3" />}
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div
                      className={`h-11 w-11 rounded-xl grid place-items-center ${
                        plan.id === "free"
                          ? "bg-white/5 border border-line"
                          : plan.id === "growth"
                            ? "bg-brand-soft border border-brand/40"
                            : "bg-fuchsia-500/10 border border-fuchsia-500/40"
                      }`}
                    >
                      <IconEl
                        className={`h-5 w-5 ${
                          plan.id === "free"
                            ? "text-ink-secondary"
                            : plan.id === "growth"
                              ? "text-brand"
                              : "text-fuchsia-300"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="font-display text-xl font-medium">
                        {plan.name}
                      </div>
                      <div className="text-xs text-ink-muted">
                        {plan.tagline}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-baseline gap-1.5">
                    <span className="text-ink-muted text-xl">{currency}</span>
                    <span
                      className="font-display text-5xl font-semibold tracking-tighter tabular-nums"
                      data-testid={`pricing-price-${plan.id}`}
                    >
                      {displayPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-ink-muted text-sm ml-1">
                      {plan.priceSuffix}
                    </span>
                  </div>

                  {isFree ? (
                    <div className="mt-1 text-[11px] text-ink-muted">
                      No credit card required
                    </div>
                  ) : billing === "annual" ? (
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-muted">
                      <span data-testid={`pricing-annual-total-${plan.id}`}>
                        {currency}
                        {annualTotal.toLocaleString("en-IN")} billed yearly
                      </span>
                      {savePct > 0 && (
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                          data-testid={`pricing-save-${plan.id}`}
                        >
                          Save {savePct}%
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1 text-[11px] text-ink-muted">
                      {pricing.monthlyNote}
                    </div>
                  )}

                  <Link
                    to="/register"
                    className={`mt-6 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                      highlight
                        ? "bg-gradient-to-r from-brand to-fuchsia-500 text-white hover:opacity-95 hover:-translate-y-0.5"
                        : plan.id === "pro"
                          ? "border border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-100 hover:bg-fuchsia-500/20"
                          : "border border-line bg-bg-elevated hover:border-white/20 text-ink-primary"
                    }`}
                    data-testid={`pricing-cta-${plan.id}`}
                  >
                    {plan.ctaLabel} <ArrowRight className="h-4 w-4" />
                  </Link>

                  <ul className="mt-8 space-y-3 pt-6 border-t border-line">
                    {plan.features.map((f, idx) => (
                      <li
                        key={idx}
                        className={`flex items-start gap-2.5 text-sm ${f.included ? "text-ink-primary" : "text-ink-muted line-through decoration-ink-muted/40"}`}
                      >
                        {f.included ? (
                          <span className="mt-0.5 h-4 w-4 rounded-full bg-success/15 border border-success/40 grid place-items-center flex-shrink-0">
                            <Check
                              className="h-2.5 w-2.5 text-success"
                              strokeWidth={3}
                            />
                          </span>
                        ) : (
                          <span className="mt-0.5 h-4 w-4 rounded-full bg-white/5 border border-line grid place-items-center flex-shrink-0">
                            <X className="h-2.5 w-2.5 text-ink-muted" />
                          </span>
                        )}
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-ink-muted">
            {(pricing.footerNotes || []).map((n, i) => {
              const NoteIcon = FOOTER_NOTE_ICONS[n.icon] || CreditCard;
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5"
                  data-testid={`pricing-footer-note-${i}`}
                >
                  <NoteIcon className="h-3.5 w-3.5" /> {n.text}
                </span>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* BUSINESS TYPES */}
      <Section id="business-types" className="border-t border-line">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="max-w-2xl">
              <span className="text-sm uppercase tracking-widest text-brand">
                Built to expand
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-display font-medium tracking-tight">
                Two live today. Nine on the roadmap.
              </h2>
            </div>
            <p className="text-sm text-ink-secondary max-w-md">
              Start with Restaurants and Salons. New business types roll out
              every month — your dashboard adapts automatically.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {businessTypes.map((b) => (
              <div
                key={b.name}
                className="relative card-surface p-5 flex flex-col items-start gap-3 card-hover"
                data-testid={`business-type-${b.name.toLowerCase()}`}
              >
                <b.icon
                  className={`h-6 w-6 ${b.available ? "text-brand" : "text-ink-muted"}`}
                />
                <div>
                  <div className="font-medium text-ink-primary">{b.name}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-widest text-ink-muted">
                    {b.available ? "Available" : "Coming soon"}
                  </div>
                </div>
                {b.available && (
                  <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-success shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                )}
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* TESTIMONIALS */}
      <Section className="border-t border-line">
        <Container>
          <span className="text-sm uppercase tracking-widest text-brand">
            Loved by operators
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-display font-medium tracking-tight max-w-2xl">
            Real stores. Real orders. Real bookings.
          </h2>
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="card-surface p-6"
                data-testid={`testimonial-${i}`}
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-ink-primary leading-relaxed">"{t.quote}"</p>
                <div className="mt-6 pt-4 border-t border-line">
                  <div className="font-medium text-sm">{t.author}</div>
                  <div className="text-xs text-ink-muted">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="border-t border-line">
        <Container>
          <div className="grid lg:grid-cols-3 gap-10">
            <div>
              <span className="text-sm uppercase tracking-widest text-brand">
                FAQ
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-display font-medium tracking-tight">
                Quick answers.
              </h2>
              <p className="mt-4 text-ink-secondary">
                Have a specific question? Reach out on WhatsApp — we typically
                reply in under an hour during business days.
              </p>
            </div>
            <div className="lg:col-span-2 space-y-3">
              {faqs.map((f, i) => (
                <details
                  key={i}
                  className="group card-surface p-5"
                  data-testid={`faq-${i}`}
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="font-display text-base font-medium pr-4">
                      {f.q}
                    </span>
                    <span className="h-7 w-7 rounded-full border border-line bg-bg-elevated grid place-items-center text-ink-secondary group-open:rotate-45 transition-transform">
                      <span className="text-lg leading-none">+</span>
                    </span>
                  </summary>
                  <p className="mt-3 text-ink-secondary text-sm leading-relaxed">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section className="border-t border-line">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-bg-surface to-bg-elevated p-10 sm:p-16 grain">
            <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-restaurant/10 blur-3xl" />
            <div className="relative max-w-2xl">
              <Rocket className="h-8 w-8 text-brand" />
              <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-display font-medium tracking-tighter">
                Your storefront is 10 minutes away.
              </h2>
              <p className="mt-4 text-ink-secondary text-lg">
                Register, complete a quick onboarding, upload a few items — and
                share your store link with customers today.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/register"
                  className="btn-primary inline-flex items-center justify-center gap-2 !py-3.5 !px-6"
                  data-testid="cta-register"
                >
                  Create free account <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/discover"
                  className="btn-ghost inline-flex items-center justify-center gap-2 !py-3.5 !px-6"
                  data-testid="cta-discover"
                >
                  See demo stores
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <PublicFooter />
    </div>
  );
}
