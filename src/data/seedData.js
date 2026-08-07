import { uid } from "../lib/utils";
import { read, write, STORAGE_KEYS as KEYS } from "./storage";

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
