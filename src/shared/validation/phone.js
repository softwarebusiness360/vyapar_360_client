export function normalizePhone(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

export function sanitizePhoneInput(value) {
  return String(value || "").replace(/[^\d+()\-\s]/g, "");
}

export function isValidPhone(value) {
  const digits = normalizePhone(value);
  return digits.length >= 10 && digits.length <= 15;
}
