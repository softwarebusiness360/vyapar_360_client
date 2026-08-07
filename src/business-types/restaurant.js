import RestaurantPOS from "@/features/vendor/restaurant/pos/RestaurantPOS";
import RestaurantCataloguePage from "@/features/vendor/restaurant/catalogue/RestaurantCataloguePage";

export const restaurant = Object.freeze({
  id: "restaurant",
  capabilities: ["catalogue", "pos", "orders", "checkout"],
  labels: { posTitle: "New order" },
  vendor: { pos: RestaurantPOS, catalogue: RestaurantCataloguePage },
});
