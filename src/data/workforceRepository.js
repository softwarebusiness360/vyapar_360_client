import { uid } from "../lib/utils";
import { getVendorByEmail, getVendorById, getVendors, saveVendor } from "./businessRepository";
import { getPlanConfig, ROLES, ROLE_PRESETS } from "./modelDefaults";
import { getVendorTransactions, computeKPIs } from "./analyticsRepository";
import { STORAGE_KEYS as KEYS } from "./storage";

export const WORKFORCE_STORAGE_KEY = KEYS.vendors;
export function getEmployees(vendorId) {
  const v = getVendorById(vendorId);
  return v?.employees || [];
}
export function getEmployeeById(vendorId, empId) {
  return getEmployees(vendorId).find((e) => e.id === empId) || null;
}
export function getEmployeeByEmail(email) {
  const needle = (email || "").toLowerCase();
  for (const v of getVendors()) {
    const emp = (v.employees || []).find((e) => e.email.toLowerCase() === needle);
    if (emp) return { vendor: v, employee: emp };
  }
  return null;
}
export function addEmployee(vendorId, employee) {
  const v = getVendorById(vendorId);
  if (!v) throw new Error("Vendor not found");
  const planCfg = getPlanConfig(v.plan);
  if (!planCfg.employees) {
    throw new Error(`Your ${planCfg.label} plan doesn't include team members. Upgrade to invite employees.`);
  }
  if ((v.employees?.length || 0) >= planCfg.maxEmployees) {
    throw new Error(`Your ${planCfg.label} plan allows up to ${planCfg.maxEmployees} employees.`);
  }
  if (getEmployeeByEmail(employee.email)) throw new Error("An account with this email already exists.");
  if (getVendorByEmail(employee.email)) throw new Error("An account with this email already exists.");
  const role = ROLES.includes(employee.role) && employee.role !== "owner" ? employee.role : "employee";
  const emp = {
    id: uid("emp"),
    email: employee.email,
    password: employee.password,
    name: employee.name || "",
    role,
    storefrontIds: employee.storefrontIds || [],
    permissions: { ...ROLE_PRESETS[role], ...(employee.permissions || {}) },
    disabled: false,
    createdAt: new Date().toISOString(),
  };
  saveVendor({ ...v, employees: [...v.employees, emp] });
  return emp;
}
export function updateEmployee(vendorId, empId, patch) {
  const v = getVendorById(vendorId);
  if (!v) return null;
  const employees = v.employees.map((e) => (e.id === empId ? { ...e, ...patch } : e));
  saveVendor({ ...v, employees });
  return employees.find((e) => e.id === empId);
}
export function deleteEmployee(vendorId, empId) {
  const v = getVendorById(vendorId);
  if (!v) return;
  saveVendor({ ...v, employees: v.employees.filter((e) => e.id !== empId) });
}

/* ------------------ Feature flags (Pro-plan gating) ----------------- */
export function getEmployeePerformance(vendorId, { from, to, storefrontIds } = {}) {
  const v = getVendorById(vendorId);
  if (!v) return [];
  const employees = v.employees || [];
  const { orders, bookings } = getVendorTransactions(vendorId, { storefrontIds, from, to });
  return employees.map((emp) => {
    const empOrders = orders.filter((o) => o.employeeId === emp.id);
    const empBookings = bookings.filter((b) => b.employeeId === emp.id);
    const kpis = computeKPIs({ orders: empOrders, bookings: empBookings });
    const assignedStores = (v.storefronts || []).filter((s) => emp.storefrontIds.includes(s.id));
    return { employee: emp, assignedStores, ...kpis };
  });
}

/**
 * Storefronts an employee is allowed to operate on. Owners see all.
 */
export function getAllowedStorefronts(vendor, employee) {
  if (!vendor) return [];
  if (!employee) return vendor.storefronts || [];
  return (vendor.storefronts || []).filter((s) => employee.storefrontIds.includes(s.id));
}
export { ROLE_PRESETS };
