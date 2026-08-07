import { isValidPhone, normalizePhone, sanitizePhoneInput } from "./phone";

test("normalizes formatted phone numbers", () => {
  expect(normalizePhone("+91 98765-43210")).toBe("919876543210");
});

test("accepts valid local and international phone numbers", () => {
  expect(isValidPhone("9876543210")).toBe(true);
  expect(isValidPhone("+91 98765 43210")).toBe(true);
});

test("removes alphabetic characters from phone input", () => {
  expect(sanitizePhoneInput("+91 98abc765-43210")).toBe("+91 98765-43210");
});

test("rejects empty, alphabetic, short, and overlong phone numbers", () => {
  expect(isValidPhone("")).toBe(false);
  expect(isValidPhone("phone-number")).toBe(false);
  expect(isValidPhone("12345")).toBe(false);
  expect(isValidPhone("1234567890123456")).toBe(false);
});
