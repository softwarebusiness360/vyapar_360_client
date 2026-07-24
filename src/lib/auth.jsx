import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  createVendor,
  getSession,
  getVendorByEmail,
  getVendorById,
  saveVendor,
  setSession,
  clearSession,
  seedIfNeeded,
} from "./store";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedIfNeeded();
    const s = getSession();
    if (s?.vendorId) {
      const v = getVendorById(s.vendorId);
      if (v) setVendor(v);
      else clearSession();
    }
    setLoading(false);
  }, []);

  const login = useCallback((email, password) => {
    const v = getVendorByEmail(email);
    if (!v) throw new Error("No account found with that email.");
    if (v.password !== password) throw new Error("Incorrect password.");
    setSession({ email: v.email, vendorId: v.id });
    setVendor(v);
    return v;
  }, []);

  const register = useCallback((email, password) => {
    const v = createVendor({ email, password });
    setSession({ email: v.email, vendorId: v.id });
    setVendor(v);
    return v;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setVendor(null);
  }, []);

  const refresh = useCallback(() => {
    const s = getSession();
    if (!s?.vendorId) return;
    const v = getVendorById(s.vendorId);
    if (v) setVendor({ ...v });
  }, []);

  const updateVendor = useCallback((patch) => {
    setVendor((prev) => {
      const next = { ...prev, ...patch };
      saveVendor(next);
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ vendor, loading, login, register, logout, refresh, updateVendor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
