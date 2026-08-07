import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

/**
 * ThemeToggle — pill switch used in the nav drawer, dashboards, admin, etc.
 *
 * Two visual variants:
 *   - `variant="pill"` (default) : two-option pill (Dark | Light)
 *   - `variant="icon"`           : compact icon button (moon/sun swap)
 */
export default function ThemeToggle({ variant = "pill", testid = "theme-toggle" }) {
  const { theme, setTheme, toggle } = useTheme();

  if (variant === "icon") {
    return (
      <button
        onClick={toggle}
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        data-testid={testid}
        className="h-9 w-9 grid place-items-center rounded-full border border-line bg-bg-elevated text-ink-secondary hover:text-ink-primary hover:border-white/20 transition-colors"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full border border-line bg-bg-elevated p-1"
      role="radiogroup"
      aria-label="Theme"
      data-testid={testid}
    >
      <button
        role="radio"
        aria-checked={theme === "dark"}
        onClick={() => setTheme("dark")}
        data-testid={`${testid}-dark`}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-colors ${
          theme === "dark"
            ? "bg-brand text-white font-medium shadow-sm"
            : "text-ink-secondary hover:text-ink-primary"
        }`}
      >
        <Moon className="h-3.5 w-3.5" /> Dark
      </button>
      <button
        role="radio"
        aria-checked={theme === "light"}
        onClick={() => setTheme("light")}
        data-testid={`${testid}-light`}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-colors ${
          theme === "light"
            ? "bg-brand text-white font-medium shadow-sm"
            : "text-ink-secondary hover:text-ink-primary"
        }`}
      >
        <Sun className="h-3.5 w-3.5" /> Light
      </button>
    </div>
  );
}
