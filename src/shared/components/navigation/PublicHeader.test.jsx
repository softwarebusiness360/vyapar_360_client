import React from "react";
import PublicHeader from "./PublicHeader";
import { componentContract, renderComponent } from "@/test/componentContract";
componentContract("PublicHeader", { happy: () => <PublicHeader />, empty: () => <PublicHeader />, alternate: () => <PublicHeader /> });

function renderHeader() {
  const container = document.createElement("div");
  container.innerHTML = renderComponent(<PublicHeader />);
  return container;
}

test("renders the approved uncluttered desktop navigation in order", () => {
  const container = renderHeader();
  const nav = container.querySelector('[data-testid="desktop-primary-nav"]');
  const labels = [...nav.querySelectorAll("a")].map((link) => link.textContent.trim());
  expect(labels).toEqual([
    "Features",
    "Pricing",
    "Business Types",
    "Business login",
    "Start free",
  ]);
});

test("removes customer, discovery, and top hamburger controls", () => {
  const container = renderHeader();
  expect(container.textContent).not.toMatch(/Customer sign-in|Discover Stores|Vendor sign in|Get started/);
  expect(container.querySelector('[data-testid="nav-toggle-top"]')).toBeNull();
  expect(container.querySelector('[data-testid="nav-toggle-floating"]')).not.toBeNull();
});

test("keeps a visible mobile Start free action and the existing floating menu", () => {
  const container = renderHeader();
  expect(container.querySelector('[data-testid="nav-register-mobile"]').textContent).toContain("Start free");
  expect(container.querySelector('[data-testid="nav-toggle-floating"]')).not.toBeNull();
  expect(container.querySelector('[data-testid="drawer-cta-register"]').textContent).toContain("Start free");
});
