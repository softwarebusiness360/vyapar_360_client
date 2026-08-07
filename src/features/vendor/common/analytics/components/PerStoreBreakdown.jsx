import React from "react";
import { Store, Utensils, Scissors, Receipt, CalendarClock } from "lucide-react";
import { formatINR } from "@/lib/utils";

/**
 * PerStoreBreakdown — cross-store KPI list for the owner overview.
 * Pure presentational; `stats` comes from useMultiStoreAnalytics().perStore.
 */
export default function PerStoreBreakdown({ stats, onSelect }) {
  if (!stats || stats.length === 0) return null;
  return (
    <div className="card-surface p-5" data-testid="per-store-breakdown">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-ink-muted">Multi-store</div>
          <div className="mt-1 font-display text-lg font-medium">Performance by storefront</div>
        </div>
      </div>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {stats.map((s) => {
          const isRestaurant = s.storefront.businessType === "restaurant";
          const Icon = isRestaurant ? Utensils : Scissors;
          return (
            <li
              key={s.storefront.id}
              className="rounded-xl border border-line bg-bg-elevated p-4 card-hover cursor-pointer"
              onClick={() => onSelect && onSelect(s.storefront.id)}
              data-testid={`store-stat-${s.storefront.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{s.storefront.name || s.storefront.slug}</div>
                  <div className="text-[11px] text-ink-muted font-mono truncate">/{s.storefront.slug}</div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${
                    isRestaurant
                      ? "bg-orange-500/10 border-orange-500/30 text-orange-300"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  }`}
                >
                  <Icon className="h-2.5 w-2.5" /> {s.storefront.businessType}
                </span>
              </div>
              <div className="mt-3 font-display font-semibold text-2xl tracking-tight">{formatINR(s.revenue)}</div>
              <div className="mt-1 text-[11px] text-ink-muted">Revenue in period</div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md bg-bg-surface border border-line px-2 py-1.5">
                  <div className="text-ink-muted text-[10px] uppercase tracking-widest">Orders</div>
                  <div className="mt-0.5 inline-flex items-center gap-1">
                    <Receipt className="h-3 w-3 text-restaurant" />
                    <span className="font-mono">{s.orders}</span>
                  </div>
                </div>
                <div className="rounded-md bg-bg-surface border border-line px-2 py-1.5">
                  <div className="text-ink-muted text-[10px] uppercase tracking-widest">Bookings</div>
                  <div className="mt-0.5 inline-flex items-center gap-1">
                    <CalendarClock className="h-3 w-3 text-salon" />
                    <span className="font-mono">{s.bookings}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
