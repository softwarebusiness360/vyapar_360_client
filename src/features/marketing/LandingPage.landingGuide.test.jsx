import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, useLocation } from "react-router-dom";
import LandingPage from "./LandingPage";
import { appRoutes } from "@/app/routes";
import { LANDING_GUIDE_ACTIONS } from "./landing-guide/landingGuideRoutes";
import { ThemeProvider } from "@/lib/theme";
import { CustomerAuthProvider } from "@/lib/customerAuth";

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
const takePath = async (audience, business) => {
  await click(byTestId("landing-guide-launcher"));
  await click(byTestId(`landing-guide-option-${audience}`));
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

test.each([
  ["owner", "restaurant", "owner-restaurant-register", "/register"],
  ["owner", "salon", "owner-salon-register", "/register"],
  ["customer", "restaurant", "customer-restaurant-discover", "/discover"],
  ["customer", "salon", "customer-salon-discover", "/discover"],
])("completes the landing-level four-action %s/%s path", async (audience, business, actionId, destination) => {
  await mountLanding();
  await takePath(audience, business);
  await click(byTestId(`landing-guide-action-${actionId}`));
  expect(byTestId("location-path").textContent).toBe(destination);
});

test("unmount and remount reset the guide to Audience", async () => {
  await mountLanding();
  await click(byTestId("landing-guide-launcher"));
  await click(byTestId("landing-guide-option-owner"));
  expect(byTestId("landing-guide-heading").textContent).toContain("business do you run");

  await act(async () => root.unmount());
  root = null;
  container.replaceChildren();
  await mountLanding();
  await click(byTestId("landing-guide-launcher"));
  expect(byTestId("landing-guide-heading").textContent).toContain("How can we guide you");
});

test("landing guide remains isolated from legacy ChatSupport state and controls", async () => {
  localStorage.setItem("vyapar360.customer_chats", JSON.stringify({ anon: [{ id: "legacy" }] }));
  const before = localStorage.getItem("vyapar360.customer_chats");
  await mountLanding();
  await takePath("customer", "restaurant");
  expect(container.querySelector('[data-testid="chat-support-toggle"]')).toBeNull();
  expect(container.querySelector('[data-testid="chat-input"]')).toBeNull();
  expect(localStorage.getItem("vyapar360.customer_chats")).toBe(before);
});

test("landing-level guide interaction performs no storage or network side effect", async () => {
  await mountLanding();
  const storageSpy = jest.spyOn(Storage.prototype, "setItem");
  const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({});
  await takePath("owner", "salon");
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

test("keeps four distinct action IDs while reusing verified journey routes", () => {
  const actions = Object.values(LANDING_GUIDE_ACTIONS);
  expect(new Set(actions.map(({ id }) => id)).size).toBe(4);
  expect(actions.filter(({ to }) => to === "/register")).toHaveLength(2);
  expect(actions.filter(({ to }) => to === "/discover")).toHaveLength(2);
});
