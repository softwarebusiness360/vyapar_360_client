import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Store, Receipt, CalendarClock, IndianRupee, ArrowRight, Users } from "lucide-react";
import { getVendors, getOrders, getBookings } from "../../lib/store";
import { formatINR, timeAgo } from "../../lib/utils";
import StatusBadge from "../../components/StatusBadge";

export default function AdminOverviewPage() {
  const vendors = useMemo(() => getVendors(), []);
  const orders = useMemo(() => getOrders(), []);
  const bookings = useMemo(() => getBookings(), []);

  const gmv =
    orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0) +
    bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + (b.service?.price || 0), 0);

  const restaurantCount = vendors.filter((v) => v.businessType === "restaurant").length;
  const salonCount = vendors.filter((v) => v.businessType === "salon").length;

  const stats = [
    { label: "Total businesses", value: vendors.length, icon: Store, tint: "text-brand", ring: "bg-brand-soft border-brand/30" },
    { label: "Total orders", value: orders.length, icon: Receipt, tint: "text-restaurant", ring: "bg-orange-500/10 border-orange-500/30" },
    { label: "Total bookings", value: bookings.length, icon: CalendarClock, tint: "text-salon", ring: "bg-amber-500/10 border-amber-500/30" },
    { label: "Platform GMV", value: formatINR(gmv), icon: IndianRupee, tint: "text-emerald-400", ring: "bg-emerald-500/10 border-emerald-500/30" },
  ];

  const recentVendors = [...vendors].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const recentActivity = [
    ...orders.map((o) => ({ type: "order", ...o })),
    ...bookings.map((b) => ({ type: "booking", ...b })),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-ink-muted">Platform</div>
        <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="admin-overview-title">
          Everything at a glance
        </h1>
        <p className="mt-1 text-ink-secondary">
          {restaurantCount} restaurant{restaurantCount === 1 ? "" : "s"} · {salonCount} salon{salonCount === 1 ? "" : "s"} live on Vyapar360.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={s.label} className="card-surface p-5" data-testid={`admin-stat-${i}`}>
            <div className={`h-9 w-9 rounded-lg border grid place-items-center ${s.ring}`}>
              <s.icon className={`h-4 w-4 ${s.tint}`} />
            </div>
            <div className="mt-4 text-[11px] uppercase tracking-widest text-ink-muted">{s.label}</div>
            <div className="mt-1 font-display font-semibold text-2xl tracking-tight">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-display text-lg font-medium">Newest businesses</div>
            <Link to="/admin/businesses" className="text-xs text-brand hover:text-brand-hover inline-flex items-center gap-1" data-testid="admin-view-all-businesses">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentVendors.length === 0 ? (
            <div className="text-sm text-ink-muted py-8 text-center">No businesses yet.</div>
          ) : (
            <ul className="space-y-2">
              {recentVendors.map((v) => (
                <li key={v.id}>
                  <Link
                    to={`/admin/businesses/${v.id}`}
                    className="flex items-center gap-3 rounded-lg bg-bg-elevated border border-line p-3 hover:border-white/20 transition-colors"
                    data-testid={`admin-recent-vendor-${v.id}`}
                  >
                    <div className="h-10 w-10 rounded-lg bg-bg-surface border border-line overflow-hidden grid place-items-center flex-shrink-0">
                      {v.logo ? <img src={v.logo} alt="" className="h-full w-full object-cover" /> : <Store className="h-4 w-4 text-ink-muted" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{v.name || v.email}</div>
                      <div className="text-[11px] text-ink-muted">
                        {v.businessType} · {v.onboarded ? "Live" : "Onboarding"} · {timeAgo(v.createdAt)}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-ink-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-display text-lg font-medium">Recent activity</div>
          </div>
          {recentActivity.length === 0 ? (
            <div className="text-sm text-ink-muted py-8 text-center">Nothing yet.</div>
          ) : (
            <ul className="space-y-2">
              {recentActivity.map((r) => {
                const vendor = vendors.find((v) => v.id === r.vendorId);
                return (
                  <li key={r.id} className="rounded-lg bg-bg-elevated border border-line p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs text-ink-muted font-mono">{r.code}</div>
                        <div className="mt-0.5 text-sm truncate">
                          {r.type === "order"
                            ? r.items.map((i) => `${i.name} ×${i.qty}`).join(", ")
                            : r.service?.name}
                        </div>
                        <div className="mt-1 text-[11px] text-ink-muted">
                          {vendor?.name || "—"} · {timeAgo(r.createdAt)}
                        </div>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
