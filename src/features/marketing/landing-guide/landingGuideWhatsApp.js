import { APP_CONFIG } from "@/config/appConfig";

const DEFAULT_MESSAGE = `Hi ${APP_CONFIG.brandName}, I need help choosing the right journey.`;

export function normalizeWhatsAppNumber(value) {
  const submitted = String(value || "").trim();
  if (!/^\+?[0-9][0-9 ()-]*$/.test(submitted)) return null;
  const digits = submitted.replace(/\D/g, "");
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}

export function createWhatsAppContactHref(number, message = DEFAULT_MESSAGE) {
  const normalizedNumber = normalizeWhatsAppNumber(number);
  if (!normalizedNumber) return null;
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}
