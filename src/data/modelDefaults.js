import { uid } from "../lib/utils";
import { read, write, remove, STORAGE_KEYS as KEYS } from "./storage";
import { normalizeVendorCapabilities } from "../domain/vendorCapabilities";
import { normalizeOrderMode } from "../domain/restaurantOrders";

export const PRODUCT_STATES = [
  { id: "available",     label: "Available",     tone: "success",  canOrder: true  },
  { id: "out_of_stock",  label: "Out of stock",  tone: "warning",  canOrder: false },
  { id: "coming_soon",   label: "Coming soon",   tone: "info",     canOrder: false },
  { id: "not_available", label: "Not available", tone: "danger",   canOrder: false },
];

export function getProductStateMeta(id) {
  return PRODUCT_STATES.find((s) => s.id === id) || PRODUCT_STATES[0];
}
// Legacy `available: false` → treat as `not_available`. Otherwise fall back to `available`.
export function normalizeProductState(item) {
  if (item?.state && PRODUCT_STATES.some((s) => s.id === item.state)) return item.state;
  if (item?.available === false) return "not_available";
  return "available";
}

/* --------- Order/booking channel — walk-in (POS) vs online ---------- */
export const CHANNELS = ["online", "walk_in"];
export function normalizeChannel(c) {
  return CHANNELS.includes(c) ? c : "online";
}

/* -------------- Plan matrix (admin-configurable) ------------------- */

export const PLAN_TIERS = ["free", "growth", "pro", "enterprise"];

export const DEFAULT_PLAN_MATRIX = {
  free:       { label: "Free",       multiStore: false, employees: false, maxStores: 1,   maxEmployees: 0,   insights: "basic",     customDomain: false, prioritySupport: false, whatsappNotifs: false, removeBranding: false },
  growth:     { label: "Growth",     multiStore: false, employees: true,  maxStores: 1,   maxEmployees: 3,   insights: "advanced",  customDomain: false, prioritySupport: false, whatsappNotifs: true,  removeBranding: true  },
  pro:        { label: "Pro",        multiStore: true,  employees: true,  maxStores: 5,   maxEmployees: 15,  insights: "unlimited", customDomain: true,  prioritySupport: false, whatsappNotifs: true,  removeBranding: true  },
  enterprise: { label: "Enterprise", multiStore: true,  employees: true,  maxStores: 100, maxEmployees: 500, insights: "unlimited", customDomain: true,  prioritySupport: true,  whatsappNotifs: true,  removeBranding: true  },
};

export function getPlanMatrix() {
  const saved = read(KEYS.planMatrix, null);
  if (!saved) return DEFAULT_PLAN_MATRIX;
  // Shallow-merge each tier so newly added flags fall back to defaults
  const merged = {};
  for (const t of PLAN_TIERS) merged[t] = { ...DEFAULT_PLAN_MATRIX[t], ...(saved[t] || {}) };
  return merged;
}
export function savePlanMatrix(matrix) {
  write(KEYS.planMatrix, matrix);
  return matrix;
}
export function resetPlanMatrix() {
  localStorage.removeItem(KEYS.planMatrix);
  return DEFAULT_PLAN_MATRIX;
}
// Normalize legacy plan ids ("starter" -> "free")
export function normalizePlan(plan) {
  if (plan === "starter") return "free";
  return PLAN_TIERS.includes(plan) ? plan : "free";
}
export function getPlanConfig(plan) {
  return getPlanMatrix()[normalizePlan(plan)];
}

/* ------------------- RBAC role presets ------------------- */

// Roles: "owner" (implicit, via vendor account), "manager", "employee",
// plus platform "admin" (separate account). Managers get near-owner
// access inside a workspace but still can't manage other employees or
// the subscription.
export const ROLES = ["owner", "manager", "employee"];

export const ROLE_PRESETS = {
  manager:  { takeOrders: true, takeBookings: true, viewInsights: true,  editCatalogue: true  },
  employee: { takeOrders: true, takeBookings: true, viewInsights: false, editCatalogue: false },
};

// Back-compat alias — the standalone employee permission preset.
export const DEFAULT_EMPLOYEE_PERMISSIONS = ROLE_PRESETS.employee;

/* ------------------- Default configurable schemas ------------------- */

export const DEFAULT_CHECKOUT_FIELDS = {
  // key: { enabled, required, label, placeholder }
  name: { enabled: true, required: true, label: "Full name", placeholder: "Ananya Rao" },
  phone: { enabled: true, required: false, label: "Phone", placeholder: "+91 98xxx xxxxx" },
  address: { enabled: false, required: false, label: "Delivery address", placeholder: "House/flat, street, area, city" },
  notes: { enabled: false, required: false, label: "Notes", placeholder: "Any special request" },
};

