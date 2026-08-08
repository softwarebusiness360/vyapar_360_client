import { normalizeOrderStatus } from "./restaurantOrders";

export function createNumberedTables(storefrontId, count, existing = []) {
  if (!Number.isInteger(count) || count < 1) return { ok: false, error: "Enter a positive whole number of tables." };
  const retained = existing.slice(0, count);
  const tables = [...retained];
  for (let number = tables.length + 1; number <= count; number += 1) {
    tables.push({ id: `${storefrontId}-table-${number}`, storefrontId, number, label: `Table ${number}` });
  }
  return { ok: true, tables };
}

export function getTableState(table, orders) {
  const associated = orders
    .filter((order) => order.tableId === table.id && !order.tableClosedAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  if (!associated) return { state: "free", order: null };
  const status = normalizeOrderStatus(associated.status);
  if (["completed", "cancelled"].includes(status)) return { state: "ready_to_close", order: associated };
  return { state: "occupied", order: associated };
}

export function resizeTables({ storefrontId, count, tables, orders }) {
  if (!Number.isInteger(count) || count < 1) return { ok: false, error: "Enter a positive whole number of tables." };
  if (count >= tables.length) return createNumberedTables(storefrontId, count, tables);
  const candidates = tables.slice(count);
  const blocking = candidates.filter((table) => getTableState(table, orders).state !== "free");
  if (blocking.length) return { ok: false, error: `Close ${blocking.map((table) => table.label).join(", ")} before reducing tables.`, blocking };
  return { ok: true, tables: tables.slice(0, count), removed: candidates };
}
