import { uid } from "../lib/utils";
import { read, write, STORAGE_KEYS as KEYS } from "./storage";
import { DEFAULT_BOOKING_FIELDS, normalizeChannel } from "./modelDefaults";
import { getVendorBySlug } from "./businessRepository";
import { seedIfNeeded } from "./seedData";

export const BOOKING_STORAGE_KEY = KEYS.bookings;
export const getAllowedStorefronts = (vendor, employee) => {
  if (!vendor) return [];
  if (!employee) return vendor.storefronts || [];
  return (vendor.storefronts || []).filter(({ id }) => employee.storefrontIds.includes(id));
};
const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"];
export const SALON_BOOKING_STATUSES = BOOKING_STATUSES;

export function getBookings(vendorId) {
  const all = read(KEYS.bookings, []);
  return vendorId ? all.filter((b) => b.vendorId === vendorId) : all;
}
export function createBooking(booking) {
  const all = read(KEYS.bookings, []);
  const code =
    "BKG-" +
    Math.floor(1000 + Math.random() * 9000).toString();
  const b = {
    id: uid("bkg"),
    code,
    status: "confirmed",
    channel: normalizeChannel(booking.channel),
    createdAt: new Date().toISOString(),
    ...booking,
    channel: normalizeChannel(booking.channel),
  };
  all.unshift(b);
  write(KEYS.bookings, all);
  return b;
}
export function updateBookingStatus(bookingId, status) {
  const all = read(KEYS.bookings, []);
  const idx = all.findIndex((b) => b.id === bookingId);
  if (idx >= 0) {
    all[idx].status = status;
    write(KEYS.bookings, all);
    return all[idx];
  }
  return null;
}

/* --------------------------- Slots -------------------------------- */

export function getSlotsForDate(vendorId, dateISO) {
  // Fixed 10:00 - 19:00, 30 min slots. Filter out booked slots.
  const slots = [];
  for (let h = 10; h < 19; h++) {
    for (const m of [0, 30]) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  const booked = getBookings(vendorId)
    .filter((b) => b.date === dateISO && b.status !== "cancelled")
    .map((b) => b.slot);
  return slots.map((s) => ({ time: s, available: !booked.includes(s) }));
}
export { DEFAULT_BOOKING_FIELDS, getVendorBySlug, seedIfNeeded };
