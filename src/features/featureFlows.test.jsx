import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RestaurantPOS from "./vendor/restaurant/pos/RestaurantPOS";
import SalonPOS from "./vendor/salon/pos/SalonPOS";
import CheckoutPage from "./customer/restaurant/checkout/CheckoutPage";
import BookingFlowPage from "./customer/salon/booking/BookingFlowPage";
import AdminBusinessesPage from "./admin/businesses/AdminBusinessesPage";
import { getOrders } from "@/data/orderRepository";
import { getBookings } from "@/data/bookingRepository";
import { getVendorBySlug } from "@/data/businessRepository";
import { seedIfNeeded } from "@/data/authRepository";

let container;
let root;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const render = async (element) => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(element));
  await act(async () => {});
};
const click = async (element) => act(async () => element.dispatchEvent(new MouseEvent("click", { bubbles: true })));
const input = async (element, value) => act(async () => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  setter.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
});

beforeEach(() => {
  localStorage.clear();
  jest.useFakeTimers();
});
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  container?.remove();
  root = null;
  jest.useRealTimers();
});

test("vendor restaurant POS creates an order through the UI", async () => {
  const storefront = { id: "sf-r", items: [{ id: "pizza", name: "Pizza", price: 200, available: true }] };
  await render(<RestaurantPOS storefront={storefront} vendorId="restaurant-1" />);
  await click(container.querySelector('[data-testid="pos-item-pizza"]'));
  await click(container.querySelector('[data-testid="pos-place-order-btn"]'));
  expect(container.querySelector('[data-testid="restaurant-pos-complete"]')).not.toBeNull();
  expect(getOrders("restaurant-1")).toHaveLength(1);
});

test("vendor salon POS creates a booking through the UI", async () => {
  const storefront = {
    id: "sf-s",
    services: [{ id: "cut", name: "Haircut", price: 500, duration: 30, available: true }],
  };
  await render(<SalonPOS storefront={storefront} vendorId="salon-1" />);
  await click(container.querySelector('[data-testid="pos-service-cut"]'));
  const slot = container.querySelector('[data-testid^="pos-slot-"]:not([disabled])');
  await click(slot);
  await click(container.querySelector('[data-testid="pos-confirm-booking-btn"]'));
  expect(container.querySelector('[data-testid="salon-pos-complete"]')).not.toBeNull();
  expect(getBookings("salon-1")).toHaveLength(1);
});

test("customer restaurant checkout persists an order from the rendered flow", async () => {
  seedIfNeeded();
  const vendor = getVendorBySlug("pizza-hub");
  localStorage.setItem("vyapar360.cart.pizza-hub", JSON.stringify([
    { id: vendor.items[0].id, name: vendor.items[0].name, price: vendor.items[0].price, qty: 1 },
  ]));
  await render(
    <MemoryRouter initialEntries={["/store/pizza-hub/checkout"]}>
      <Routes><Route path="/store/:slug/checkout" element={<CheckoutPage />} /></Routes>
    </MemoryRouter>
  );
  for (const element of container.querySelectorAll('[data-testid^="checkout-"][data-testid$="-input"]')) {
    await input(element, element.dataset.testid.includes("phone") ? "9000000001" : "Customer");
  }
  await click(container.querySelector('[data-testid="place-order-btn"]'));
  await act(async () => jest.runAllTimers());
  expect(getOrders(vendor.id).some(({ customer }) => customer.phone === "9000000001")).toBe(true);
});

test("customer salon booking and admin business directory execute against persisted data", async () => {
  seedIfNeeded();
  const vendor = getVendorBySlug("style-salon");
  const service = vendor.services[0];
  await render(
    <MemoryRouter initialEntries={[`/store/style-salon/book/${service.id}`]}>
      <Routes>
        <Route path="/store/:slug/book/:serviceId" element={<BookingFlowPage />} />
        <Route path="/store/:slug/booking/:bookingId" element={<div data-testid="booking-destination" />} />
      </Routes>
    </MemoryRouter>
  );
  await click(container.querySelector('[data-testid^="slot-"]:not([disabled])'));
  await click(container.querySelector('[data-testid="booking-next-btn"]'));
  for (const element of container.querySelectorAll('[data-testid^="booking-"][data-testid$="-input"]')) {
    await input(element, element.dataset.testid.includes("phone") ? "9000000002" : "Customer");
  }
  await click(container.querySelector('[data-testid="confirm-booking-btn"]'));
  await act(async () => jest.runAllTimers());
  expect(getBookings(vendor.id).some(({ customer }) => customer.phone === "9000000002")).toBe(true);

  await act(async () => root.unmount());
  root = createRoot(container);
  await act(async () => root.render(
    <MemoryRouter><AdminBusinessesPage /></MemoryRouter>
  ));
  expect(container.querySelector(`[data-testid="admin-vendor-row-${vendor.id}"]`)).not.toBeNull();
});

test("customer checkout rejects an invalid contact phone before persistence", async () => {
  seedIfNeeded();
  const vendor = getVendorBySlug("pizza-hub");
  const before = getOrders(vendor.id).length;
  localStorage.setItem("vyapar360.cart.pizza-hub", JSON.stringify([
    { id: vendor.items[0].id, name: vendor.items[0].name, price: vendor.items[0].price, qty: 1 },
  ]));
  await render(
    <MemoryRouter initialEntries={["/store/pizza-hub/checkout"]}>
      <Routes><Route path="/store/:slug/checkout" element={<CheckoutPage />} /></Routes>
    </MemoryRouter>
  );
  for (const element of container.querySelectorAll('[data-testid^="checkout-"][data-testid$="-input"]')) {
    await input(element, element.dataset.testid.includes("phone") ? "12abc" : "Customer");
  }
  expect(container.querySelector('[data-testid="checkout-phone-input"]').value).toBe("12");
  await click(container.querySelector('[data-testid="place-order-btn"]'));
  await act(async () => jest.runAllTimers());
  expect(getOrders(vendor.id)).toHaveLength(before);
});

test("customer booking strips alphabetic contact input before persistence", async () => {
  seedIfNeeded();
  const vendor = getVendorBySlug("style-salon");
  const service = vendor.services[0];
  const before = getBookings(vendor.id).length;
  await render(
    <MemoryRouter initialEntries={[`/store/style-salon/book/${service.id}`]}>
      <Routes><Route path="/store/:slug/book/:serviceId" element={<BookingFlowPage />} /></Routes>
    </MemoryRouter>
  );
  await click(container.querySelector('[data-testid^="slot-"]:not([disabled])'));
  await click(container.querySelector('[data-testid="booking-next-btn"]'));
  for (const element of container.querySelectorAll('[data-testid^="booking-"][data-testid$="-input"]')) {
    await input(element, element.dataset.testid.includes("phone") ? "invalid" : "Customer");
  }
  expect(container.querySelector('[data-testid="booking-phone-input"]').value).toBe("");
  await click(container.querySelector('[data-testid="confirm-booking-btn"]'));
  await act(async () => jest.runAllTimers());
  const bookings = getBookings(vendor.id);
  expect(bookings).toHaveLength(before + 1);
  expect(bookings[0].customer.phone).toBe("");
});
