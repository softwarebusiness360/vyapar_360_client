import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import StorefrontsPage from "./vendor/common/storefronts/StorefrontsPage";
import TeamPage from "./vendor/common/team/TeamPage";
import InsightsPage from "./vendor/common/insights/InsightsPage";
import AdminOrdersPage from "./admin/orders/AdminOrdersPage";
import AdminBookingsPage from "./admin/bookings/AdminBookingsPage";
import AdminLandingCMSPage from "./admin/landing/AdminLandingCMSPage";
import AdminBusinessesPage from "./admin/businesses/AdminBusinessesPage";
import { seedIfNeeded } from "@/data/authRepository";
import { getVendorBySlug, getVendorById } from "@/data/businessRepository";
import { createOrder } from "@/data/orderRepository";
import { createBooking } from "@/data/bookingRepository";
import { getLandingConfig } from "@/data/configurationRepository";

let mockAuthState;
jest.mock("@/lib/auth", () => ({ useAuth: () => mockAuthState }));
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;
const mount = async (element) => {
  if (root) await act(async () => root.unmount());
  root = createRoot(container);
  await act(async () => root.render(<MemoryRouter>{element}</MemoryRouter>));
};
const click = (element) => act(async () => element.dispatchEvent(new MouseEvent("click", { bubbles: true })));
const input = (element, value) => act(async () => {
  const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, "value").set.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
});

beforeEach(() => {
  localStorage.clear();
  seedIfNeeded();
  container = document.createElement("div");
  document.body.appendChild(container);
  const vendor = getVendorBySlug("pizza-hub");
  mockAuthState = {
    vendor, employee: null, isOwner: true, role: "owner",
    refresh: jest.fn(() => { mockAuthState.vendor = getVendorById(vendor.id); }),
  };
  jest.useFakeTimers();
});
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  root = null;
  container.remove();
  jest.useRealTimers();
});

test("common vendor storefront, team, and analytics workflows render and persist", async () => {
  const vendor = mockAuthState.vendor;
  await mount(<StorefrontsPage />);
  expect(container.querySelector(`[data-testid="storefront-card-${vendor.storefronts[0].id}"]`)).not.toBeNull();
  await click(container.querySelector('[data-testid="add-storefront-btn"]'));
  await input(container.querySelector('[data-testid="new-storefront-name"]'), "Airport Outlet");
  await input(container.querySelector('[data-testid="new-storefront-slug"]'), "airport-outlet");
  await click(container.querySelector('[data-testid="save-new-storefront-btn"]'));
  expect(getVendorById(vendor.id).storefronts.some(({ slug }) => slug === "airport-outlet")).toBe(true);

  mockAuthState.vendor = getVendorById(vendor.id);
  await mount(<TeamPage />);
  await click(container.querySelector('[data-testid="add-employee-btn"]'));
  await input(container.querySelector('[data-testid="employee-name-input"]'), "New Teammate");
  await input(container.querySelector('[data-testid="employee-email-input"]'), "new@example.com");
  await input(container.querySelector('[data-testid="employee-password-input"]'), "password123");
  await click(container.querySelector('[data-testid="save-employee-btn"]'));
  expect(getVendorById(vendor.id).employees.some(({ email }) => email === "new@example.com")).toBe(true);

  createOrder({ vendorId: vendor.id, storefrontId: vendor.storefronts[0].id, total: 450, items: [] });
  mockAuthState.vendor = getVendorById(vendor.id);
  await mount(<InsightsPage />);
  expect(container.querySelector('[data-testid="insights-title"]')).not.toBeNull();
  expect(container.querySelector('[data-testid="insights-trend-chart"]')).not.toBeNull();
});

test("admin orders, bookings, configuration, and business management render persisted state", async () => {
  const restaurant = getVendorBySlug("pizza-hub");
  const salon = getVendorBySlug("style-salon");
  const order = createOrder({ vendorId: restaurant.id, total: 100, customer: { name: "Admin Order" } });
  const booking = createBooking({
    vendorId: salon.id, service: salon.services[0], date: "2026-08-01", slot: "10:00",
    customer: { name: "Admin Booking" },
  });

  await mount(<AdminOrdersPage />);
  expect(container.querySelector(`[data-testid="admin-order-row-${order.id}"]`)).not.toBeNull();
  await mount(<AdminBookingsPage />);
  expect(container.querySelector(`[data-testid="admin-booking-row-${booking.id}"]`)).not.toBeNull();

  await mount(<AdminLandingCMSPage />);
  await input(container.querySelector('[data-testid="cms-hero-eyebrow"]'), "Updated by admin");
  await click(container.querySelector('[data-testid="admin-cms-save"]'));
  await act(async () => jest.runAllTimers());
  expect(getLandingConfig().hero.eyebrow).toBe("Updated by admin");

  await mount(<AdminBusinessesPage />);
  expect(container.querySelector(`[data-testid="admin-vendor-row-${restaurant.id}"]`)).not.toBeNull();
  expect(container.querySelector(`[data-testid="admin-vendor-row-${salon.id}"]`)).not.toBeNull();
});
