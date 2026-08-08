import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, useLocation } from "react-router-dom";
import LandingPage from "./LandingPage";
import { appRoutes } from "@/app/routes";
import { LANDING_GUIDE_ACTIONS } from "./landing-guide/landingGuideRoutes";
import { ThemeProvider } from "@/lib/theme";
import { CustomerAuthProvider } from "@/lib/customerAuth";
import { DEFAULT_LANDING_CONFIG, saveLandingConfig } from "@/data/configurationRepository";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
let container;
let root;

const byTestId = (id) => container.querySelector(`[data-testid="${id}"]`);
const click = async (element) => act(async () => element.dispatchEvent(
  new MouseEvent("click", { bubbles: true, cancelable: true }),
));
const LandingHarness = () => (
  <MemoryRouter initialEntries={["/"]}>
    <ThemeProvider>
      <CustomerAuthProvider>
        <LandingPage />
        <LocationProbe />
      </CustomerAuthProvider>
    </ThemeProvider>
  </MemoryRouter>
);
const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location-path">{location.pathname}</output>;
};
const mountLanding = async () => {
  root = createRoot(container);
  await act(async () => root.render(<LandingHarness />));
};
const takePath = async (business) => {
  await click(byTestId("landing-guide-launcher"));
  await click(byTestId(`landing-guide-option-${business}`));
};

beforeEach(() => {
  localStorage.clear();
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  container.remove();
  root = null;
  jest.restoreAllMocks();
});

test("mounts the guide on the landing page without replacing existing content", async () => {
  await mountLanding();
  expect(container.querySelector('[data-testid="landing-guide-launcher"]')).not.toBeNull();
  expect(container.querySelector('[data-testid="hero-title"]')).not.toBeNull();
  expect(container.querySelector("header")).not.toBeNull();
  expect(container.querySelector("footer")).not.toBeNull();
});

test("renders the approved restaurant launch hero and internally consistent dashboard", async () => {
  await mountLanding();
  expect(container.textContent).toContain("Now live for restaurants & cafés");
  expect(byTestId("hero-title").textContent).toContain("Your business,");
  expect(container.textContent).toContain("share your QR or link");
  expect(container.textContent).toContain("Today’s Sales₹12,480");
  expect(container.textContent).toContain("Orders38");
  expect(container.textContent).toContain("Pending4");
  expect(container.textContent).toContain("Completed34");
  expect(container.textContent).toContain("Cold Coffee ×3");
  expect(container.textContent).not.toContain("Signature Haircut");
  expect(byTestId("hero-product-flow").textContent).toContain("Add your menu");
  expect(byTestId("hero-product-flow").textContent).toContain("Share QR/link");
  expect(byTestId("hero-product-flow").textContent).toContain("Receive orders");
  expect(container.textContent).not.toContain("Paneer Burger ×1");
});

test("emphasizes restaurants and cafés while muting future business types", async () => {
  await mountLanding();
  const salon = byTestId("business-type-salons");
  expect(salon.textContent).toContain("Salons");
  expect(byTestId("business-types-title").textContent).toContain("Starting with restaurants & cafés");
  expect(byTestId("business-types-available").textContent).toContain("Restaurants");
  expect(byTestId("business-types-available").textContent).toContain("Cafés");
  expect(byTestId("business-types-coming").textContent).toContain("Salons");
  expect(byTestId("business-types-coming").textContent).toContain("Rental & Property");
  expect(salon.className).toMatch(/rounded-full/);
  expect(container.textContent).not.toMatch(/roadmap|roll out every month/i);
});

test("renders the locked How it works copy without connector arrows", async () => {
  await mountLanding();
  expect(byTestId("how-step-0").textContent).toContain("Set up your business");
  expect(byTestId("how-step-2").textContent).toContain("Google, or as a printed QR");
  expect(container.querySelector('[data-testid^="how-connector-"]')).toBeNull();
});

