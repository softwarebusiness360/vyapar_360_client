import { uid } from "../lib/utils";
import { read, write, remove, STORAGE_KEYS as KEYS } from "./storage";
import { createVendor, getVendorByEmail, getVendorById, saveVendor } from "./businessRepository";
import { seedIfNeeded } from "./seedData";
import { getEmployeeByEmail } from "./workforceRepository";
import { isValidPhone, normalizePhone } from "@/shared/validation/phone";

export const SESSION_STORAGE_KEY = KEYS.session;
export const ADMIN_SESSION_STORAGE_KEY = KEYS.adminSession;
export const CUSTOMER_SESSION_STORAGE_KEY = KEYS.customerSession;
export function getSession() {
  return read(KEYS.session, null);
}
export function setSession(session) {
  write(KEYS.session, session);
}
export function clearSession() {
  localStorage.removeItem(KEYS.session);
}
export function getAdmins() {
  return read(KEYS.admins, []);
}
export function getAdminByEmail(email) {
  return getAdmins().find((a) => a.email.toLowerCase() === (email || "").toLowerCase()) || null;
}
export function getAdminById(id) {
  return getAdmins().find((a) => a.id === id) || null;
}
export function getAdminSession() {
  return read(KEYS.adminSession, null);
}
export function setAdminSession(s) {
  write(KEYS.adminSession, s);
}
export function clearAdminSession() {
  localStorage.removeItem(KEYS.adminSession);
}
export const MOCK_OTP = "1234";

export function getCustomers() {
  return read(KEYS.customers, []);
}
export function getCustomerByPhone(phone) {
  if (!phone) return null;
  return getCustomers().find((c) => c.phone === phone) || null;
}
export function getCustomerById(id) {
  return getCustomers().find((c) => c.id === id) || null;
}
export function saveCustomer(customer) {
  const all = getCustomers();
  const idx = all.findIndex((c) => c.id === customer.id);
  if (idx >= 0) all[idx] = customer;
  else all.push(customer);
  write(KEYS.customers, all);
  return customer;
}

/**
 * Create or upgrade the current customer session. If only `name` is passed
 * we keep a lightweight guest session (localStorage only, not in the DB).
 * If `phone` + OTP are provided (and OTP is valid) we upsert into the DB.
 */
export function customerLogin({ name, phone, otp }) {
  const cleanName = (name || "").trim();
  if (!cleanName) throw new Error("Enter your name to continue.");

  if (phone) {
    if (!isValidPhone(phone)) throw new Error("Enter a valid phone number.");
    if (!otp) throw new Error("Enter the OTP sent to your phone.");
    if (otp.trim() !== MOCK_OTP && otp.trim().length < 4) {
      throw new Error(`Invalid OTP. For demo, use ${MOCK_OTP}.`);
    }
    const cleanPhone = normalizePhone(phone);
    const existing = getCustomerByPhone(cleanPhone);
    const now = new Date().toISOString();
    const customer = existing
      ? { ...existing, name: cleanName, lastActiveAt: now }
      : { id: uid("cust"), name: cleanName, phone: cleanPhone, createdAt: now, lastActiveAt: now };
    saveCustomer(customer);
    write(KEYS.customerSession, { id: customer.id, name: customer.name, phone: customer.phone, guest: false });
    return customer;
  }

  // Guest — name only, session lives in localStorage
  const guest = { id: "guest_" + Date.now(), name: cleanName, guest: true };
  write(KEYS.customerSession, guest);
  return guest;
}

export function getCustomerSession() {
  return read(KEYS.customerSession, null);
}
export function customerLogout() {
  localStorage.removeItem(KEYS.customerSession);
}

/** Save phone (post-login upgrade for guests). */
export function upgradeCustomerToPhone({ phone, otp }) {
  const session = getCustomerSession();
  if (!session) throw new Error("No active customer session.");
  if (!phone) throw new Error("Phone is required.");
  if (!isValidPhone(phone)) throw new Error("Enter a valid phone number.");
  if (!otp || (otp.trim() !== MOCK_OTP && otp.trim().length < 4)) {
    throw new Error(`Invalid OTP. For demo, use ${MOCK_OTP}.`);
  }
  const cleanPhone = normalizePhone(phone);
  const existing = getCustomerByPhone(cleanPhone);
  const now = new Date().toISOString();
  const customer = existing
    ? { ...existing, name: session.name, lastActiveAt: now }
    : { id: uid("cust"), name: session.name, phone: cleanPhone, createdAt: now, lastActiveAt: now };
  saveCustomer(customer);
  write(KEYS.customerSession, { id: customer.id, name: customer.name, phone: customer.phone, guest: false });
  return customer;
}

/**
 * Fetch a customer's orders/bookings. Matches by `customerId` OR falls back
 * to phone/name for legacy records that pre-date the customer DB.
 */
export function getCustomerTransactions({ id, phone, name }) {
  const matches = (rec) => {
    if (id && rec.customerId === id) return true;
    if (phone && rec.customer?.phone === phone) return true;
    if (name && !phone && rec.customer?.name === name) return true;
    return false;
  };
  const orders = read(KEYS.orders, []).filter(matches);
  const bookings = read(KEYS.bookings, []).filter(matches);
  return { orders, bookings };
}
export { createVendor, getEmployeeByEmail, getVendorByEmail, getVendorById, saveVendor, seedIfNeeded };
