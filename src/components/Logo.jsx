import React from "react";
import { Link } from "react-router-dom";
import { Store } from "lucide-react";

export default function Logo({ size = "md", to = "/", className = "" }) {
  const dims = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const text = size === "sm" ? "text-lg" : "text-xl";
  return (
    <Link
      to={to}
      data-testid="brand-logo"
      className={`inline-flex items-center gap-2.5 group ${className}`}
    >
      <div
        className={`${dims} rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center shadow-glow`}
      >
        <Store className="h-4 w-4 text-white" strokeWidth={2.4} />
      </div>
      <span className={`font-display font-semibold tracking-tight ${text} text-ink-primary`}>
        Vyapar<span className="text-brand">360</span>
      </span>
    </Link>
  );
}
