import { uid } from "../lib/utils";
import { read, write, STORAGE_KEYS as KEYS } from "./storage";
import { DEFAULT_BOOKING_FIELDS, DEFAULT_CHECKOUT_FIELDS, withDefaults } from "./modelDefaults";
import { seedIfNeeded } from "./seedData";

export const BUSINESS_STORAGE_KEY = KEYS.vendors;
export function getVendors() {
  return read(KEYS.vendors, []).map(withDefaults);
}
export function getVendorById(id) {
  const v = getVendors().find((v) => v.id === id);
  return v || null;
}
export function getVendorBySlug(slug) {
  const v = getVendors().find((v) => v.slug === slug);
  return v || null;
}
export function getVendorByEmail(email) {
  const v = getVendors().find((v) => v.email.toLowerCase() === (email || "").toLowerCase());
  return v || null;
}
export function saveVendor(vendor) {
  const list = read(KEYS.vendors, []);
  const idx = list.findIndex((v) => v.id === vendor.id);
  if (idx >= 0) list[idx] = vendor;
  else list.push(vendor);
  write(KEYS.vendors, list);
  return vendor;
}
export function deleteVendor(id) {
  const list = read(KEYS.vendors, []).filter((v) => v.id !== id);
  write(KEYS.vendors, list);
  // Cascade
  const orders = read(KEYS.orders, []).filter((o) => o.vendorId !== id);
  const bookings = read(KEYS.bookings, []).filter((b) => b.vendorId !== id);
  write(KEYS.orders, orders);
  write(KEYS.bookings, bookings);
}
export function createVendor({ email, password }) {
  const existing = getVendorByEmail(email);
  if (existing) throw new Error("An account with this email already exists.");
  const now = new Date().toISOString();
  const v = {
    id: uid("ven"),
    email,
    password,
    createdAt: now,
    onboarded: false,
    businessType: null,
    name: "",
    slug: "",
    tagline: "",
    description: "",
    logo: "",
    coverImage: "",
    address: "",
    phone: "",
    accent: "brand",
    categories: [],
    items: [],
    services: [],
    checkoutFields: { ...DEFAULT_CHECKOUT_FIELDS },
    bookingFields: { ...DEFAULT_BOOKING_FIELDS },
    disabled: false,
  };
  saveVendor(v);
  return v;
}
export function slugAvailable(slug, exceptVendorId = null) {
  const normalized = (slug || "").toLowerCase();
  return !getVendors().some((vendor) =>
    vendor.id !== exceptVendorId &&
    (vendor.slug === normalized || vendor.storefronts?.some((storefront) => storefront.slug === normalized))
  );
}
export { seedIfNeeded };
