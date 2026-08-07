import { read, write, remove, STORAGE_KEYS as KEYS } from "./storage";
import { getVendorById, saveVendor } from "./businessRepository";
import { DEFAULT_PLAN_MATRIX, PLAN_TIERS, getPlanConfig, getPlanMatrix, normalizePlan, resetPlanMatrix, savePlanMatrix } from "./modelDefaults";

export const PLAN_STORAGE_KEY = KEYS.planMatrix;
export const LANDING_STORAGE_KEY = KEYS.landing;
export const PERSONA_STORAGE_KEY = KEYS.personaMatrix;
export const DEFAULT_LANDING_CONFIG = {
  brand: { name: "Vyapar360", logoUrl: "" },
  navigation: {
    items: [
      { id: "features", label: "Features", href: "/#features", visible: true },
      { id: "pricing", label: "Pricing", href: "/#pricing", visible: true },
      { id: "business-types", label: "Business Types", href: "/#business-types", visible: true },
    ],
    loginLabel: "Business login", loginTo: "/login",
    ctaLabel: "Start free", ctaTo: "/register",
  },
  hero: {
    eyebrow: "Now live for Restaurants & Salons in India",
    headlineLine1: "Your neighbourhood",
    headlineLine2: "business, ",
    headlineHighlight: "beautifully ",
    headlineLine3: "online.",
    subtitle:
      "Vyapar360 gives local businesses a ready-to-use digital storefront in minutes. No websites. No developers. No commission. Just orders and bookings.",
    ctaPrimary: "Launch your store — free",
    ctaPrimaryTo: "/register",
    ctaSecondary: "See pricing",
    ctaSecondaryTo: "#pricing",
    perks: ["Free forever plan", "0% commission on orders", "Setup in under 10 minutes"],
    socialProof: "200+ stores onboarded",
  },
  stats: [
    { value: "10 min", label: "Average setup time" },
    { value: "0%", label: "Commission on orders" },
    { value: "24/7", label: "Storefront uptime" },
    { value: "∞", label: "Products & services" },
  ],
  pricing: {
    eyebrow: "Simple pricing",
    title: "Start free. Grow when you're ready.",
    subtitle:
      "No commission on orders. No lock-in. Cancel anytime. Pick the plan that matches your business today — upgrade when you outgrow it.",
    currencySymbol: "₹",
    showBillingToggle: true,
    defaultBilling: "monthly", // "monthly" | "annual"
    monthlyLabel: "Monthly",
    annualLabel: "Annual",
    annualBadge: "Save up to 20%",
    annualNote: "Billed yearly · Cancel anytime",
    monthlyNote: "Billed monthly · Cancel anytime",
    footerNotes: [
      { icon: "credit-card", text: "UPI · Cards · Netbanking" },
      { icon: "message-circle", text: "WhatsApp support" },
      { icon: "globe", text: "Made in India, for India" },
    ],
  },
  plans: [
    {
      id: "free",
      name: "Starter",
      monthlyPrice: 0,
      annualPrice: 0, // per-month price when billed annually
      priceSuffix: "forever",
      tagline: "Test the waters, no strings.",
      badge: "",
      icon: "sparkles",
      ctaLabel: "Start free",
      features: [
        { text: "1 storefront", included: true },
        { text: "Up to 20 menu items or services", included: true },
        { text: "Unlimited orders & bookings", included: true },
        { text: "Basic dashboard & catalogue", included: true },
        { text: "Vyapar360 branding footer", included: true },
        { text: "Business insights (30 days)", included: false },
        { text: "WhatsApp order notifications", included: false },
        { text: "Payment gateway (Stripe / UPI)", included: false },
        { text: "Custom domain", included: false },
        { text: "Priority support", included: false },
      ],
    },
    {
      id: "growth",
      name: "Growth",
      monthlyPrice: 499,
      annualPrice: 415, // per-month price when billed annually (~17% off)
      priceSuffix: "/month",
      tagline: "For businesses ready to scale.",
      badge: "Most popular",
      icon: "zap",
      ctaLabel: "Start 14-day trial",
      features: [
        { text: "1 storefront", included: true },
        { text: "Unlimited menu items / services", included: true },
        { text: "Unlimited orders & bookings", included: true },
        { text: "Advanced dashboard & insights", included: true },
        { text: "Remove Vyapar360 branding", included: true },
        { text: "Business insights (1 year)", included: true },
        { text: "WhatsApp order notifications", included: true },
        { text: "Payment gateway (Stripe / UPI)", included: true },
        { text: "Custom domain", included: false },
        { text: "Priority support", included: false },
      ],
    },
    {
      id: "pro",
      name: "Pro",
      monthlyPrice: 999,
      annualPrice: 799, // ~20% off
      priceSuffix: "/month",
      tagline: "For multi-outlet brands & franchises.",
      badge: "Best value",
      icon: "crown",
      ctaLabel: "Go pro",
      features: [
        { text: "Up to 5 storefronts", included: true },
        { text: "Unlimited menu items / services", included: true },
        { text: "Unlimited orders & bookings", included: true },
        { text: "Advanced dashboard & insights", included: true },
        { text: "Remove Vyapar360 branding", included: true },
        { text: "Business insights (unlimited)", included: true },
        { text: "WhatsApp order notifications", included: true },
        { text: "Payment gateway (Stripe / UPI)", included: true },
        { text: "Custom domain per storefront", included: true },
        { text: "Priority support (WhatsApp)", included: true },
      ],
    },
  ],
  faqs: [
    { q: "Is the Starter plan really free forever?", a: "Yes. No trial, no credit card. Upgrade to Growth or Pro only if and when you need more storefronts, notifications, or payments." },
    { q: "Do you charge commission on orders?", a: "Never. Whatever your customer pays, you keep — minus your payment gateway's own fees (Stripe/Razorpay/UPI). Zero platform commission." },
    { q: "Can I switch plans anytime?", a: "Absolutely — upgrade, downgrade, or cancel from your dashboard in one click. No lock-in contracts." },
    { q: "What if my business type isn't supported yet?", a: "We're adding a new business type every month. Restaurant and Salon are live today; Gym, Pharmacy, Grocery, Bakery, Boutique, Spa, and Clinic are next. Sign up and vote for what you need." },
  ],
};

