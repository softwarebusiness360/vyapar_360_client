import React from "react";
import { Menu } from "lucide-react";

/**
 * NavToggle — hamburger button with two placement variants.
 *
 * `variant="top"` renders a compact inline button (drop into a header).
 * `variant="floating"` renders a fixed floating pill at the bottom-right
 * for mobile — big tap target that stays reachable while scrolling.
 *
 * Both trigger the same drawer via `onOpen`.
 */
export default function NavToggle({ onOpen, variant = "top", label = "Menu", testid }) {
  if (variant === "floating") {
    return (
      <button
        onClick={onOpen}
        aria-label={label}
        data-testid={testid || "nav-toggle-floating"}
        className="lg:hidden fixed bottom-5 right-5 z-40 h-14 pl-4 pr-5 rounded-full bg-gradient-to-r from-brand to-fuchsia-500 text-white shadow-glow inline-flex items-center gap-2 border border-white/10 backdrop-blur transition-transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <Menu className="h-5 w-5" strokeWidth={2.4} />
        <span className="font-medium text-sm">{label}</span>
      </button>
    );
  }
  return (
    <button
      onClick={onOpen}
      aria-label={label}
      data-testid={testid || "nav-toggle-top"}
      className="h-10 w-10 grid place-items-center rounded-full border border-line bg-bg-elevated text-ink-secondary hover:text-ink-primary hover:border-white/20 transition-colors"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
