/**
 * LocalStorage-backed data layer for Vyapar360.
 *
 * Designed to mirror a REST API surface so it can be swapped out later
 * with fetch() calls to /api/... without changing consumer components.
 *
 * Keys:
 *  - vyapar360.session          -> { email, vendorId }
 *  - vyapar360.admin_session    -> { email, adminId }
 *  - vyapar360.vendors          -> Vendor[]
 *  - vyapar360.admins           -> Admin[]
 *  - vyapar360.orders           -> Order[]
 *  - vyapar360.bookings         -> Booking[]
 *  - vyapar360.landing_config   -> LandingConfig
 *  - vyapar360.seed_done        -> boolean
 */

import { uid, slugify } from "./utils";

const KEYS = {
  session: "vyapar360.session",
  adminSession: "vyapar360.admin_session",
  customerSession: "vyapar360.customer_session",
  vendors: "vyapar360.vendors",
  admins: "vyapar360.admins",
  customers: "vyapar360.customers",
  orders: "vyapar360.orders",
  bookings: "vyapar360.bookings",
  landing: "vyapar360.landing_config",
  planMatrix: "vyapar360.plan_matrix",
  personaMatrix: "vyapar360.persona_matrix",
  chats: "vyapar360.customer_chats",
  seed: "vyapar360.seed_done",
};

/* ---------------- Product stock states (customer-facing) ---------------- */

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

