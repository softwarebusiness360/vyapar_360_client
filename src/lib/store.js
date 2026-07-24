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
  vendors: "vyapar360.vendors",
  admins: "vyapar360.admins",
  orders: "vyapar360.orders",
  bookings: "vyapar360.bookings",
  landing: "vyapar360.landing_config",
  seed: "vyapar360.seed_done",
};

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
  const defaultPlan = vendor.plan || "starter";
  const defaultFeatures = {
    multiStore: defaultPlan === "pro",
    employees: defaultPlan === "pro" || defaultPlan === "growth",
    ...(vendor.features || {}),
  };
  return {
    ...vendor,
    storefronts,
    employees: vendor.employees || [],
    plan: defaultPlan,
    features: defaultFeatures,
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
    createdAt: new Date().toISOString(),
    ...order,
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
    createdAt: new Date().toISOString(),
    ...booking,
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
  plans: [
    {
      id: "free",
      name: "Starter",
      price: 0,
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
      price: 499,
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
      price: 999,
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
  // Shallow-merge to survive additive schema changes
  return {
    ...DEFAULT_LANDING_CONFIG,
    ...saved,
    hero: { ...DEFAULT_LANDING_CONFIG.hero, ...(saved.hero || {}) },
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

export const DEFAULT_EMPLOYEE_PERMISSIONS = {
  takeOrders: true,
  takeBookings: true,
  viewInsights: false,
  editCatalogue: false,
};

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
  if (getEmployeeByEmail(employee.email)) throw new Error("An account with this email already exists.");
  if (getVendorByEmail(employee.email)) throw new Error("An account with this email already exists.");
  const emp = {
    id: uid("emp"),
    email: employee.email,
    password: employee.password,
    name: employee.name || "",
    role: "employee",
    storefrontIds: employee.storefrontIds || [],
    permissions: { ...DEFAULT_EMPLOYEE_PERMISSIONS, ...(employee.permissions || {}) },
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
  const features = {
    multiStore: plan === "pro",
    employees: plan === "pro" || plan === "growth",
  };
  saveVendor({ ...v, plan, features });
  return { plan, features };
}

