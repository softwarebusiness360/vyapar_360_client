import { read, write, remove, STORAGE_KEYS as KEYS } from "./storage";
import { getVendorById, saveVendor } from "./businessRepository";
import { DEFAULT_PLAN_MATRIX, PLAN_TIERS, getPlanConfig, getPlanMatrix, normalizePlan, resetPlanMatrix, savePlanMatrix } from "./modelDefaults";
import { APP_CONFIG, withBrand } from "@/config/appConfig";

export const PLAN_STORAGE_KEY = KEYS.planMatrix;
export const LANDING_STORAGE_KEY = KEYS.landing;
export const PERSONA_STORAGE_KEY = KEYS.personaMatrix;
export const DEFAULT_LANDING_CONFIG = {
  contentVersion: 6,
  brand: { name: APP_CONFIG.brandName, logoUrl: "" },
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
    eyebrow: "Now live for restaurants & cafés",
    headlineLine1: "Your business,",
    headlineLine2: "",
    headlineHighlight: "beautifully ",
    headlineLine3: "online.",
    subtitle:
      withBrand("Create your digital storefront, share your QR or link, and start taking direct orders — with zero {brand} commission."),
    ctaPrimary: "Start free",
    ctaPrimaryTo: "/register",
    ctaSecondary: "See how it works",
    ctaSecondaryTo: "#how-it-works",
    perks: ["Start free", withBrand("0% {brand} commission"), "Setup in under 10 minutes"],
    flowSteps: ["Add your menu", "Share QR/link", "Receive orders"],
    socialProof: "200+ stores onboarded",
  },
  stats: [
    { value: "10 min", label: "Average setup" },
    { value: "0%", label: withBrand("{brand} commission") },
    { value: "Unlimited", label: "Orders" },
    { value: "24/7", label: "Digital storefront" },
  ],
  howItWorks: {
    eyebrow: "How it works",
    title: "Start taking orders in four simple steps.",
    subtitle: "No website, no developer, no technical setup.",
    steps: [
      { icon: "create", title: "Set up your business", body: "Add your business name and basic details." },
      { icon: "menu", title: "Add your menu", body: "Add items, prices and photos." },
      { icon: "share", title: "Share your QR or link", body: "Share it on WhatsApp, Instagram, Google, or as a printed QR." },
      { icon: "orders", title: "Receive direct orders", body: "See and manage new orders from your dashboard." },
    ],
  },
  features: {
    eyebrow: "Everything included",
    title: "Everything you need to take your business online.",
    subtitle: "Manage your menu, orders and customers from one simple dashboard.",
    cards: [
      { icon: "storefront", title: "Your own branded page", body: "Share your menu, logo and business details with customers." },
      { icon: "menu", title: "Keep your menu up to date", body: "Add items, prices, photos and availability anytime." },
      { icon: "direct", title: "Take direct orders", body: "Customers order directly from your QR or link." },
      { icon: "orders", title: "Manage every order", body: "Track new, preparing, ready and completed orders." },
      { icon: "customers", title: "Keep customer details", body: "Keep the customer name with each order." },
      { icon: "sales", title: "See today’s sales", body: "View your orders and revenue at a glance." },
    ],
  },
  businessTypes: {
    eyebrow: "Built to expand",
    title: "Built for local businesses. Starting with restaurants & cafés.",
    subtitle: "More business types will be added as the platform grows.",
    availableLabel: "Available now",
    comingLabel: "Coming later",
    available: [
      { id: "restaurants", name: "Restaurants", icon: "restaurant", visible: true },
      { id: "cafes", name: "Cafés", icon: "cafe", visible: true },
    ],
    coming: [
      { id: "salons", name: "Salons", icon: "salon", visible: true },
      { id: "bakeries", name: "Bakeries", icon: "bakery", visible: true },
      { id: "gyms", name: "Gyms", icon: "gym", visible: true },
      { id: "clinics", name: "Clinics", icon: "clinic", visible: true },
      { id: "academies", name: "Academies", icon: "academy", visible: true },
      { id: "boutiques", name: "Boutiques", icon: "boutique", visible: true },
      { id: "spas", name: "Spas", icon: "spa", visible: true },
      { id: "grocery", name: "Grocery", icon: "grocery", visible: true },
      { id: "rental-property", name: "Rental & Property", icon: "property", visible: true },
    ],
  },
  pricing: {
    eyebrow: "Simple pricing",
    title: "Start free. Grow when you're ready.",
    subtitle:
      "No commission on orders. No lock-in. Cancel anytime. Pick the plan that matches your business today — upgrade when you outgrow it.",
    currencySymbol: "₹",
    showBillingToggle: false,
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
      tagline: "Everything you need to get started.",
      badge: "",
      icon: "sparkles",
      ctaLabel: "Start free",
      features: [
        { text: "1 storefront", included: true, visible: true },
        { text: "Up to 20 menu items", included: true, visible: true },
        { text: "Unlimited orders", included: true, visible: true },
        { text: "Basic dashboard", included: true, visible: true },
        { text: "Vyapar360 branding", included: true, visible: true },
        { text: "Bookings", included: false, visible: false },
        { text: "Business insights (30 days)", included: false, visible: false },
        { text: "WhatsApp order notifications", included: false, visible: false },
        { text: "Payment gateway (Stripe / UPI)", included: false, visible: false },
        { text: "Custom domain", included: false, visible: false },
        { text: "Priority support", included: false, visible: false },
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
        { text: "1 storefront", included: true, visible: true },
        { text: "Unlimited menu items", included: true, visible: true },
        { text: "Unlimited orders", included: true, visible: true },
        { text: "Customer details", included: true, visible: true },
        { text: "Sales dashboard", included: true, visible: true },
        { text: "Remove Vyapar360 branding", included: true, visible: true },
        { text: "Bookings", included: false, visible: false },
        { text: "Business insights (1 year)", included: false, visible: false },
        { text: "WhatsApp order notifications", included: false, visible: false },
        { text: "Payment gateway (Stripe / UPI)", included: false, visible: false },
        { text: "Custom domain", included: false, visible: false },
        { text: "Priority support", included: false, visible: false },
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
        { text: "Up to 5 storefronts", included: true, visible: true },
        { text: "Everything in Growth", included: true, visible: true },
        { text: "Multi-location management", included: true, visible: true },
        { text: "Priority support", included: true, visible: true },
        { text: "Bookings", included: false, visible: false },
        { text: "Advanced analytics", included: false, visible: false },
        { text: "AI business insights", included: false, visible: false },
        { text: "WhatsApp order notifications", included: false, visible: false },
        { text: "Payment gateway (Stripe / UPI)", included: false, visible: false },
        { text: "Custom domain per storefront", included: false, visible: false },
      ],
    },
  ],
  faqSection: {
    eyebrow: "FAQ",
    title: "Questions before you start?",
    subtitle: "Clear answers about getting started, direct orders and managing your menu.",
  },
  finalCta: {
    title: "Take your business online in minutes.",
    subtitle: "Create your page, add your menu, and start sharing your QR or link today.",
    primaryLabel: "Start free",
    primaryTo: "/register",
    secondaryLabel: "See demo",
    secondaryTo: "/discover",
  },
  footer: {
    description: "Take your local business online with a simple digital storefront and direct ordering.",
    links: [
      { id: "features", label: "Features", to: "/#features", visible: true },
      { id: "pricing", label: "Pricing", to: "/#pricing", visible: true },
      { id: "business-types", label: "Business Types", to: "/#business-types", visible: true },
      { id: "business-login", label: "Business login", to: "/login", visible: true },
      { id: "support", label: "Support", action: "support", visible: true },
      { id: "privacy", label: "Privacy", to: "/privacy", visible: true },
      { id: "terms", label: "Terms", to: "/terms", visible: true },
    ],
    copyrightSuffix: "Built for local businesses.",
  },
  legal: {
    privacy: {
      title: "Privacy Policy",
      paragraphs: [
        "Vyapar360 uses the business and order information provided through the platform to operate storefronts, process direct orders and provide support.",
        "Businesses are responsible for collecting only the customer information they need and for using it appropriately. We do not sell customer order information.",
        "For privacy questions or requests, use the Support option on the Vyapar360 website.",
      ],
    },
    terms: {
      title: "Terms of Use",
      paragraphs: [
        "By using Vyapar360, you agree to provide accurate business information and use the platform only for lawful business activity.",
        "Businesses remain responsible for their menus, prices, availability, customer service, orders and compliance obligations.",
        "Plan availability and features may change as the platform develops. Current plan details are shown on the pricing page.",
      ],
    },
  },
  faqs: [
    { q: "Is Vyapar360 free to start?", a: "Yes. You can create your business and start on the free plan." },
    { q: "Do you charge commission on orders?", a: "No. Vyapar360 does not take commission from your orders." },
    { q: "Do customers need to create an account?", a: "No. Customers can open your menu and place an order without signing up." },
    { q: "How do customers place an order?", a: "Share your QR code or business link. Customers open the menu, choose items and place their order directly." },
    { q: "Can I update my menu anytime?", a: "Yes. You can change items, prices, photos and availability from your dashboard." },
    { q: "What business types do you support?", a: "Restaurants and cafés are available first, with more local business types coming over time." },
  ],
};

