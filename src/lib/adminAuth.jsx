import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  getAdminByEmail,
  getAdminById,
  getAdminSession,
  setAdminSession,
  clearAdminSession,
  seedIfNeeded,
} from "./store";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedIfNeeded();
    const s = getAdminSession();
    if (s?.adminId) {
      const a = getAdminById(s.adminId);
      if (a) setAdmin(a);
      else clearAdminSession();
    }
    setLoading(false);
  }, []);

  const login = useCallback((email, password) => {
    const a = getAdminByEmail(email);
    if (!a) throw new Error("No admin account found with that email.");
    if (a.password !== password) throw new Error("Incorrect password.");
    setAdminSession({ email: a.email, adminId: a.id });
    setAdmin(a);
    return a;
  }, []);

  const logout = useCallback(() => {
    clearAdminSession();
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
