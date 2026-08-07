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

test.each([
  ["restaurant", "owner-restaurant-register"],
  ["salon", "owner-salon-register"],
])("completes the landing-level business %s path", async (business, actionId) => {
  await mountLanding();
  await takePath(business);
  await click(byTestId(`landing-guide-action-${actionId}`));
  expect(byTestId("location-path").textContent).toBe("/register");
});

test("unmount and remount reset the guide to business selection", async () => {
  await mountLanding();
  await click(byTestId("landing-guide-launcher"));
  await click(byTestId("landing-guide-option-salon"));
  expect(byTestId("landing-guide-heading").textContent).toContain("salon business");

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

test("keeps two distinct business action IDs on the registration journey", () => {
  const actions = Object.values(LANDING_GUIDE_ACTIONS);
  expect(new Set(actions.map(({ id }) => id)).size).toBe(2);
  expect(actions.every(({ to }) => to === "/register")).toBe(true);
});