test("renders six concrete feature outcomes in a two-column mobile grid", async () => {
  await mountLanding();
  expect(byTestId("features-title").textContent).toContain("Everything you need to take your business online");
  expect(byTestId("feature-card-0").textContent).toContain("Your own branded page");
  expect(byTestId("feature-card-5").textContent).toContain("See today’s sales");
  expect(byTestId("feature-card-4").textContent).not.toMatch(/phone/i);
  expect(byTestId("feature-card-0").parentElement.className).toMatch(/grid-cols-2.*lg:grid-cols-3/);
  expect(container.querySelectorAll('[data-testid^="feature-card-"]')).toHaveLength(6);
});

test("renders launch-ready pricing while retaining future benefits outside the public cards", async () => {
  await mountLanding();

  expect(byTestId("pricing-title").textContent).toContain("Start free. Grow when you're ready.");
  expect(byTestId("pricing-price-free").textContent).toBe("0");
  expect(byTestId("pricing-price-growth").textContent).toBe("499");
  expect(byTestId("pricing-price-pro").textContent).toBe("999");
  expect(byTestId("pricing-billing-toggle")).toBeNull();
  expect(byTestId("pricing-plan-free").textContent).toContain("Up to 20 menu items");
  expect(byTestId("pricing-plan-growth").textContent).toContain("Customer details");
  expect(byTestId("pricing-plan-pro").textContent).toContain("Multi-location management");
  expect(container.querySelector('[data-testid="pricing-plan-free"]').textContent).not.toMatch(/bookings|WhatsApp|payment gateway|AI|custom domain|advanced analytics/i);
  expect(DEFAULT_LANDING_CONFIG.plans.flatMap((plan) => plan.features).some((feature) => feature.visible === false)).toBe(true);
});

test("lets CMS configuration enable the public billing toggle", async () => {
  saveLandingConfig({
    ...DEFAULT_LANDING_CONFIG,
    pricing: { ...DEFAULT_LANDING_CONFIG.pricing, showBillingToggle: true },
  });
  await mountLanding();
  expect(byTestId("pricing-billing-toggle")).not.toBeNull();
});

test("round-trips CMS brand and section copy through the public landing surface", async () => {
  saveLandingConfig({
    ...DEFAULT_LANDING_CONFIG,
    brand: { ...DEFAULT_LANDING_CONFIG.brand, name: "Local Brand" },
    features: { ...DEFAULT_LANDING_CONFIG.features, title: "CMS feature heading" },
    businessTypes: { ...DEFAULT_LANDING_CONFIG.businessTypes, title: "CMS business heading" },
    faqSection: { ...DEFAULT_LANDING_CONFIG.faqSection, title: "CMS FAQ heading" },
    finalCta: { ...DEFAULT_LANDING_CONFIG.finalCta, title: "CMS final heading" },
    footer: { ...DEFAULT_LANDING_CONFIG.footer, description: "CMS footer description" },
  });

  await mountLanding();
  expect(container.querySelector("header").textContent).toContain("Local Brand");
  expect(container.querySelector("footer").textContent).toContain("Local Brand");
  expect(container.querySelector("footer").textContent).toContain("CMS footer description");
  expect(byTestId("features-title").textContent).toContain("CMS feature heading");
  expect(byTestId("business-types-title").textContent).toContain("CMS business heading");
  expect(byTestId("faq-title").textContent).toContain("CMS FAQ heading");
  expect(byTestId("final-cta-title").textContent).toContain("CMS final heading");
});

test("answers the six primary launch objections without generic pricing questions", async () => {
  await mountLanding();

  expect(byTestId("faq-title").textContent).toContain("Questions before you start?");
  expect(container.querySelectorAll('[data-testid^="faq-"]:not([data-testid="faq-title"])')).toHaveLength(6);
  expect(byTestId("faq-0").textContent).toContain("Is Vyapar360 free to start?");
  expect(byTestId("faq-2").textContent).toContain("without signing up");
  expect(byTestId("faq-3").textContent).toContain("QR code or business link");
  expect(byTestId("faq-4").textContent).toContain("prices, photos and availability");
  expect(byTestId("faq-5").textContent).toContain("Restaurants and cafés");
  expect(container.textContent).not.toContain("Can I switch plans anytime?");
  expect(container.textContent).not.toContain("reply in under an hour");
});

