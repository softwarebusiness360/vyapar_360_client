import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

/**
 * ThemeProvider — a single source of truth for dark/light preference.
 *
 *  - Reads system preference on first paint (respects the user's OS).
 *  - Overridden by an explicit user choice, persisted in localStorage.
 *  - Applies `data-theme="dark|light"` on <html>. Every CSS variable in
 *    index.css keys off that attribute, so every consumer flips at once.
 */

const KEY = "vyapar360.theme";
const Ctx = createContext(null);
export const useTheme = () => useContext(Ctx);

function readInitial() {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem(KEY);
  if (saved === "dark" || saved === "light") return saved;
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
  return prefersLight ? "light" : "dark";
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => readInitial());

  // Apply to <html> whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // Also set color-scheme so the browser inverts native UI (scrollbars, form controls)
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
  }, []);

  const toggle = useCallback(() => {
    setThemeState((t) => {
      const next = t === "dark" ? "light" : "dark";
      try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
      return next;
    });
  }, []);

  return (
    <Ctx.Provider value={{ theme, setTheme, toggle, isDark: theme === "dark" }}>
      {children}
    </Ctx.Provider>
  );
}
