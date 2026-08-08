import { calculateOrderTotals, canAddItems, canCancelOrder, canTransitionOrder, normalizeOrderMode, normalizeRestaurantOrder } from "./restaurantOrders";

test("legacy order vocabulary normalizes without mutation", () => { const raw = { status: "pending" }; expect(normalizeRestaurantOrder(raw).status).toBe("new"); expect(raw.status).toBe("pending"); });
test("legacy delivered becomes completed", () => expect(normalizeRestaurantOrder({ status: "delivered" }).status).toBe("completed"));
test("unknown mode uses counter fallback", () => expect(normalizeOrderMode("spaceship")).toBe("counter"));
test("lifecycle only moves one step forward", () => { expect(canTransitionOrder("new", "preparing")).toBe(true); expect(canTransitionOrder("new", "ready")).toBe(false); expect(canTransitionOrder("completed", "ready")).toBe(false); });
test("cancellation is separate and terminal", () => { expect(canCancelOrder("ready")).toBe(true); expect(canCancelOrder("completed")).toBe(false); });
test("items can only be added early", () => { expect(canAddItems("preparing")).toBe(true); expect(canAddItems("ready")).toBe(false); });
test("totals are recalculated consistently", () => expect(calculateOrderTotals([{ price: 100, qty: 2 }])).toEqual({ subtotal: 200, tax: 10, total: 210 }));