test("renders the final conversion CTA and minimal footer with real destinations", async () => {
  await mountLanding();

  expect(byTestId("final-cta-title").textContent).toContain("Take your business online in minutes");
  expect(byTestId("cta-register").textContent).toContain("Start free");
  expect(byTestId("cta-register").getAttribute("href")).toBe("/register");
  expect(byTestId("cta-demo").textContent).toBe("See demo");
  expect(byTestId("cta-demo").getAttribute("href")).toBe("/discover");
  expect(byTestId("footer-link-privacy").getAttribute("href")).toBe("/privacy");
  expect(byTestId("footer-link-terms").getAttribute("href")).toBe("/terms");
  expect(container.querySelector("footer").textContent).not.toMatch(/Discover|Customer sign|LocalStorage|MVP|API/);
});

test("opens the existing Need Help guide from the footer Support action", async () => {
  await mountLanding();
  await click(byTestId("footer-support"));
  expect(byTestId("landing-guide-panel")).not.toBeNull();
  expect(byTestId("landing-guide-heading").textContent).toContain("What kind of business do you run?");
});

test.each([
  ["restaurant", "owner-restaurant-register"],
])("completes the landing-level business %s path", async (business, actionId) => {
  await mountLanding();
  await takePath(business);
  await click(byTestId(`landing-guide-action-${actionId}`));
  expect(byTestId("location-path").textContent).toBe("/register");
});

test("shows salon as coming soon without a registration action", async () => {
  await mountLanding();
  await takePath("salon");
  expect(byTestId("landing-guide-heading").textContent).toContain("Salons are coming soon");
  expect(container.querySelector('[data-testid^="landing-guide-action-"]')).toBeNull();
});

test("unmount and remount reset the guide to business selection", async () => {
  await mountLanding();
  await click(byTestId("landing-guide-launcher"));
  await click(byTestId("landing-guide-option-salon"));
  expect(byTestId("landing-guide-heading").textContent).toContain("Salons are coming soon");

  await act(async () => root.unmount());
  root = null;
  container.replaceChildren();
  await mountLanding();
  await click(byTestId("landing-guide-launcher"));
  expect(byTestId("landing-guide-heading").textContent).toContain("business do you run");
  expect(byTestId("landing-guide-option-customer")).toBeNull();
});

test("landing guide remains isolated from legacy ChatSupport state and controls", async () => {
  localStorage.setItem("vyapar360.customer_chats", JSON.stringify({ anon: [{ id: "legacy" }] }));
  const before = localStorage.getItem("vyapar360.customer_chats");
  await mountLanding();
  await takePath("restaurant");
  expect(container.querySelector('[data-testid="chat-support-toggle"]')).toBeNull();
  expect(container.querySelector('[data-testid="chat-input"]')).toBeNull();
  expect(localStorage.getItem("vyapar360.customer_chats")).toBe(before);
});

test("landing-level guide interaction performs no storage or network side effect", async () => {
  await mountLanding();
  const storageSpy = jest.spyOn(Storage.prototype, "setItem");
  const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({});
  await takePath("salon");
  expect(storageSpy).not.toHaveBeenCalled();
  expect(fetchSpy).not.toHaveBeenCalled();
  jest.restoreAllMocks();
});

test("all terminal actions resolve to existing public route destinations", () => {
  const publicPaths = new Set(appRoutes.filter(({ guard }) => guard === "public" || guard === "redirect-if-vendor").map(({ path }) => path));
  for (const action of Object.values(LANDING_GUIDE_ACTIONS)) {
    expect(publicPaths.has(action.to)).toBe(true);
  }
});

test("keeps only the live restaurant action on the registration journey", () => {
  const actions = Object.values(LANDING_GUIDE_ACTIONS);
  expect(new Set(actions.map(({ id }) => id)).size).toBe(1);
  expect(actions.every(({ to }) => to === "/register")).toBe(true);
});
