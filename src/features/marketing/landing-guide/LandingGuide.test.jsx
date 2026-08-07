import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import LandingGuide from "./LandingGuide";
import { createLandingGuideEventPort } from "./landingGuideEvents";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let container;
let root;

const byTestId = (id) => container.querySelector(`[data-testid="${id}"]`);
const click = async (element) => act(async () => element.dispatchEvent(
  new MouseEvent("click", { bubbles: true, cancelable: true }),
));
const key = async (element, value, shiftKey = false) => act(async () => element.dispatchEvent(
  new KeyboardEvent("keydown", { key: value, shiftKey, bubbles: true, cancelable: true }),
));
const mount = async (props = {}) => {
  root = createRoot(container);
  await act(async () => root.render(<MemoryRouter><LandingGuide {...props} /></MemoryRouter>));
};
const choose = async (business) => {
  await click(byTestId("landing-guide-launcher"));
  await click(byTestId(`landing-guide-option-${business}`));
};

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(async () => {
  if (root) await act(async () => root.unmount());
  container.remove();
  root = null;
  jest.restoreAllMocks();
});

test("renders a labelled closed launcher without a free-text field", async () => {
  await mount();
  const launcher = byTestId("landing-guide-launcher");
  expect(launcher.tagName).toBe("BUTTON");
  expect(launcher.getAttribute("aria-haspopup")).toBe("dialog");
  expect(launcher.className).toMatch(/bottom-5.*left-5.*right-auto.*lg:left-auto.*lg:right-5/);
  expect(launcher.className).toMatch(/h-14.*bg-gradient-to-r.*from-brand.*to-fuchsia-500/);
  expect(container.querySelector("input, textarea")).toBeNull();
});

test("shows a safe WhatsApp contact option when an international number is configured", async () => {
  const adapter = jest.fn();
  await mount({
    whatsappNumber: "+91 98765-43210",
    eventPort: createLandingGuideEventPort(adapter),
  });
  await click(byTestId("landing-guide-launcher"));
  const whatsapp = byTestId("landing-guide-whatsapp");
  expect(whatsapp.getAttribute("href")).toBe(
    "https://wa.me/919876543210?text=Hi%20Vyapar360%2C%20I%20need%20help%20choosing%20the%20right%20journey.",
  );
  expect(whatsapp.getAttribute("target")).toBe("_blank");
  expect(whatsapp.getAttribute("rel")).toBe("noreferrer");
  await click(whatsapp);
  expect(adapter).toHaveBeenCalledWith("chatbot_whatsapp_selected", {});
});

test("hides WhatsApp contact when its number is absent or invalid", async () => {
  await mount({ whatsappNumber: "not-configured" });
  await click(byTestId("landing-guide-launcher"));
  expect(byTestId("landing-guide-whatsapp")).toBeNull();
});

test("opens directly at business-type selection and focuses its heading", async () => {
  await mount();
  await click(byTestId("landing-guide-launcher"));
  const panel = byTestId("landing-guide-panel");
  expect(panel.getAttribute("aria-modal")).toBe("true");
  expect(panel.className).toMatch(/absolute.*bottom-0.*sm:right-5/);
  expect(panel.className).not.toMatch(/\bgrain\b/);
  expect(container.textContent).toContain("Automated guidance");
  expect(byTestId("landing-guide-heading").textContent).toContain("business do you run");
  expect(byTestId("landing-guide-option-customer")).toBeNull();
  expect(document.activeElement).toBe(byTestId("landing-guide-heading"));
});

test("completes the owner restaurant path with a semantic route link", async () => {
  await mount();
  await choose("restaurant");
  const action = byTestId("landing-guide-action-owner-restaurant-register");
  expect(byTestId("landing-guide-result").textContent).toContain("publish your menu");
  expect(action.tagName).toBe("A");
  expect(action.getAttribute("href")).toBe("/register");
});

test("shows a recoverable coming-soon result for salons", async () => {
  await mount();
  await choose("salon");
  expect(byTestId("landing-guide-heading").textContent).toContain("Salons are coming soon");
  expect(byTestId("landing-guide-unavailable").textContent).toContain("on our roadmap");
  expect(container.querySelector('[data-testid^="landing-guide-action-"]')).toBeNull();
});

test("Back and Start over restore earlier prompts and focus", async () => {
  await mount();
  await choose("salon");
  await click(byTestId("landing-guide-back"));
  expect(byTestId("landing-guide-heading").textContent).toContain("business do you run");
  expect(document.activeElement).toBe(byTestId("landing-guide-heading"));
  await click(byTestId("landing-guide-option-salon"));
  await click(byTestId("landing-guide-reset"));
  expect(byTestId("landing-guide-heading").textContent).toContain("business do you run");
});

test("Escape closes the guide, returns focus, and same-mount reopen resumes", async () => {
  await mount();
  await click(byTestId("landing-guide-launcher"));
  await click(byTestId("landing-guide-option-restaurant"));
  await key(byTestId("landing-guide-panel"), "Escape");
  expect(byTestId("landing-guide-panel")).toBeNull();
  expect(document.activeElement).toBe(byTestId("landing-guide-launcher"));
  await click(byTestId("landing-guide-launcher"));
  expect(byTestId("landing-guide-heading").textContent).toContain("food business");
});

test("traps Tab at panel boundaries and exposes responsive reduced-motion classes", async () => {
  await mount();
  await click(byTestId("landing-guide-launcher"));
  const close = byTestId("landing-guide-close");
  const focusable = byTestId("landing-guide-panel").querySelectorAll(
    "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
  );
  const last = focusable[focusable.length - 1];
  await key(byTestId("landing-guide-heading"), "Tab");
  expect(document.activeElement).toBe(close);
  last.focus();
  await key(last, "Tab");
  expect(document.activeElement).toBe(close);
  close.focus();
  await key(close, "Tab", true);
  expect(document.activeElement).toBe(last);
  expect(byTestId("landing-guide-panel").className).toMatch(/bottom-0.*sm:right-5/);
});

test("forward Tab targets Close initially and Back on result", async () => {
  await mount();
  await click(byTestId("landing-guide-launcher"));
  await key(byTestId("landing-guide-heading"), "Tab");
  expect(document.activeElement).toBe(byTestId("landing-guide-close"));

  await click(byTestId("landing-guide-option-restaurant"));
  await key(byTestId("landing-guide-heading"), "Tab");
  expect(document.activeElement).toBe(byTestId("landing-guide-back"));
});

test("forward Tab from an unavailable-state heading lands on Back", async () => {
  await mount({ actions: {} });
  await choose("salon");
  await key(byTestId("landing-guide-heading"), "Tab");
  expect(document.activeElement).toBe(byTestId("landing-guide-back"));
  await key(byTestId("landing-guide-panel"), "Escape");
  expect(document.activeElement).toBe(byTestId("landing-guide-launcher"));
});

test("fails closed for an unavailable action without persistence or network calls", async () => {
  const storageSpy = jest.spyOn(Storage.prototype, "setItem");
  const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({});
  await mount({ actions: {} });
  await choose("restaurant");
  expect(byTestId("landing-guide-unavailable")).not.toBeNull();
  expect(container.querySelector('[data-testid^="landing-guide-action-"]')).toBeNull();
  expect(storageSpy).not.toHaveBeenCalled();
  expect(fetchSpy).not.toHaveBeenCalled();
});
