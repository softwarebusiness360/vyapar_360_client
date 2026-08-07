import React from "react";
import { toast } from "sonner";
import { User, ShieldCheck, LogOut, Store, Mail, Calendar, IndianRupee, Receipt, CalendarClock } from "lucide-react";
import { useAuth } from "../../../../lib/auth";
import useMultiStoreAnalytics from "@/features/vendor/common/analytics/useMultiStoreAnalytics";
import usePeriodFilter from "@/features/vendor/common/analytics/usePeriodFilter";
import useStorefronts from "@/features/vendor/common/storefronts/useStorefronts";
import { formatINR } from "../../../../lib/utils";
import StatCard from "@/features/vendor/common/analytics/components/StatCard";
import PeriodFilter from "@/features/vendor/common/analytics/components/PeriodFilter";
import * as repository from "@/data/analyticsRepository";

/**
 * VendorProfilePage — the "who am I & what have I been doing" page for
 * every account that logs in on the vendor dashboard: owner, manager,
 * or employee. Employees see their own personal activity; owners see
 * business-wide totals as a snapshot.
 */
export default function VendorProfilePage() {
  const { getVendorTransactions, computeKPIs } = repository;
  const { vendor, employee, isOwner, isEmployee, logout } = useAuth();
  const { storefronts, allowed } = useStorefronts();
  const period = usePeriodFilter("30d");

  const scopedIds = (isEmployee ? allowed : storefronts).map((s) => s.id);
  const analytics = useMultiStoreAnalytics({ vendor, storefrontIds: scopedIds, from: period.from, to: period.to });

  // Personal activity: transactions attributed to this employee only
  const personal = React.useMemo(() => {
    if (!vendor || !employee) return null;
    const { orders, bookings } = getVendorTransactions(vendor.id, { from: period.from, to: period.to });
    const myOrders = orders.filter((o) => o.employeeId === employee.id);
    const myBookings = bookings.filter((b) => b.employeeId === employee.id);
    return { ...computeKPIs({ orders: myOrders, bookings: myBookings }), items: [...myOrders, ...myBookings].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")) };
  }, [vendor, employee, period.from, period.to]);

  const onLogout = () => {
    logout();
    toast.success("Signed out");
  };

  const identity = employee || vendor;
  const roleLabel = employee ? (employee.role === "manager" ? "Store Manager" : "Employee") : "Business Owner";
  const roleTint = employee
    ? (employee.role === "manager" ? "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-300" : "bg-white/5 border-line text-ink-secondary")
    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";

  return (
    <div className="space-y-8">
      {/* Header card */}
      <div className="card-surface p-6" data-testid="vendor-profile-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-brand-soft border border-brand/40 grid place-items-center text-brand font-display text-xl font-medium">
              {identity?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-ink-muted">Signed in as</div>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-display font-medium tracking-tight" data-testid="profile-name">
                  {identity?.name || "—"}
                </h1>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border font-medium ${roleTint}`} data-testid="profile-role">
                  {employee?.role === "manager" && <ShieldCheck className="h-2.5 w-2.5" />}
                  {roleLabel}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-secondary">
                <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {identity?.email}</span>
                {vendor?.businessName && (
                  <span className="inline-flex items-center gap-1.5"><Store className="h-3.5 w-3.5" /> {vendor.businessName}</span>
                )}
                {identity?.createdAt && (
                  <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Since {new Date(identity.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onLogout} className="btn-ghost inline-flex items-center gap-2" data-testid="profile-logout">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        {/* Assigned scope */}
        <div className="mt-6 pt-6 border-t border-line grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-2">Your storefronts</div>
            <div className="flex flex-wrap gap-2">
              {(isEmployee ? allowed : storefronts).map((s) => (
                <span key={s.id} className="tag" data-testid={`profile-store-${s.id}`}>
                  <Store className="h-3 w-3" /> {s.name || s.slug}
                </span>
              ))}
              {(isEmployee ? allowed : storefronts).length === 0 && (
                <span className="text-sm text-ink-muted">Not assigned to any storefront yet.</span>
              )}
            </div>
          </div>
          {employee && (
            <div>
              <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-2">What you can do</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(employee.permissions || {})
                  .filter(([, v]) => v)
                  .map(([k]) => (
                    <span key={k} className="tag !text-emerald-300 !bg-emerald-500/10 !border-emerald-500/30">
                      {k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Personal activity (employee) OR business snapshot (owner) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-ink-muted">Activity</div>
            <h2 className="mt-1 text-2xl font-display font-medium tracking-tight">
              {isEmployee ? "My activity" : "Business snapshot"}
            </h2>
            <p className="mt-1 text-ink-secondary text-sm">
              {isEmployee ? "Everything you personally handled in the selected period." : "A quick pulse-check across your workspace."}
            </p>
          </div>
          <PeriodFilter options={period.options} value={period.period} onChange={period.setPeriod} testid="profile-period-filter" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={IndianRupee} label={isEmployee ? "You earned" : "Revenue"} value={formatINR(isEmployee ? personal?.revenue || 0 : analytics?.kpis.revenue || 0)} tint="text-brand" ring="border-brand/30 bg-brand-soft" index={0} testid="profile-stat-revenue" />
          <StatCard icon={Receipt} label={isEmployee ? "Orders you handled" : "Orders"} value={isEmployee ? personal?.orders || 0 : analytics?.kpis.orders || 0} tint="text-restaurant" ring="border-orange-500/30 bg-orange-500/10" index={1} testid="profile-stat-orders" />
          <StatCard icon={CalendarClock} label={isEmployee ? "Bookings you managed" : "Bookings"} value={isEmployee ? personal?.bookings || 0 : analytics?.kpis.bookings || 0} tint="text-salon" ring="border-amber-500/30 bg-amber-500/10" index={2} testid="profile-stat-bookings" />
          <StatCard icon={ShieldCheck} label="Avg ticket" value={formatINR(isEmployee ? personal?.avgTicket || 0 : analytics?.kpis.avgTicket || 0)} tint="text-emerald-400" ring="border-emerald-500/30 bg-emerald-500/10" index={3} testid="profile-stat-avg" />
        </div>

        {isEmployee && personal?.items?.length > 0 && (
          <div className="mt-6 card-surface p-5">
            <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-3">Recent items you handled</div>
            <ul className="divide-y divide-line">
              {personal.items.slice(0, 10).map((r) => (
                <li key={r.id} className="py-3 flex items-center justify-between gap-3" data-testid={`profile-activity-${r.id}`}>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-widest text-ink-muted font-mono">{r.code} · {r.channel === "walk_in" ? "Walk-in" : "Online"}</div>
                    <div className="mt-0.5 text-sm truncate">
                      {r.items ? r.items.map((it) => `${it.name} ×${it.qty}`).join(", ") : r.service?.name}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-mono">{formatINR(r.total || r.service?.price || 0)}</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-widest text-ink-muted">{r.status}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
