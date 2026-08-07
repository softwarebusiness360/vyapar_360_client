import React, { useState } from "react";
import { TrendingUp, ShoppingBag, Users, IndianRupee } from "lucide-react";
import { useAuth } from "../../../../lib/auth";
import useMultiStoreAnalytics from "@/features/vendor/common/analytics/useMultiStoreAnalytics";
import usePeriodFilter from "@/features/vendor/common/analytics/usePeriodFilter";
import useStorefronts from "@/features/vendor/common/storefronts/useStorefronts";
import useEmployeePerformance from "@/features/vendor/common/team/useEmployeePerformance";
import { formatINR } from "../../../../lib/utils";
import StatCard from "@/features/vendor/common/analytics/components/StatCard";
import PeriodFilter from "@/features/vendor/common/analytics/components/PeriodFilter";
import StoreFilter from "@/features/vendor/common/analytics/components/StoreFilter";
import PerStoreBreakdown from "@/features/vendor/common/analytics/components/PerStoreBreakdown";
import EmployeePerformanceTable from "@/features/vendor/common/team/components/EmployeePerformanceTable";

/**
 * InsightsPage — deeper analytics (segmented by store, period, employee).
 *
 * Employees with the `viewInsights` permission see a limited view scoped to
 * their assigned stores; owners get the full picture including employee KPIs.
 */
export default function InsightsPage() {
  const { vendor, employee, isOwner } = useAuth();
  const { storefronts, allowed } = useStorefronts();
  const period = usePeriodFilter("30d");
  const [storeFilter, setStoreFilter] = useState("all");

  // Employees are locked to their assigned stores; owners can pick.
  const scopedStorefronts = isOwner ? storefronts : allowed;
  const scopedIds = storeFilter === "all"
    ? scopedStorefronts.map((s) => s.id)
    : [storeFilter];

  const analytics = useMultiStoreAnalytics({
    vendor,
    storefrontIds: scopedIds,
    from: period.from,
    to: period.to,
  });
  const teamPerf = useEmployeePerformance({
    vendor: isOwner ? vendor : null,
    storefrontIds: scopedIds,
    from: period.from,
    to: period.to,
  });

  if (!analytics) return null;
  const { kpis, perStore, orders, bookings } = analytics;

  const uniqueCustomers = new Set(
    [...orders, ...bookings].map((r) => r.customer?.phone || r.customer?.name),
  ).size;

  const stats = [
    { icon: IndianRupee, label: "Revenue", value: formatINR(kpis.revenue) },
    { icon: ShoppingBag, label: "Transactions", value: kpis.txCount },
    { icon: TrendingUp, label: "Avg ticket", value: formatINR(kpis.avgTicket) },
    { icon: Users, label: "Unique customers", value: uniqueCustomers },
  ];

  // Top items / services list (across the selected scope)
  const counts = new Map();
  orders.forEach((o) => o.items?.forEach((i) => counts.set(i.name, (counts.get(i.name) || 0) + i.qty)));
  bookings.forEach((b) => counts.set(b.service?.name || "—", (counts.get(b.service?.name || "—") || 0) + 1));
  const topList = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topMax = topList[0]?.[1] || 1;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-muted">Reports</div>
          <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="insights-title">Insights</h1>
          <p className="mt-1 text-ink-secondary">
            {isOwner ? "Understand what's driving your business." : "Your stores in numbers."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StoreFilter
            storefronts={scopedStorefronts}
            value={storeFilter}
            onChange={setStoreFilter}
            testid="insights-store-filter"
          />
          <PeriodFilter
            options={period.options}
            value={period.period}
            onChange={period.setPeriod}
            testid="insights-period-filter"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <StatCard
            key={s.label}
            icon={s.icon}
            label={s.label}
            value={s.value}
            index={i}
            testid={`insight-stat-${i}`}
          />
        ))}
      </div>

      {isOwner && storefronts.length > 1 && (
        <PerStoreBreakdown stats={perStore} onSelect={setStoreFilter} />
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card-surface p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-ink-muted">{period.currentLabel}</div>
              <div className="mt-1 font-display text-lg font-medium">Revenue trend</div>
            </div>
          </div>
          <div className="flex items-end gap-[3px] h-40" data-testid="insights-trend-chart">
            {analytics.trend.map((d, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-brand/20 to-brand/90 hover:from-brand/40 hover:to-brand transition-colors"
                style={{ height: `${(d.value / Math.max(...analytics.trend.map((x) => x.value), 1)) * 140}px` }}
                title={`${d.iso}: ${formatINR(d.value)}`}
              />
            ))}
          </div>
        </div>

        <div className="card-surface p-5">
          <div className="font-display text-lg font-medium mb-4">Top items / services</div>
          {topList.length === 0 ? (
            <div className="text-sm text-ink-muted py-8 text-center">No data yet.</div>
          ) : (
            <ul className="space-y-3">
              {topList.map(([name, count]) => (
                <li key={name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="truncate pr-2">{name}</span>
                    <span className="font-mono text-ink-muted">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand to-fuchsia-500"
                      style={{ width: `${(count / topMax) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Owner-only: employee performance */}
      {isOwner && (vendor.employees?.length || 0) > 0 && (
        <div className="space-y-3">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-ink-muted">Team</div>
            <h2 className="mt-1 font-display text-xl font-medium">Employee performance</h2>
          </div>
          <EmployeePerformanceTable rows={teamPerf} isRestaurant={vendor.businessType === "restaurant"} />
        </div>
      )}
    </div>
  );
}
