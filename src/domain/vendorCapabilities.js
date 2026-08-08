export const VENDOR_CAPABILITIES = Object.freeze(["insights", "stores", "team", "tableOrdering"]);

export const DEFAULT_VENDOR_CAPABILITIES = Object.freeze({
  insights: true,
  stores: false,
  team: false,
  tableOrdering: true,
});

export function normalizeVendorCapabilities(input, businessType = "restaurant") {
  const defaults = businessType === "restaurant"
    ? DEFAULT_VENDOR_CAPABILITIES
    : { ...DEFAULT_VENDOR_CAPABILITIES, tableOrdering: false };
  return VENDOR_CAPABILITIES.reduce((result, key) => {
    const value = input?.[key];
    result[key] = typeof value === "boolean" ? value : defaults[key];
    return result;
  }, {});
}

export function resolveVendorCapability({ vendor, employee, isOwner, capability, permission }) {
  if (!VENDOR_CAPABILITIES.includes(capability)) return false;
  const values = normalizeVendorCapabilities(vendor?.capabilities, vendor?.businessType);
  if (!values[capability]) return false;
  if (isOwner) return true;
  if (!employee || !permission) return false;
  return employee.permissions?.[permission] === true;
}