export const APPROVED_LANDING_DESTINATIONS = Object.freeze({
  navigation: Object.freeze({ features: "/#features", pricing: "/#pricing", "business-types": "/#business-types" }),
  login: Object.freeze(["/login"]),
  register: Object.freeze(["/register"]),
  heroSecondary: Object.freeze(["#how-it-works", "#pricing", "#features", "#business-types"]),
  demo: Object.freeze(["/discover"]),
  footer: Object.freeze({
    features: "/#features", pricing: "/#pricing", "business-types": "/#business-types",
    "business-login": "/login", privacy: "/privacy", terms: "/terms",
  }),
});

function allowlisted(value, fallback, allowed) {
  return allowed.includes(value) ? value : fallback;
}

export function sanitizeLandingDestinations(cfg) {
  const source = cfg || DEFAULT_LANDING_CONFIG;
  const navigation = { ...DEFAULT_LANDING_CONFIG.navigation, ...(source.navigation || {}) };
  const hero = { ...DEFAULT_LANDING_CONFIG.hero, ...(source.hero || {}) };
  const finalCta = { ...DEFAULT_LANDING_CONFIG.finalCta, ...(source.finalCta || {}) };
  const footer = { ...DEFAULT_LANDING_CONFIG.footer, ...(source.footer || {}) };
  return {
    ...source,
    navigation: {
      ...navigation,
      loginTo: allowlisted(navigation.loginTo, DEFAULT_LANDING_CONFIG.navigation.loginTo, APPROVED_LANDING_DESTINATIONS.login),
      ctaTo: allowlisted(navigation.ctaTo, DEFAULT_LANDING_CONFIG.navigation.ctaTo, APPROVED_LANDING_DESTINATIONS.register),
      items: (navigation.items || []).map((item) => ({
        ...item,
        href: APPROVED_LANDING_DESTINATIONS.navigation[item.id] || DEFAULT_LANDING_CONFIG.navigation.items.find((candidate) => candidate.id === item.id)?.href || "/",
      })),
    },
    hero: {
      ...hero,
      ctaPrimaryTo: allowlisted(hero.ctaPrimaryTo, DEFAULT_LANDING_CONFIG.hero.ctaPrimaryTo, APPROVED_LANDING_DESTINATIONS.register),
      ctaSecondaryTo: allowlisted(hero.ctaSecondaryTo, DEFAULT_LANDING_CONFIG.hero.ctaSecondaryTo, APPROVED_LANDING_DESTINATIONS.heroSecondary),
    },
    finalCta: {
      ...finalCta,
      primaryTo: allowlisted(finalCta.primaryTo, DEFAULT_LANDING_CONFIG.finalCta.primaryTo, APPROVED_LANDING_DESTINATIONS.register),
      secondaryTo: allowlisted(finalCta.secondaryTo, DEFAULT_LANDING_CONFIG.finalCta.secondaryTo, APPROVED_LANDING_DESTINATIONS.demo),
    },
    footer: {
      ...footer,
      links: (footer.links || []).map((item) => item.action === "support" ? { ...item, to: undefined } : {
        ...item,
        to: APPROVED_LANDING_DESTINATIONS.footer[item.id] || DEFAULT_LANDING_CONFIG.footer.links.find((candidate) => candidate.id === item.id)?.to || "/",
      }),
    },
  };
}

