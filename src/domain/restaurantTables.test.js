import { createNumberedTables, getTableState, resizeTables } from "./restaurantTables";

test("rejects invalid table counts", () => expect(createNumberedTables("sf", 1.5)).toMatchObject({ ok: false }));
test("creates stable numbered tables", () => { const first = createNumberedTables("sf", 2).tables; expect(createNumberedTables("sf", 3, first).tables.slice(0, 2)).toEqual(first); });
test("derives free state from no association", () => expect(getTableState({ id: "t1" }, [])).toMatchObject({ state: "free" }));
test("derives occupied from active order", () => expect(getTableState({ id: "t1" }, [{ tableId: "t1", status: "new", createdAt: "2026-01-01" }]).state).toBe("occupied"));
test("derives ready to close from completed order", () => expect(getTableState({ id: "t1" }, [{ tableId: "t1", status: "completed", createdAt: "2026-01-01" }]).state).toBe("ready_to_close"));
test("blocks reduction when trailing table is occupied", () => { const tables = createNumberedTables("sf", 2).tables; expect(resizeTables({ storefrontId: "sf", count: 1, tables, orders: [{ tableId: tables[1].id, status: "ready" }] })).toMatchObject({ ok: false }); });
test("removes only free trailing tables", () => { const tables = createNumberedTables("sf", 3).tables; expect(resizeTables({ storefrontId: "sf", count: 1, tables, orders: [] }).removed).toHaveLength(2); });
