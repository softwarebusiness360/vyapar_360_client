import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as repository from "@/data/authRepository";

const AuthContext = createContext(null);

/**
 * Shared login for owners and employees.
 *  - Owner (vendor account): session = { vendorId, role: "owner" }
 *  - Employee (staff of a vendor): session = { vendorId, employeeId, role: "employee" }
 * All UI reads `vendor` (workspace) + `employee` (null for owners) + `role`.
 */
export function AuthProvider({ children }) {
  const { createVendor, getSession, getVendorByEmail, getVendorById, saveVendor, setSession, clearSession, seedIfNeeded, getEmployeeByEmail } = repository;
  const [vendor, setVendor] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [role, setRole] = useState(null); // "owner" | "employee" | null
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(() => {
    const s = getSession();
    if (!s) {
      setVendor(null); setEmployee(null); setRole(null);
      return;
    }
    if (s.role === "employee" && s.employeeId) {
      const v = getVendorById(s.vendorId);
      const emp = v?.employees?.find((e) => e.id === s.employeeId);
      if (v && emp && !emp.disabled) {
        setVendor(v); setEmployee(emp); setRole("employee");
        return;
      }
    } else if (s.vendorId) {
      const v = getVendorById(s.vendorId);
      if (v) { setVendor(v); setEmployee(null); setRole("owner"); return; }
    }
    clearSession();
    setVendor(null); setEmployee(null); setRole(null);
  }, []);

  useEffect(() => {
    seedIfNeeded();
    hydrate();
    setLoading(false);
  }, [hydrate]);

  const login = useCallback((email, password) => {
    // Try vendor owner first
    const v = getVendorByEmail(email);
    if (v && v.password === password) {
      setSession({ email: v.email, vendorId: v.id, role: "owner" });
      setVendor(v); setEmployee(null); setRole("owner");
      return { vendor: v, employee: null, role: "owner" };
    }
    // Try employee
    const empHit = getEmployeeByEmail(email);
    if (empHit && empHit.employee.password === password) {
      if (empHit.employee.disabled) throw new Error("Your account is disabled. Contact your owner.");
      setSession({ email: empHit.employee.email, vendorId: empHit.vendor.id, employeeId: empHit.employee.id, role: "employee" });
      setVendor(empHit.vendor); setEmployee(empHit.employee); setRole("employee");
      return { vendor: empHit.vendor, employee: empHit.employee, role: "employee" };
    }
    if (!v && !empHit) throw new Error("No account found with that email.");
    throw new Error("Incorrect password.");
  }, []);

  const register = useCallback((email, password) => {
    const v = createVendor({ email, password });
    setSession({ email: v.email, vendorId: v.id, role: "owner" });
    setVendor(v); setEmployee(null); setRole("owner");
    return v;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setVendor(null); setEmployee(null); setRole(null);
  }, []);

  const refresh = useCallback(() => hydrate(), [hydrate]);

  const updateVendor = useCallback((patch) => {
    setVendor((prev) => {
      const next = { ...prev, ...patch };
      saveVendor(next);
      return next;
    });
  }, []);

  const isOwner = role === "owner";
  const isEmployee = role === "employee";

  return (
    <AuthContext.Provider value={{ vendor, employee, role, isOwner, isEmployee, loading, login, register, logout, refresh, updateVendor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
