import React, { createContext, useContext, useEffect, useState } from "react";
import * as repository from "@/data/authRepository";

/**
 * CustomerAuth — lightweight session for storefront visitors.
 * Two levels:
 *   - GUEST (name only): session lives in localStorage
 *   - REGISTERED (name + phone with mock OTP): also persisted to the
 *     customer DB and can be looked up cross-visits.
 */
const Ctx = createContext(null);
export const useCustomer = () => useContext(Ctx);

export function CustomerAuthProvider({ children }) {
  const { customerLogin: _login, customerLogout: _logout, getCustomerSession, getCustomerById, upgradeCustomerToPhone: _upgrade, MOCK_OTP } = repository;
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getCustomerSession();
    if (s && !s.guest && s.id) {
      const db = getCustomerById(s.id);
      setSession(db ? { ...s, ...db } : s);
    } else {
      setSession(s || null);
    }
    setLoading(false);
  }, []);

  const login = ({ name, phone, otp }) => {
    const c = _login({ name, phone, otp });
    setSession(c);
    return c;
  };
  const upgrade = ({ phone, otp }) => {
    const c = _upgrade({ phone, otp });
    setSession(c);
    return c;
  };
  const logout = () => {
    _logout();
    setSession(null);
  };

  return (
    <Ctx.Provider value={{ customer: session, loading, login, upgrade, logout, mockOtp: MOCK_OTP }}>
      {children}
    </Ctx.Provider>
  );
}