function withDefaults(vendor) {
  // Multi-storefront migration: if legacy vendor has top-level slug/name but no storefronts, wrap into storefronts[0].
  let storefronts = vendor.storefronts;
  if (!Array.isArray(storefronts) || storefronts.length === 0) {
    if (vendor.slug || vendor.name) {
      storefronts = [{
        id: vendor._legacyStorefrontId || uid("sf"),
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

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ------------------------- Seed demo data ------------------------- */

export function seedIfNeeded() {
  // Ensure a platform admin exists (idempotent — runs even on returning users)
  if (read(KEYS.admins, []).length === 0) {
    const admin = {
      id: uid("adm"),
      email: "admin@vyapar360.com",
      password: "admin123",
      name: "Vyapar Admin",
      role: "superadmin",
      createdAt: new Date().toISOString(),
    };
    write(KEYS.admins, [admin]);
  }

  if (read(KEYS.seed, false)) return;
  const now = new Date().toISOString();

  const pizzaHub = {
    id: uid("ven"),
    email: "owner@pizzahub.com",
    password: "demo1234",
    createdAt: now,
    onboarded: true,
    plan: "pro",
    features: { multiStore: true, employees: true },
    businessType: "restaurant",
    name: "Pizza Hub",
    slug: "pizza-hub",
    tagline: "Wood-fired pizzas & Italian classics",
    description:
      "Hand-tossed sourdough bases, San Marzano tomatoes, and mozzarella flown in fresh. Family-owned since 2019.",
    logo: "https://images.pexels.com/photos/30504703/pexels-photo-30504703.jpeg",
    coverImage:
      "https://images.pexels.com/photos/30504703/pexels-photo-30504703.jpeg?auto=compress&cs=tinysrgb&w=1600",
    address: "42 Colaba Causeway, Mumbai",
    phone: "+91 98200 12345",
    accent: "restaurant",
    categories: [
      { id: uid("cat"), name: "Signature Pizzas" },
      { id: uid("cat"), name: "Pasta" },
      { id: uid("cat"), name: "Sides" },
      { id: uid("cat"), name: "Drinks" },
    ],
    items: [],
    services: [],
  };
  const pc = pizzaHub.categories;
  pizzaHub.items = [
    {
      id: uid("itm"),
      name: "Margherita Classica",
      description: "San Marzano tomato, fior di latte, basil, EVOO",
      price: 449,
      categoryId: pc[0].id,
      image: "https://images.pexels.com/photos/4394623/pexels-photo-4394623.jpeg?auto=compress&cs=tinysrgb&w=800",
      available: true,
    },
    {
      id: uid("itm"),
      name: "Truffle Funghi",
      description: "Wild mushrooms, mozzarella, truffle oil, thyme",
      price: 649,
      categoryId: pc[0].id,
      image: "https://images.pexels.com/photos/2762940/pexels-photo-2762940.jpeg?auto=compress&cs=tinysrgb&w=800",
      available: true,
    },
    {
      id: uid("itm"),
      name: "Spicy Diavola",
      description: "Fiery salami, chilli, tomato, mozzarella",
      price: 599,
      categoryId: pc[0].id,
      image: "https://images.pexels.com/photos/845798/pexels-photo-845798.jpeg?auto=compress&cs=tinysrgb&w=800",
      available: true,
    },
    {
      id: uid("itm"),
      name: "Penne Arrabbiata",
      description: "Al dente penne in spicy tomato-garlic sauce",
      price: 379,
      categoryId: pc[1].id,
      image: "https://images.pexels.com/photos/1487511/pexels-photo-1487511.jpeg?auto=compress&cs=tinysrgb&w=800",
      available: true,
    },
    {
      id: uid("itm"),
      name: "Creamy Alfredo",
      description: "Fettuccine, parmesan cream, cracked pepper",
      price: 429,
      categoryId: pc[1].id,
      image: "https://images.pexels.com/photos/1373915/pexels-photo-1373915.jpeg?auto=compress&cs=tinysrgb&w=800",
      available: true,
    },
    {
      id: uid("itm"),
      name: "Garlic Bread Supreme",
      description: "Toasted focaccia, roasted garlic butter, herbs",
      price: 249,
      categoryId: pc[2].id,
      image: "https://images.pexels.com/photos/1998920/pexels-photo-1998920.jpeg?auto=compress&cs=tinysrgb&w=800",
      available: true,
    },
    {
      id: uid("itm"),
      name: "Cold Brew",
      description: "18-hour steeped, smooth & bold",
      price: 199,
      categoryId: pc[3].id,
      image: "https://images.pexels.com/photos/302896/pexels-photo-302896.jpeg?auto=compress&cs=tinysrgb&w=800",
      available: true,
    },
  ];

  const styleSalon = {
    id: uid("ven"),
    email: "owner@stylesalon.com",
    password: "demo1234",
    createdAt: now,
    onboarded: true,
    plan: "pro",
    features: { multiStore: true, employees: true },
    businessType: "salon",
    name: "Style Salon",
    slug: "style-salon",
    tagline: "Precision cuts, colour & spa treatments",
    description:
      "A boutique salon in Bandra offering premium hair, skin, and grooming services by certified stylists.",
    logo: "https://images.pexels.com/photos/35844833/pexels-photo-35844833.png",
    coverImage:
      "https://images.pexels.com/photos/35844833/pexels-photo-35844833.png?auto=compress&cs=tinysrgb&w=1600",
    address: "18 Linking Road, Bandra West, Mumbai",
    phone: "+91 98670 55210",
    accent: "salon",
    categories: [
      { id: uid("cat"), name: "Hair" },
      { id: uid("cat"), name: "Skin & Face" },
      { id: uid("cat"), name: "Spa" },
      { id: uid("cat"), name: "Grooming" },
    ],
    items: [],
    services: [],
  };
  const sc = styleSalon.categories;
  styleSalon.services = [
    {
      id: uid("svc"),
      name: "Signature Haircut",
      description: "Consultation, precision cut, style — 45 min",
      price: 899,
      duration: 45,
      categoryId: sc[0].id,
      image: "https://images.pexels.com/photos/6487882/pexels-photo-6487882.jpeg?auto=compress&cs=tinysrgb&w=800",
      available: true,
    },
    {
      id: uid("svc"),
      name: "Global Hair Colour",
      description: "Ammonia-free colour, gloss finish — 90 min",
      price: 2499,
      duration: 90,
      categoryId: sc[0].id,
      image: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800",
      available: true,
    },
    {
      id: uid("svc"),
      name: "Hydra Facial",
      description: "Deep cleanse, exfoliation & hydration — 60 min",
      price: 1899,
      duration: 60,
      categoryId: sc[1].id,
      image: "https://images.pexels.com/photos/3757955/pexels-photo-3757955.jpeg?auto=compress&cs=tinysrgb&w=800",
      available: true,
    },
    {
      id: uid("svc"),
      name: "Aromatherapy Massage",
      description: "Full body relaxation with essential oils — 60 min",
      price: 2299,
      duration: 60,
      categoryId: sc[2].id,
      image: "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800",
      available: true,
    },
    {
      id: uid("svc"),
      name: "Beard Sculpting",
      description: "Shape, line-up & hot towel — 30 min",
      price: 599,
      duration: 30,
      categoryId: sc[3].id,
      image: "https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=800",
      available: true,
    },
  ];

  // Seed demo team members for each vendor so role-based dummy logins work.
  pizzaHub.employees = [
    {
      id: uid("emp"), email: "manager@pizzahub.com", password: "demo1234",
      name: "Ravi Kumar", role: "manager",
      storefrontIds: [], // will fill after storefronts materialise via withDefaults
      permissions: { takeOrders: true, takeBookings: true, viewInsights: true, editCatalogue: true },
      disabled: false, createdAt: now,
    },
    {
      id: uid("emp"), email: "employee@pizzahub.com", password: "demo1234",
      name: "Priya Sharma", role: "employee",
      storefrontIds: [],
      permissions: { takeOrders: true, takeBookings: true, viewInsights: false, editCatalogue: false },
      disabled: false, createdAt: now,
    },
  ];
  styleSalon.employees = [
    {
      id: uid("emp"), email: "manager@stylesalon.com", password: "demo1234",
      name: "Neha Verma", role: "manager",
      storefrontIds: [],
      permissions: { takeOrders: true, takeBookings: true, viewInsights: true, editCatalogue: true },
      disabled: false, createdAt: now,
    },
  ];

  write(KEYS.vendors, [pizzaHub, styleSalon]);

  // seed a couple of orders / bookings for realism
  const orders = [
    {
      id: uid("ord"),
      vendorId: pizzaHub.id,
      code: "PH-1042",
      createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      status: "preparing",
      customer: { name: "Ananya Rao", phone: "+91 98765 43210", address: "12 Marine Drive, Mumbai" },
      items: [
        { id: pizzaHub.items[0].id, name: pizzaHub.items[0].name, price: pizzaHub.items[0].price, qty: 2 },
        { id: pizzaHub.items[5].id, name: pizzaHub.items[5].name, price: pizzaHub.items[5].price, qty: 1 },
      ],
      subtotal: 449 * 2 + 249,
      tax: Math.round((449 * 2 + 249) * 0.05),
      total: Math.round((449 * 2 + 249) * 1.05),
      notes: "Ring the bell",
    },
    {
      id: uid("ord"),
      vendorId: pizzaHub.id,
      code: "PH-1041",
      createdAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
      status: "delivered",
      customer: { name: "Kabir Shah", phone: "+91 90000 11122", address: "7B Worli Sea Face" },
      items: [{ id: pizzaHub.items[2].id, name: pizzaHub.items[2].name, price: pizzaHub.items[2].price, qty: 1 }],
      subtotal: 599,
      tax: 30,
      total: 629,
      notes: "",
    },
  ];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const bookings = [
    {
      id: uid("bkg"),
      vendorId: styleSalon.id,
      code: "SS-208",
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      status: "confirmed",
      customer: { name: "Meera Iyer", phone: "+91 91111 22233" },
      service: {
        id: styleSalon.services[0].id,
        name: styleSalon.services[0].name,
        price: styleSalon.services[0].price,
        duration: styleSalon.services[0].duration,
      },
      date: tomorrow.toISOString().slice(0, 10),
      slot: "11:30",
      notes: "",
    },
  ];

  write(KEYS.orders, orders);
  write(KEYS.bookings, bookings);

  // Seed platform admin
  const admin = {
    id: uid("adm"),
    email: "admin@vyapar360.com",
    password: "admin123",
    name: "Vyapar Admin",
    role: "superadmin",
    createdAt: now,
  };
  write(KEYS.admins, [admin]);

  write(KEYS.seed, true);
}

/* ---------------------------- Vendors ----------------------------- */

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

/* --------------------------- Session ------------------------------ */

export function getSession() {
  return read(KEYS.session, null);
}
export function setSession(session) {
  write(KEYS.session, session);
}
export function clearSession() {
  localStorage.removeItem(KEYS.session);
}

/* --------------------------- Orders ------------------------------- */

const ORDER_STATUSES = ["pending", "preparing", "ready", "delivered", "cancelled"];
export const RESTAURANT_ORDER_STATUSES = ORDER_STATUSES;

export function getOrders(vendorId) {
  const all = read(KEYS.orders, []);
  return vendorId ? all.filter((o) => o.vendorId === vendorId) : all;
}
export function createOrder(order) {
  const all = read(KEYS.orders, []);
  const code =
    "ORD-" +
    Math.floor(1000 + Math.random() * 9000).toString();
  const o = {
    id: uid("ord"),
    code,
    status: "pending",
    channel: normalizeChannel(order.channel),
    createdAt: new Date().toISOString(),
    ...order,
    channel: normalizeChannel(order.channel), // ensure normalized after spread
  };
  all.unshift(o);
  write(KEYS.orders, all);
  return o;
}
export function updateOrderStatus(orderId, status) {
  const all = read(KEYS.orders, []);
  const idx = all.findIndex((o) => o.id === orderId);
  if (idx >= 0) {
    all[idx].status = status;
    write(KEYS.orders, all);
    return all[idx];
  }
  return null;
}

/* -------------------------- Bookings ------------------------------ */

const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"];
export const SALON_BOOKING_STATUSES = BOOKING_STATUSES;

export function getBookings(vendorId) {
  const all = read(KEYS.bookings, []);
  return vendorId ? all.filter((b) => b.vendorId === vendorId) : all;
}
export function createBooking(booking) {
  const all = read(KEYS.bookings, []);
  const code =
    "BKG-" +
    Math.floor(1000 + Math.random() * 9000).toString();
  const b = {
    id: uid("bkg"),
    code,
    status: "confirmed",
    channel: normalizeChannel(booking.channel),
    createdAt: new Date().toISOString(),
    ...booking,
    channel: normalizeChannel(booking.channel),
  };
  all.unshift(b);
  write(KEYS.bookings, all);
  return b;
}
export function updateBookingStatus(bookingId, status) {
  const all = read(KEYS.bookings, []);
  const idx = all.findIndex((b) => b.id === bookingId);
  if (idx >= 0) {
    all[idx].status = status;
    write(KEYS.bookings, all);
    return all[idx];
  }
  return null;
}

/* --------------------------- Slots -------------------------------- */

export function getSlotsForDate(vendorId, dateISO) {
  // Fixed 10:00 - 19:00, 30 min slots. Filter out booked slots.
  const slots = [];
  for (let h = 10; h < 19; h++) {
    for (const m of [0, 30]) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  const booked = getBookings(vendorId)
    .filter((b) => b.date === dateISO && b.status !== "cancelled")
    .map((b) => b.slot);
  return slots.map((s) => ({ time: s, available: !booked.includes(s) }));
}

export const STORAGE_KEYS = KEYS;

/* ------------------------- Admin (platform) ------------------------ */

export function getAdmins() {
  return read(KEYS.admins, []);
}
export function getAdminByEmail(email) {
  return getAdmins().find((a) => a.email.toLowerCase() === (email || "").toLowerCase()) || null;
}
export function getAdminById(id) {
  return getAdmins().find((a) => a.id === id) || null;
}
export function getAdminSession() {
  return read(KEYS.adminSession, null);
}
export function setAdminSession(s) {
  write(KEYS.adminSession, s);
}
export function clearAdminSession() {
  localStorage.removeItem(KEYS.adminSession);
}

/* --------------------- Landing page CMS config --------------------- */

export const DEFAULT_LANDING_CONFIG = {
  hero: {
    eyebrow: "Now live for Restaurants & Salons in India",
    headlineLine1: "Your neighbourhood",
    headlineLine2: "business, ",
    headlineHighlight: "beautifully ",
    headlineLine3: "online.",
    subtitle:
      "Vyapar360 gives local businesses a ready-to-use digital storefront in minutes. No websites. No developers. No commission. Just orders and bookings.",
    ctaPrimary: "Launch your store — free",
    ctaSecondary: "See pricing",
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

/* -------------------- Storefronts (multi-outlet) -------------------- */

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

export function getEmployees(vendorId) {
  const v = getVendorById(vendorId);
  return v?.employees || [];
}
export function getEmployeeById(vendorId, empId) {
  return getEmployees(vendorId).find((e) => e.id === empId) || null;
}
export function getEmployeeByEmail(email) {
  const needle = (email || "").toLowerCase();
  for (const v of getVendors()) {
    const emp = (v.employees || []).find((e) => e.email.toLowerCase() === needle);
    if (emp) return { vendor: v, employee: emp };
  }
  return null;
}
export function addEmployee(vendorId, employee) {
  const v = getVendorById(vendorId);
  if (!v) throw new Error("Vendor not found");
  const planCfg = getPlanConfig(v.plan);
  if (!planCfg.employees) {
    throw new Error(`Your ${planCfg.label} plan doesn't include team members. Upgrade to invite employees.`);
  }
  if ((v.employees?.length || 0) >= planCfg.maxEmployees) {
    throw new Error(`Your ${planCfg.label} plan allows up to ${planCfg.maxEmployees} employees.`);
  }
  if (getEmployeeByEmail(employee.email)) throw new Error("An account with this email already exists.");
  if (getVendorByEmail(employee.email)) throw new Error("An account with this email already exists.");
  const role = ROLES.includes(employee.role) && employee.role !== "owner" ? employee.role : "employee";
  const emp = {
    id: uid("emp"),
    email: employee.email,
    password: employee.password,
    name: employee.name || "",
    role,
    storefrontIds: employee.storefrontIds || [],
    permissions: { ...ROLE_PRESETS[role], ...(employee.permissions || {}) },
    disabled: false,
    createdAt: new Date().toISOString(),
  };
  saveVendor({ ...v, employees: [...v.employees, emp] });
  return emp;
}
export function updateEmployee(vendorId, empId, patch) {
  const v = getVendorById(vendorId);
  if (!v) return null;
  const employees = v.employees.map((e) => (e.id === empId ? { ...e, ...patch } : e));
  saveVendor({ ...v, employees });
  return employees.find((e) => e.id === empId);
}
export function deleteEmployee(vendorId, empId) {
  const v = getVendorById(vendorId);
  if (!v) return;
  saveVendor({ ...v, employees: v.employees.filter((e) => e.id !== empId) });
}

/* ------------------ Feature flags (Pro-plan gating) ----------------- */

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

/* ---------------- Cross-store analytics helpers ---------------- */

/**
 * Return orders/bookings scoped to a vendor, optionally filtered by
 * storefrontIds (array), status, or a date-range (inclusive ISO strings).
 * Legacy records without `storefrontId` are treated as belonging to the
 * first storefront (created by `withDefaults` migration).
 */
function _resolveStorefrontId(vendor, record) {
  if (record.storefrontId) return record.storefrontId;
  return vendor.storefronts?.[0]?.id || null;
}

export function getVendorTransactions(vendorId, { storefrontIds, from, to, includeCancelled = false } = {}) {
  const v = getVendorById(vendorId);
  if (!v) return { orders: [], bookings: [] };
  const okStore = (rec) => {
    if (!storefrontIds || storefrontIds.length === 0) return true;
    return storefrontIds.includes(_resolveStorefrontId(v, rec));
  };
  const inRange = (iso) => {
    if (!iso) return false;
    if (from && iso < from) return false;
    if (to && iso > to) return false;
    return true;
  };
  const notCancelled = (rec) => includeCancelled || rec.status !== "cancelled";
  const orders = getOrders(vendorId).filter((o) =>
    okStore(o) && notCancelled(o) && (!from && !to ? true : inRange(o.createdAt)),
  );
  const bookings = getBookings(vendorId).filter((b) =>
    okStore(b) && notCancelled(b) && (!from && !to ? true : inRange(b.createdAt)),
  );
  return { orders, bookings };
}

/**
 * Compute revenue/count KPIs for a set of orders + bookings.
 */
export function computeKPIs({ orders = [], bookings = [] }) {
  const orderRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const bookingRevenue = bookings.reduce((s, b) => s + (b.service?.price || 0), 0);
  const revenue = orderRevenue + bookingRevenue;
  const txCount = orders.length + bookings.length;
  return {
    revenue,
    orderRevenue,
    bookingRevenue,
    orders: orders.length,
    bookings: bookings.length,
    txCount,
    avgTicket: txCount > 0 ? Math.round(revenue / txCount) : 0,
  };
}

/**
 * Per-storefront KPI breakdown for the owner's consolidated dashboard.
 */
export function getPerStoreStats(vendorId, { from, to } = {}) {
  const v = getVendorById(vendorId);
  if (!v) return [];
  return (v.storefronts || []).map((sf) => {
    const { orders, bookings } = getVendorTransactions(vendorId, { storefrontIds: [sf.id], from, to });
    return { storefront: sf, ...computeKPIs({ orders, bookings }) };
  });
}

/**
 * Employee performance metrics (owner-only view).
 */
export function getEmployeePerformance(vendorId, { from, to, storefrontIds } = {}) {
  const v = getVendorById(vendorId);
  if (!v) return [];
  const employees = v.employees || [];
  const { orders, bookings } = getVendorTransactions(vendorId, { storefrontIds, from, to });
  return employees.map((emp) => {
    const empOrders = orders.filter((o) => o.employeeId === emp.id);
    const empBookings = bookings.filter((b) => b.employeeId === emp.id);
    const kpis = computeKPIs({ orders: empOrders, bookings: empBookings });
    const assignedStores = (v.storefronts || []).filter((s) => emp.storefrontIds.includes(s.id));
    return { employee: emp, assignedStores, ...kpis };
  });
}

/**
 * Storefronts an employee is allowed to operate on. Owners see all.
 */
export function getAllowedStorefronts(vendor, employee) {
  if (!vendor) return [];
  if (!employee) return vendor.storefronts || [];
  return (vendor.storefronts || []).filter((s) => employee.storefrontIds.includes(s.id));
}


/* ================================================================== *
 *  CUSTOMERS — name-only session, optional phone with mock OTP flow
 * ================================================================== */

// Any 4+ digit OTP is accepted (mocked). Default happy-path code is "1234".
export const MOCK_OTP = "1234";

export function getCustomers() {
  return read(KEYS.customers, []);
}
export function getCustomerByPhone(phone) {
  if (!phone) return null;
  return getCustomers().find((c) => c.phone === phone) || null;
}
export function getCustomerById(id) {
  return getCustomers().find((c) => c.id === id) || null;
}
export function saveCustomer(customer) {
  const all = getCustomers();
  const idx = all.findIndex((c) => c.id === customer.id);
  if (idx >= 0) all[idx] = customer;
  else all.push(customer);
  write(KEYS.customers, all);
  return customer;
}

/**
 * Create or upgrade the current customer session. If only `name` is passed
 * we keep a lightweight guest session (localStorage only, not in the DB).
 * If `phone` + OTP are provided (and OTP is valid) we upsert into the DB.
 */
export function customerLogin({ name, phone, otp }) {
  const cleanName = (name || "").trim();
  if (!cleanName) throw new Error("Enter your name to continue.");

  if (phone) {
    if (!otp) throw new Error("Enter the OTP sent to your phone.");
    if (otp.trim() !== MOCK_OTP && otp.trim().length < 4) {
      throw new Error(`Invalid OTP. For demo, use ${MOCK_OTP}.`);
    }
    const cleanPhone = phone.trim();
    const existing = getCustomerByPhone(cleanPhone);
    const now = new Date().toISOString();
    const customer = existing
      ? { ...existing, name: cleanName, lastActiveAt: now }
      : { id: uid("cust"), name: cleanName, phone: cleanPhone, createdAt: now, lastActiveAt: now };
    saveCustomer(customer);
    write(KEYS.customerSession, { id: customer.id, name: customer.name, phone: customer.phone, guest: false });
    return customer;
  }

  // Guest — name only, session lives in localStorage
  const guest = { id: "guest_" + Date.now(), name: cleanName, guest: true };
  write(KEYS.customerSession, guest);
  return guest;
}

export function getCustomerSession() {
  return read(KEYS.customerSession, null);
}
export function customerLogout() {
  localStorage.removeItem(KEYS.customerSession);
}

/** Save phone (post-login upgrade for guests). */
export function upgradeCustomerToPhone({ phone, otp }) {
  const session = getCustomerSession();
  if (!session) throw new Error("No active customer session.");
  if (!phone) throw new Error("Phone is required.");
  if (!otp || (otp.trim() !== MOCK_OTP && otp.trim().length < 4)) {
    throw new Error(`Invalid OTP. For demo, use ${MOCK_OTP}.`);
  }
  const cleanPhone = phone.trim();
  const existing = getCustomerByPhone(cleanPhone);
  const now = new Date().toISOString();
  const customer = existing
    ? { ...existing, name: session.name, lastActiveAt: now }
    : { id: uid("cust"), name: session.name, phone: cleanPhone, createdAt: now, lastActiveAt: now };
  saveCustomer(customer);
  write(KEYS.customerSession, { id: customer.id, name: customer.name, phone: customer.phone, guest: false });
  return customer;
}

/**
 * Fetch a customer's orders/bookings. Matches by `customerId` OR falls back
 * to phone/name for legacy records that pre-date the customer DB.
 */
export function getCustomerTransactions({ id, phone, name }) {
  const matches = (rec) => {
    if (id && rec.customerId === id) return true;
    if (phone && rec.customer?.phone === phone) return true;
    if (name && !phone && rec.customer?.name === name) return true;
    return false;
  };
  const orders = read(KEYS.orders, []).filter(matches);
  const bookings = read(KEYS.bookings, []).filter(matches);
  return { orders, bookings };
}

/* ================================================================== *
 *  Persona <-> feature visibility matrix (admin-configurable)
 *  Simple map: `feature -> [personas that see it]`.
 *  Personas: `owner | manager | employee | customer | admin`.
 * ================================================================== */

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

/* ================================================================== *
 *  Chat support (customer-facing widget) — LocalStorage transcripts.
 * ================================================================== */

const AUTO_ANSWERS = [
  { match: /(hi|hello|hey|namaste)/i,           reply: "Hi 👋 How can I help today? You can ask about orders, delivery, payments, or timings." },
  { match: /(order|track|status)/i,             reply: "You can view live status on your profile. Tap the profile icon on your storefront." },
  { match: /(delivery|deliver|when|reach)/i,    reply: "Most restaurants deliver within 30–45 minutes. Salons confirm bookings instantly." },
  { match: /(refund|cancel|cancelled|return)/i, reply: "For refunds or cancellations, please reach out to the store directly from your order page." },
  { match: /(payment|pay|upi|card)/i,           reply: "We accept UPI, cards, and net banking. Cash on delivery is at the store's discretion." },
  { match: /(offer|discount|coupon)/i,          reply: "Occasional offers appear on each storefront's home page. Keep an eye out for badges!" },
  { match: /(hour|open|close|timing)/i,         reply: "Timings vary by store. You'll find them on the storefront header." },
  { match: /(bye|thanks|thank you|ok)/i,        reply: "Anytime! Have a great day 🌟" },
];

export function getAutoReply(text) {
  const found = AUTO_ANSWERS.find((a) => a.match.test(text || ""));
  return found ? found.reply : "Thanks for the message! We'll come back with a human answer soon. Meanwhile, try asking about orders, payments, or timings.";
}

export function getChatTranscript(customerId) {
  const all = read(KEYS.chats, {});
  return all[customerId] || [];
}
export function appendChat(customerId, message) {
  const all = read(KEYS.chats, {});
  const list = all[customerId] || [];
  const entry = { ...message, id: uid("msg"), at: new Date().toISOString() };
  list.push(entry);
  all[customerId] = list;
  write(KEYS.chats, all);
  return entry;
}
