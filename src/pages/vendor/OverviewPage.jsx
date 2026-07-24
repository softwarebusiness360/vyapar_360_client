import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Receipt,
  CalendarClock,
  IndianRupee,
  TrendingUp,
  Package,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { getOrders, getBookings } from "../../lib/store";
import { formatINR, timeAgo } from "../../lib/utils";
import StatusBadge from "../../components/StatusBadge";

export default function OverviewPage() {
  const { vendor } = useAuth();
  const isRestaurant = vendor.businessType === "restaurant";
  const orders = useMemo(() => (isRestaurant ? getOrders(vendor.id) : []), [vendor.id, isRestaurant]);
  const bookings = useMemo(() => (!isRestaurant ? getBookings(vendor.id) : []), [vendor.id, isRestaurant]);

  const revenue = isRestaurant
    ? orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0)
    : bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + (b.service?.price || 0), 0);

  const totalCount = isRestaurant ? orders.length : bookings.length;
  const activeCount = isRestaurant
    ? orders.filter((o) => ["pending", "preparing", "ready"].includes(o.status)).length
    : bookings.filter((b) => ["pending", "confirmed"].includes(b.status)).length;
  const itemsCount = isRestaurant ? vendor.items.length : vendor.services.length;

  // 7-day revenue chart data (mock timeline for demo)
  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const iso = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString("en-IN", { weekday: "short" });
      const dayRevenue = isRestaurant
        ? orders.filter((o) => o.status !== "cancelled" && o.createdAt.slice(0, 10) === iso).reduce((s, o) => s + o.total, 0)
        : bookings.filter((b) => b.status !== "cancelled" && b.createdAt.slice(0, 10) === iso).reduce((s, b) => s + (b.service?.price || 0), 0);
      return { label: dayLabel, value: dayRevenue };
    });
    // If everything is zero (fresh vendor), synth small demo bars so chart isn't empty
    if (days.every((d) => d.value === 0)) {
      return days.map((d, i) => ({ ...d, value: [1200, 1800, 900, 2400, 1600, 3200, 2100][i] }));
    }
    return days;
  }, [orders, bookings, isRestaurant]);

  const maxVal = Math.max(...chartData.map((d) => d.value), 1);
  const recent = isRestaurant ? orders.slice(0, 5) : bookings.slice(0, 5);

  const stats = [
    { icon: IndianRupee, label: "Total revenue", value: formatINR(revenue), tint: "text-brand", ring: "border-brand/30 bg-brand-soft" },
    {
      icon: isRestaurant ? Receipt : CalendarClock,
      label: isRestaurant ? "Total orders" : "Total bookings",
      value: totalCount,
      tint: isRestaurant ? "text-restaurant" : "text-salon",
      ring: isRestaurant ? "border-orange-500/30 bg-orange-500/10" : "border-amber-500/30 bg-amber-500/10",
    },
    { icon: TrendingUp, label: isRestaurant ? "Active orders" : "Upcoming", value: activeCount, tint: "text-emerald-400", ring: "border-emerald-500/30 bg-emerald-500/10" },
    { icon: Package, label: isRestaurant ? "Menu items" : "Services", value: itemsCount, tint: "text-fuchsia-400", ring: "border-fuchsia-500/30 bg-fuchsia-500/10" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-muted">Dashboard</div>
          <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="overview-title">
            Good to see you, {vendor.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-ink-secondary">Here's a snapshot of your store today.</p>
        </div>
        <a
          href={`/store/${vendor.slug}`}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost inline-flex items-center gap-2 self-start sm:self-auto"
          data-testid="overview-view-store"
        >
          <ExternalLink className="h-4 w-4" /> View storefront
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className="card-surface p-4 sm:p-5"
            data-testid={`stat-card-${i}`}
          >
            <div className={`h-9 w-9 rounded-lg border grid place-items-center ${s.ring}`}>
              <s.icon className={`h-4 w-4 ${s.tint}`} />
            </div>
            <div className="mt-4 text-[11px] uppercase tracking-widest text-ink-muted">{s.label}</div>
            <div className="mt-1 font-display font-semibold text-2xl tracking-tight">{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Chart + recent */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card-surface p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-ink-muted">Last 7 days</div>
              <div className="mt-1 font-display text-lg font-medium">Revenue trend</div>
            </div>
            <div className="text-sm text-ink-secondary">Total <span className="text-ink-primary font-medium">{formatINR(chartData.reduce((s, d) => s + d.value, 0))}</span></div>
          </div>
          <div className="flex items-end gap-3 h-40">
            {chartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative group">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-brand/30 to-brand transition-all"
                    style={{ height: `${(d.value / maxVal) * 130}px` }}
                  />
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 text-[11px] bg-bg-elevated border border-line rounded px-2 py-1 whitespace-nowrap">
                    {formatINR(d.value)}
                  </div>
                </div>
                <div className="text-[11px] text-ink-muted">{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-display text-lg font-medium">{isRestaurant ? "Recent orders" : "Recent bookings"}</div>
            <Link
              to={isRestaurant ? "/dashboard/orders" : "/dashboard/bookings"}
              className="text-xs text-brand hover:text-brand-hover inline-flex items-center gap-1 transition-colors"
              data-testid="overview-view-all"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="text-sm text-ink-muted py-8 text-center">No activity yet.</div>
          ) : (
            <div className="space-y-2">
              {recent.map((r) => (
                <div key={r.id} className="rounded-lg bg-bg-elevated border border-line p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs text-ink-muted font-mono">{r.code}</div>
                      <div className="mt-0.5 text-sm truncate">
                        {isRestaurant
                          ? r.items.map((it) => `${it.name} ×${it.qty}`).join(", ")
                          : r.service?.name}
                      </div>
                      <div className="mt-1 text-[11px] text-ink-muted">
                        {r.customer?.name} · {timeAgo(r.createdAt)}
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
