import { normalizeVendorCapabilities, resolveVendorCapability } from "./vendorCapabilities";

test("normalizes safe restaurant capability defaults", () => expect(normalizeVendorCapabilities(null, "restaurant")).toEqual({ insights: true, stores: false, team: false, tableOrdering: true }));
test("salons never receive table ordering by default", () => expect(normalizeVendorCapabilities(null, "salon").tableOrdering).toBe(false));
test("unknown capability names fail closed", () => expect(resolveVendorCapability({ vendor: {}, isOwner: true, capability: "magic" })).toBe(false));
test("disabled capability blocks owners", () => expect(resolveVendorCapability({ vendor: { businessType: "restaurant", capabilities: { insights: false } }, isOwner: true, capability: "insights" })).toBe(false));
test("enabled capability still requires employee permission", () => expect(resolveVendorCapability({ vendor: { businessType: "restaurant", capabilities: { insights: true } }, employee: { permissions: { viewInsights: false } }, capability: "insights", permission: "viewInsights" })).toBe(false));
test("enabled capability and permission allow employees", () => expect(resolveVendorCapability({ vendor: { businessType: "restaurant", capabilities: { insights: true } }, employee: { permissions: { viewInsights: true } }, capability: "insights", permission: "viewInsights" })).toBe(true));