export function getLandingConfig() {
  const saved = read(KEYS.landing, null);
  if (!saved) return DEFAULT_LANDING_CONFIG;
  // Merge additive schema changes (hero, pricing) and back-fill legacy plans
  // that only had `price` -> upgrade to monthlyPrice/annualPrice.
  const mergedPricing = { ...DEFAULT_LANDING_CONFIG.pricing, ...(saved.pricing || {}) };
  const savedPlans = Array.isArray(saved.plans) ? saved.plans : DEFAULT_LANDING_CONFIG.plans;
  const plans = savedPlans.map((p) => {
    const dflt =
      DEFAULT_LANDING_CONFIG.plans.find((d) => d.id === p.id) ||
      DEFAULT_LANDING_CONFIG.plans[0];
    const monthlyPrice =
      typeof p.monthlyPrice === "number"
        ? p.monthlyPrice
        : typeof p.price === "number"
          ? p.price
          : dflt.monthlyPrice;
    const annualPrice =
      typeof p.annualPrice === "number"
        ? p.annualPrice
        : typeof p.price === "number"
          ? p.price
          : dflt.annualPrice;
    return { ...dflt, ...p, monthlyPrice, annualPrice };
  });
  return {
    ...DEFAULT_LANDING_CONFIG,
    ...saved,
    hero: { ...DEFAULT_LANDING_CONFIG.hero, ...(saved.hero || {}) },
    brand: { ...DEFAULT_LANDING_CONFIG.brand, ...(saved.brand || {}) },
    navigation: {
      ...DEFAULT_LANDING_CONFIG.navigation,
      ...(saved.navigation || {}),
      items: Array.isArray(saved.navigation?.items) ? saved.navigation.items : DEFAULT_LANDING_CONFIG.navigation.items,
    },
    pricing: mergedPricing,
    plans,
  };
}
export function saveLandingConfig(cfg) {
  write(KEYS.landing, cfg);
  return cfg;
}
export function resetLandingConfig() {
  localStorage.removeItem(KEYS.landing);
  return DEFAULT_LANDING_CONFIG;
}
export function updateVendorFeatures(vendorId, patch) {
  const v = getVendorById(vendorId);
  if (!v) return null;
  const features = { ...v.features, ...patch };
  saveVendor({ ...v, features });
  return features;
}
export function updateVendorPlan(vendorId, plan) {
  const v = getVendorById(vendorId);
  if (!v) return null;
  const normalized = normalizePlan(plan);
  const cfg = getPlanConfig(normalized);
  const features = {
    multiStore: cfg.multiStore,
    employees: cfg.employees,
  };
  saveVendor({ ...v, plan: normalized, features });
  return { plan: normalized, features };
}
export const PERSONAS = ["owner", "manager", "employee", "customer", "admin"];

export const FEATURE_CATALOG = [
  { id: "overview",         label: "Dashboard overview" },
  { id: "orders",           label: "Orders board" },
  { id: "bookings",         label: "Bookings board" },
  { id: "catalogue",        label: "Catalogue editor" },
  { id: "pos",              label: "POS (walk-in orders)" },
  { id: "insights",         label: "Business insights" },
  { id: "team",             label: "Team management" },
  { id: "storefronts",      label: "Storefronts management" },
  { id: "settings",         label: "Store settings" },
  { id: "profile",          label: "My profile" },
  { id: "customer_profile", label: "Customer profile" },
  { id: "chat_support",     label: "Chat support widget" },
];

export const DEFAULT_PERSONA_MATRIX = {
  overview:         ["owner"],
  orders:           ["owner", "manager", "employee"],
  bookings:         ["owner", "manager", "employee"],
  catalogue:        ["owner", "manager"],
  pos:              ["owner", "manager", "employee"],
  insights:         ["owner", "manager"],
  team:             ["owner"],
  storefronts:      ["owner"],
  settings:         ["owner"],
  profile:          ["owner", "manager", "employee"],
  customer_profile: ["customer"],
  chat_support:     ["customer"],
};

export function getPersonaMatrix() {
  const saved = read(KEYS.personaMatrix, null);
  if (!saved) return DEFAULT_PERSONA_MATRIX;
  return { ...DEFAULT_PERSONA_MATRIX, ...saved };
}
export function savePersonaMatrix(m) {
  write(KEYS.personaMatrix, m);
  return m;
}
export function resetPersonaMatrix() {
  localStorage.removeItem(KEYS.personaMatrix);
  return DEFAULT_PERSONA_MATRIX;
}
export function isFeatureVisibleForPersona(featureId, persona) {
  const m = getPersonaMatrix();
  return (m[featureId] || []).includes(persona);
}
export { DEFAULT_PLAN_MATRIX, PLAN_TIERS, getPlanConfig, getPlanMatrix, resetPlanMatrix, savePlanMatrix };
