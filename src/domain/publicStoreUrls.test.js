import { buildStorefrontUrl, buildTableUrl, createQrSvgDataUrl, resolveTableContext } from "./publicStoreUrls";
import { TextEncoder } from "util";

global.TextEncoder = TextEncoder;

const vendor = { slug: "cafe", capabilities: { tableOrdering: true }, orderMode: "both", storefronts: [{ id: "sf1" }], tables: [{ id: "t1", storefrontId: "sf1", label: "Table 1" }] };
test("builds canonical table-free URL", () => expect(buildStorefrontUrl("https://app.test/", "cafe")).toBe("https://app.test/store/cafe"));
test("builds validated table URL", () => expect(buildTableUrl("https://app.test", vendor, "t1")).toBe("https://app.test/store/cafe?table=t1"));
test("rejects removed table", () => expect(resolveTableContext(vendor, "removed")).toMatchObject({ ok: false }));
test("rejects table when mode is counter", () => expect(resolveTableContext({ ...vendor, orderMode: "counter" }, "t1")).toMatchObject({ ok: false }));
test("allows general link without table", () => expect(resolveTableContext(vendor, null)).toEqual({ ok: true, table: null }));
test("QR adapter creates a reusable image without customer data", async () => { const result = await createQrSvgDataUrl("https://app.test/store/cafe"); expect(result).toContain("data:image/png;base64"); expect(result.length).toBeGreaterThan(100); });
