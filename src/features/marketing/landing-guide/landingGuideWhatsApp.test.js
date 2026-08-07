import { createWhatsAppContactHref, normalizeWhatsAppNumber } from "./landingGuideWhatsApp";

test("normalizes an international WhatsApp number", () => {
  expect(normalizeWhatsAppNumber("+91 98765-43210")).toBe("919876543210");
});

test("rejects missing, short, and overlong numbers", () => {
  expect(normalizeWhatsAppNumber()).toBeNull();
  expect(normalizeWhatsAppNumber("1234567")).toBeNull();
  expect(normalizeWhatsAppNumber("1234567890123456")).toBeNull();
});

test("rejects malformed, leading-zero, and all-zero configurations", () => {
  expect(normalizeWhatsAppNumber("call 919876543210")).toBeNull();
  expect(normalizeWhatsAppNumber("+0919876543210")).toBeNull();
  expect(normalizeWhatsAppNumber("00000000")).toBeNull();
});

test("creates a secure wa.me link with an encoded predefined message", () => {
  expect(createWhatsAppContactHref("+91 98765 43210", "Help with food & salon"))
    .toBe("https://wa.me/919876543210?text=Help%20with%20food%20%26%20salon");
});

test("fails closed instead of creating a broken link", () => {
  expect(createWhatsAppContactHref("not configured")).toBeNull();
});
