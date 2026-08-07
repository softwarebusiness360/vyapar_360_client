import React from "react";

/**
 * PeriodFilter — pill toggle used above analytics dashboards.
 * Driven by `usePeriodFilter`.
 */
export default function PeriodFilter({ options, value, onChange, testid = "period-filter" }) {
  return (
    <div
      role="tablist"
      aria-label="Period"
      className="inline-flex items-center gap-0.5 rounded-full border border-line bg-bg-elevated p-1 overflow-x-auto max-w-full"
      data-testid={testid}
    >
      {options.map((p) => {
        const active = p.id === value;
        return (
          <button
            key={p.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(p.id)}
            data-testid={`${testid}-${p.id}`}
            className={`whitespace-nowrap px-3 py-1.5 text-xs rounded-full transition-colors ${
              active
                ? "bg-white text-bg-base font-medium shadow-sm"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
