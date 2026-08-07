import { STORAGE_KEYS } from "./storage";
import { getVendors, getVendorById, saveVendor, deleteVendor } from "./businessRepository";
import { getOrders, RESTAURANT_ORDER_STATUSES } from "./orderRepository";
import { getBookings, SALON_BOOKING_STATUSES } from "./bookingRepository";
import {
  FEATURE_CATALOG, PERSONAS, getLandingConfig, saveLandingConfig, resetLandingConfig,
  getPersonaMatrix, savePersonaMatrix, resetPersonaMatrix, updateVendorFeatures, updateVendorPlan,
} from "./configurationRepository";
import { seedIfNeeded } from "./seedData";

export const ADMIN_STORAGE_KEYS = Object.freeze({
  businesses: STORAGE_KEYS.vendors,
  orders: STORAGE_KEYS.orders,
  bookings: STORAGE_KEYS.bookings,
});
export {
  FEATURE_CATALOG, PERSONAS, RESTAURANT_ORDER_STATUSES, SALON_BOOKING_STATUSES,
  deleteVendor, getBookings, getLandingConfig, getOrders, getPersonaMatrix,
  getVendorById, getVendors, resetLandingConfig, resetPersonaMatrix,
  saveLandingConfig, savePersonaMatrix, saveVendor, seedIfNeeded,
  updateVendorFeatures, updateVendorPlan,
};