export const DEFAULT_BOOKING_FIELDS = {
  name: { enabled: true, required: true, label: "Full name", placeholder: "Meera Iyer" },
  phone: { enabled: true, required: false, label: "Phone", placeholder: "+91 98xxx xxxxx" },
  notes: { enabled: false, required: false, label: "Notes", placeholder: "Any preference or request" },
};

export function withDefaults(vendor) {
  // Multi-storefront migration: if legacy vendor has top-level slug/name but no storefronts, wrap into storefronts[0].
  let storefronts = vendor.storefronts;
  if (!Array.isArray(storefronts) || storefronts.length === 0) {
    if (vendor.slug || vendor.name) {
      storefronts = [{
        id: vendor._legacyStorefrontId || `${vendor.id || uid("vendor")}-primary`,
        slug: vendor.slug,
        name: vendor.name,
        businessType: vendor.businessType,
        tagline: vendor.tagline || "",
        description: vendor.description || "",
        logo: vendor.logo || "",
        coverImage: vendor.coverImage || "",
        address: vendor.address || "",
        phone: vendor.phone || "",
        accent: vendor.accent || (vendor.businessType === "salon" ? "salon" : "restaurant"),
        categories: vendor.categories || [],
        items: vendor.items || [],
        services: vendor.services || [],
        checkoutFields: { ...DEFAULT_CHECKOUT_FIELDS, ...(vendor.checkoutFields || {}) },
        bookingFields: { ...DEFAULT_BOOKING_FIELDS, ...(vendor.bookingFields || {}) },
        disabled: false,
      }];
    } else {
      storefronts = [];
    }
  } else {
    storefronts = storefronts.map((s) => ({
      ...s,
      checkoutFields: { ...DEFAULT_CHECKOUT_FIELDS, ...(s.checkoutFields || {}) },
      bookingFields: { ...DEFAULT_BOOKING_FIELDS, ...(s.bookingFields || {}) },
    }));
  }
  const rawPlan = vendor.plan;
  const defaultPlan = normalizePlan(rawPlan);
  const matrix = getPlanMatrix();
  const matrixCfg = matrix[defaultPlan];
  const defaultFeatures = {
    // Feature flags derive from plan matrix but can be overridden per vendor
    // (platform admin toggles that persist on the vendor record).
    multiStore: matrixCfg.multiStore,
    employees: matrixCfg.employees,
    ...(vendor.features || {}),
  };
  return {
    ...vendor,
    storefronts,
    employees: (vendor.employees || []).map((e) => ({
      role: e.role || "employee",
      ...e,
      // Empty storefrontIds → assign to all storefronts (owner's default when
      // seeding demo employees; explicit lists still win).
      storefrontIds: (e.storefrontIds && e.storefrontIds.length > 0)
        ? e.storefrontIds
        : storefronts.map((s) => s.id),
      permissions: { ...ROLE_PRESETS[e.role || "employee"], ...(e.permissions || {}) },
    })),
    plan: defaultPlan,
    features: defaultFeatures,
    capabilities: normalizeVendorCapabilities(vendor.capabilities, vendor.businessType || storefronts[0]?.businessType),
    orderMode: normalizeVendorCapabilities(vendor.capabilities, vendor.businessType || storefronts[0]?.businessType).tableOrdering ? normalizeOrderMode(vendor.orderMode) : "counter",
    tables: Array.isArray(vendor.tables) ? vendor.tables.filter((table) => table?.id && table?.storefrontId) : [],
    planConfig: matrixCfg, // Read-only convenience — resolved limits + entitlements
    // Keep back-compat facades for old code paths (mirror storefronts[0]):
    checkoutFields: { ...DEFAULT_CHECKOUT_FIELDS, ...(storefronts[0]?.checkoutFields || vendor.checkoutFields || {}) },
    bookingFields: { ...DEFAULT_BOOKING_FIELDS, ...(storefronts[0]?.bookingFields || vendor.bookingFields || {}) },
    slug: vendor.slug || storefronts[0]?.slug,
    name: vendor.name || storefronts[0]?.name,
    businessType: vendor.businessType || storefronts[0]?.businessType,
    logo: vendor.logo || storefronts[0]?.logo,
    coverImage: vendor.coverImage || storefronts[0]?.coverImage,
    tagline: vendor.tagline || storefronts[0]?.tagline,
    description: vendor.description || storefronts[0]?.description,
    address: vendor.address || storefronts[0]?.address,
    phone: vendor.phone || storefronts[0]?.phone,
    accent: vendor.accent || storefronts[0]?.accent,
    categories: vendor.categories || storefronts[0]?.categories || [],
    items: vendor.items || storefronts[0]?.items || [],
    services: vendor.services || storefronts[0]?.services || [],
    disabled: vendor.disabled || false,
  };
}