export function getLandingConfig() {
  const saved = read(KEYS.landing, null);
  if (!saved) return DEFAULT_LANDING_CONFIG;
  const upgradeLaunchCopy = Number(saved.contentVersion || 0) < 2;
  const upgradePricingCopy = Number(saved.contentVersion || 0) < 3;
  const upgradeBusinessTypes = Number(saved.contentVersion || 0) < 4;
  const upgradeFaq = Number(saved.contentVersion || 0) < 5;
  const upgradeFinalContent = Number(saved.contentVersion || 0) < 6;
  // Merge additive schema changes (hero, pricing) and back-fill legacy plans
  // that only had `price` -> upgrade to monthlyPrice/annualPrice.
  const mergedPricing = { ...DEFAULT_LANDING_CONFIG.pricing, ...(saved.pricing || {}) };
  const savedPlans = upgradePricingCopy
    ? DEFAULT_LANDING_CONFIG.plans
    : Array.isArray(saved.plans) ? saved.plans : DEFAULT_LANDING_CONFIG.plans;
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
    return {
      ...dflt,
      ...p,
      monthlyPrice,
      annualPrice,
      features: Array.isArray(p.features)
        ? p.features.map((feature) => ({ visible: true, ...feature }))
        : dflt.features,
    };
  });
  return sanitizeLandingDestinations({
    ...DEFAULT_LANDING_CONFIG,
    ...saved,
    contentVersion: DEFAULT_LANDING_CONFIG.contentVersion,
    hero: upgradeLaunchCopy ? DEFAULT_LANDING_CONFIG.hero : { ...DEFAULT_LANDING_CONFIG.hero, ...(saved.hero || {}) },
    stats: upgradeLaunchCopy ? DEFAULT_LANDING_CONFIG.stats : (saved.stats || DEFAULT_LANDING_CONFIG.stats),
    howItWorks: {
      ...DEFAULT_LANDING_CONFIG.howItWorks,
      ...(saved.howItWorks || {}),
      steps: Array.isArray(saved.howItWorks?.steps) ? saved.howItWorks.steps : DEFAULT_LANDING_CONFIG.howItWorks.steps,
    },
    features: {
      ...DEFAULT_LANDING_CONFIG.features,
      ...(saved.features || {}),
      cards: Array.isArray(saved.features?.cards) ? saved.features.cards : DEFAULT_LANDING_CONFIG.features.cards,
    },
    businessTypes: upgradeBusinessTypes
      ? DEFAULT_LANDING_CONFIG.businessTypes
      : {
          ...DEFAULT_LANDING_CONFIG.businessTypes,
          ...(saved.businessTypes || {}),
          available: Array.isArray(saved.businessTypes?.available)
            ? saved.businessTypes.available
            : DEFAULT_LANDING_CONFIG.businessTypes.available,
          coming: Array.isArray(saved.businessTypes?.coming)
            ? saved.businessTypes.coming
            : DEFAULT_LANDING_CONFIG.businessTypes.coming,
        },
    faqSection: upgradeFaq
      ? DEFAULT_LANDING_CONFIG.faqSection
      : { ...DEFAULT_LANDING_CONFIG.faqSection, ...(saved.faqSection || {}) },
    faqs: upgradeFaq
      ? DEFAULT_LANDING_CONFIG.faqs
      : Array.isArray(saved.faqs) ? saved.faqs : DEFAULT_LANDING_CONFIG.faqs,
    finalCta: upgradeFinalContent
      ? DEFAULT_LANDING_CONFIG.finalCta
      : { ...DEFAULT_LANDING_CONFIG.finalCta, ...(saved.finalCta || {}) },
    footer: upgradeFinalContent
      ? DEFAULT_LANDING_CONFIG.footer
      : {
          ...DEFAULT_LANDING_CONFIG.footer,
          ...(saved.footer || {}),
          links: Array.isArray(saved.footer?.links) ? saved.footer.links : DEFAULT_LANDING_CONFIG.footer.links,
        },
    legal: upgradeFinalContent
      ? DEFAULT_LANDING_CONFIG.legal
      : {
          privacy: { ...DEFAULT_LANDING_CONFIG.legal.privacy, ...(saved.legal?.privacy || {}) },
          terms: { ...DEFAULT_LANDING_CONFIG.legal.terms, ...(saved.legal?.terms || {}) },
        },
    brand: { ...DEFAULT_LANDING_CONFIG.brand, ...(saved.brand || {}) },
    navigation: {
      ...DEFAULT_LANDING_CONFIG.navigation,
      ...(saved.navigation || {}),
      items: Array.isArray(saved.navigation?.items) ? saved.navigation.items : DEFAULT_LANDING_CONFIG.navigation.items,
    },
    pricing: upgradePricingCopy ? DEFAULT_LANDING_CONFIG.pricing : mergedPricing,
    plans,
  });
}
export function saveLandingConfig(cfg) {
  const safeConfig = sanitizeLandingDestinations(cfg);
  write(KEYS.landing, safeConfig);
  return safeConfig;
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
