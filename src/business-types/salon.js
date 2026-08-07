import SalonPOS from "@/features/vendor/salon/pos/SalonPOS";
import SalonServicesPage from "@/features/vendor/salon/services/SalonServicesPage";

export const salon = Object.freeze({
  id: "salon",
  capabilities: ["services", "slots", "bookings"],
  labels: { posTitle: "New booking" },
  vendor: { pos: SalonPOS, catalogue: SalonServicesPage },
});
