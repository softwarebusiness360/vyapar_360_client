export const ORDER_MODES = Object.freeze(["counter", "table", "both"]);
export const ORDER_STATUSES = Object.freeze(["new", "preparing", "ready", "completed", "cancelled"]);
export const ACTIVE_ORDER_STATUSES = Object.freeze(["new", "preparing", "ready"]);

const LEGACY_STATUS = Object.freeze({ pending: "new", delivered: "completed" });

export const normalizeOrderMode = (mode) => ORDER_MODES.includes(mode) ? mode : "counter";
export const normalizeOrderStatus = (status) => ORDER_STATUSES.includes(status) ? status : (LEGACY_STATUS[status] || "new");

export function normalizeRestaurantOrder(order) {
  const source = order?.source === "table" ? "table" : "counter";
  return {
    ...order,
    status: normalizeOrderStatus(order?.status),
    source,
    tableId: source === "table" && typeof order?.tableId === "string" ? order.tableId : null,
    tableLabel: source === "table" && typeof order?.tableLabel === "string" ? order.tableLabel : null,
    tableClosedAt: order?.tableClosedAt || null,
  };
}

export function canTransitionOrder(current, next) {
  const from = normalizeOrderStatus(current);
  const to = normalizeOrderStatus(next);
  const sequence = ["new", "preparing", "ready", "completed"];
  return sequence.indexOf(to) === sequence.indexOf(from) + 1;
}

export const canCancelOrder = (status) => ["new", "preparing", "ready"].includes(normalizeOrderStatus(status));
export const canAddItems = (status) => ["new", "preparing"].includes(normalizeOrderStatus(status));

export function calculateOrderTotals(items, taxRate = 0.05) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
  const tax = Math.round(subtotal * taxRate);
  return { subtotal, tax, total: subtotal + tax };
}
