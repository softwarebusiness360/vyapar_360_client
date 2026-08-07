import { uid, slugify } from "../lib/utils";
import { getVendorById, getVendorBySlug, getVendors, saveVendor } from "./businessRepository";
import { getPlanConfig, DEFAULT_BOOKING_FIELDS, DEFAULT_CHECKOUT_FIELDS, PRODUCT_STATES, getProductStateMeta, normalizeProductState } from "./modelDefaults";
import { STORAGE_KEYS as KEYS } from "./storage";
import { seedIfNeeded } from "./seedData";
import { getAllowedStorefronts } from "./workforceRepository";

export const STOREFRONT_STORAGE_KEY = KEYS.vendors;
export function getStorefrontsForVendor(vendorId) {
  const v = getVendorById(vendorId);
  return v?.storefronts || [];
}
export function getStorefrontById(vendorId, storefrontId) {
  return getStorefrontsForVendor(vendorId).find((s) => s.id === storefrontId) || null;
}
export function getStorefrontByAnySlug(slug) {
  // Search across all vendors' storefronts (used by customer-facing /store/:slug)
  for (const v of getVendors()) {
    const sf = (v.storefronts || []).find((s) => s.slug === slug);
    if (sf) return { vendor: v, storefront: sf };
  }
  return null;
}
export function addStorefront(vendorId, storefront) {
  const v = getVendorById(vendorId);
  if (!v) throw new Error("Vendor not found");
  const planCfg = getPlanConfig(v.plan);
  if (!planCfg.multiStore && (v.storefronts?.length || 0) >= 1) {
    throw new Error(`Your ${planCfg.label} plan supports a single storefront only. Upgrade to add more.`);
  }
  if ((v.storefronts?.length || 0) >= planCfg.maxStores) {
    throw new Error(`Your ${planCfg.label} plan allows up to ${planCfg.maxStores} storefront${planCfg.maxStores === 1 ? "" : "s"}.`);
  }
  const sf = {
    id: uid("sf"),
    slug: slugify(storefront.slug || storefront.name),
    name: storefront.name || "",
    businessType: storefront.businessType || v.storefronts[0]?.businessType || "restaurant",
    tagline: "",
    description: "",
    logo: "",
    coverImage: "",
    address: "",
    phone: "",
    accent: storefront.businessType === "salon" ? "salon" : "restaurant",
    categories: [],
    items: [],
    services: [],
    checkoutFields: { ...DEFAULT_CHECKOUT_FIELDS },
    bookingFields: { ...DEFAULT_BOOKING_FIELDS },
    disabled: false,
    ...storefront,
  };
  if (!sf.slug) throw new Error("Slug is required");
  if (!slugAvailable(sf.slug, vendorId)) throw new Error("Slug already taken");
  const next = { ...v, storefronts: [...v.storefronts, sf] };
  saveVendor(next);
  return sf;
}
export function updateStorefront(vendorId, storefrontId, patch) {
  const v = getVendorById(vendorId);
  if (!v) throw new Error("Vendor not found");
  const storefronts = v.storefronts.map((s) => (s.id === storefrontId ? { ...s, ...patch } : s));
  saveVendor({ ...v, storefronts });
  return storefronts.find((s) => s.id === storefrontId);
}
export function deleteStorefront(vendorId, storefrontId) {
  const v = getVendorById(vendorId);
  if (!v) return;
  const storefronts = v.storefronts.filter((s) => s.id !== storefrontId);
  saveVendor({ ...v, storefronts });
  // Cascade: cleanup orders/bookings for this storefront
  const orders = read(KEYS.orders, []).filter((o) => o.storefrontId !== storefrontId);
  const bookings = read(KEYS.bookings, []).filter((b) => b.storefrontId !== storefrontId);
  write(KEYS.orders, orders);
  write(KEYS.bookings, bookings);
}

/* Override slugAvailable to also check across storefronts */
export function slugAvailable(slug, exceptVendorId = null) {
  const s = slugify(slug);
  for (const v of getVendors()) {
    for (const sf of v.storefronts || []) {
      if (sf.slug === s && !(exceptVendorId && v.id === exceptVendorId)) {
        return false;
      }
    }
  }
  return true;
}

/* -------------------------- Employees ------------------------------- */

// (DEFAULT_EMPLOYEE_PERMISSIONS is now defined below as an alias for
// ROLE_PRESETS.employee — see updateVendorPlan section.)
export { DEFAULT_BOOKING_FIELDS, DEFAULT_CHECKOUT_FIELDS, PRODUCT_STATES, getAllowedStorefronts, getProductStateMeta, getVendorBySlug, getVendors, normalizeProductState, seedIfNeeded };
