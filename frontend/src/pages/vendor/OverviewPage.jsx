import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Receipt,
  CalendarClock,
  IndianRupee,
  TrendingUp,
  Package,
  ExternalLink,
  ArrowRight,
  Store,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { useMultiStoreAnalytics, usePeriodFilter, useStorefronts } from "../../hooks";
import { formatINR, timeAgo } from "../../lib/utils";
import StatusBadge from "../../components/StatusBadge";
import StatCard from "../../components/vendor/StatCard";
import PeriodFilter from "../../components/vendor/PeriodFilter";
import StoreFilter from "../../components/vendor/StoreFilter";
import PerStoreBreakdown from "../../components/vendor/PerStoreBreakdown";

/**
 * OverviewPage — the owner's consolidated multi-store dashboard.
 *
 * All heavy-lifting (aggregation, filtering) lives in hooks. This file is
 * responsible only for choosing filters and arranging presentational pieces.
 */
export default function OverviewPage() {
  const { vendor } = useAuth();
  const { storefronts } = useStorefronts();
  const period = usePeriodFilter("30d");
  const [storeFilter, setStoreFilter] = useState("all");

  const storefrontIds = storeFilter === "all" ? undefined : [storeFilter];
  const analytics = useMultiStoreAnalytics({
    vendor,
    storefrontIds,
    from: period.from,
    to: period.to,
  });

  const isMultiStore = vendor?.features?.multiStore && storefronts.length > 1;
  const isRestaurant = vendor?.businessType === "restaurant";

  if (!analytics) return null;
  const { kpis, perStore, trend, orders, bookings } = analytics;
  const trendMax = Math.max(...trend.map((d) => d.value), 1);

  const stats = [
    { icon: IndianRupee, label: "Revenue", value: formatINR(kpis.revenue), tint: "text-brand", ring: "border-brand/30 bg-brand-soft" },
    { icon: Receipt, label: "Orders", value: kpis.orders, tint: "text-restaurant", ring: "border-orange-500/30 bg-orange-500/10" },
    { icon: CalendarClock, label: "Bookings", value: kpis.bookings, tint: "text-salon", ring: "border-amber-500/30 bg-amber-500/10" },
    { icon: TrendingUp, label: "Avg ticket", value: formatINR(kpis.avgTicket), tint: "text-emerald-400", ring: "border-emerald-500/30 bg-emerald-500/10" },
  ];

  const recentAll = [
    ...orders.map((o) => ({ type: "order", ...o })),
    ...bookings.map((b) => ({ type: "booking", ...b })),
  ]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-muted">Dashboard</div>
          <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="overview-title">
            Good to see you, {(vendor.name || "").split(" ")[0] || "there"} 👋
          </h1>
          <p className="mt-1 text-ink-secondary">
            {isMultiStore
              ? `Consolidated view across ${storefronts.length} storefronts.`
              : "Snapshot of your business today."}
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <StoreFilter
            storefronts={storefronts}
            value={storeFilter}
            onChange={setStoreFilter}
            testid="overview-store-filter"
          />
          <PeriodFilter
            options={period.options}
            value={period.period}
            onChange={period.setPeriod}
            testid="overview-period-filter"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} index={i} testid={`stat-card-${i}`} />
        ))}
      </div>

      {/* Multi-store breakdown */}
      {isMultiStore && (
        <PerStoreBreakdown stats={perStore} onSelect={setStoreFilter} />
      )}

      {/* Trend + recent */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card-surface p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-ink-muted">{period.currentLabel}</div>
              <div className="mt-1 font-display text-lg font-medium">Revenue trend</div>
            </div>
            <div className="text-sm text-ink-secondary">
              Total <span className="text-ink-primary font-medium">{formatINR(trend.reduce((s, d) => s + d.value, 0))}</span>
            </div>
          </div>
          {trend.length === 0 ? (
            <div className="text-sm text-ink-muted py-10 text-center">Not enough data.</div>
          ) : (
            <div className="flex items-end gap-[3px] h-40" data-testid="overview-trend-chart">
              {trend.map((d, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-brand/25 to-brand hover:from-brand/50 hover:to-brand transition-colors"
                  style={{ height: `${(d.value / trendMax) * 140}px` }}
                  title={`${d.iso}: ${formatINR(d.value)}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="card-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-display text-lg font-medium">Recent activity</div>
            <Link
              to={isRestaurant ? "/dashboard/orders" : "/dashboard/bookings"}
              className="text-xs text-brand hover:text-brand-hover inline-flex items-center gap-1 transition-colors"
              data-testid="overview-view-all"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentAll.length === 0 ? (
            <div className="text-sm text-ink-muted py-8 text-center">Nothing yet.</div>
          ) : (
            <ul className="space-y-2">
              {recentAll.map((r) => (
                <li key={r.id} className="rounded-lg bg-bg-elevated border border-line p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-widest text-ink-muted font-mono flex items-center gap-1.5">
                        {r.type === "order" ? <Receipt className="h-2.5 w-2.5" /> : <CalendarClock className="h-2.5 w-2.5" />}
                        {r.code}
                      </div>
                      <div className="mt-0.5 text-sm truncate">
                        {r.type === "order"
                          ? r.items.map((it) => `${it.name} ×${it.qty}`).join(", ")
                          : r.service?.name}
                      </div>
                      <div className="mt-1 text-[11px] text-ink-muted">
                        {r.customer?.name || "—"} · {timeAgo(r.createdAt)}
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {vendor?.slug && (
        <a
          href={`/store/${vendor.slug}`}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost inline-flex items-center gap-2 self-start"
          data-testid="overview-view-store"
        >
          <ExternalLink className="h-4 w-4" /> View storefront
        </a>
      )}
    </div>
  );
}
