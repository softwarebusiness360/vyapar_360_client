import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Receipt, CalendarClock, LogOut, ShieldCheck, MapPin, Store, User, ShoppingBag, Clock } from "lucide-react";
import { useCustomer } from "../../lib/customerAuth";
import useCustomerOrders from "../../hooks/useCustomerOrders";
import { formatINR, timeAgo } from "../../lib/utils";
import StatusBadge from "../../components/StatusBadge";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import CustomerAuthModal from "../../components/CustomerAuthModal";
import { Container } from "../../components/Container";

/**
 * CustomerProfilePage — the "My orders" home for storefront visitors.
 * Tabs: Current | Past · sub-filter: Online | Walk-in.
 * If the guest hasn't saved their phone yet, a soft banner nudges them.
 */
export default function CustomerProfilePage() {
  const { customer, logout } = useCustomer();
  const nav = useNavigate();
  const [tab, setTab] = useState("current");
  const [channel, setChannel] = useState("all");
  const [upgrade, setUpgrade] = useState(false);

  const data = useCustomerOrders(customer);

  if (!customer) return <Navigate to="/" replace />;

  const source = tab === "current" ? data.current : data.past;
  const filtered = channel === "all" ? source : source.filter((r) => (r.channel || "online") === channel);

  const onLogout = () => {
    logout();
    toast.success("Signed out");
    nav("/");
  };

  return (
    <>
      <PublicHeader />
      <main className="pt-10 pb-20">
        <Container>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-brand-soft border border-brand/40 grid place-items-center text-brand font-display text-xl font-medium">
                {customer.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-ink-muted">Customer</div>
                <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="customer-profile-title">
                  {customer.name}
                </h1>
                <div className="mt-0.5 text-sm text-ink-secondary flex flex-wrap items-center gap-3">
                  {customer.phone ? (
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Verified · {customer.phone}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-amber-300">
                      <User className="h-3.5 w-3.5" /> Guest session
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {!customer.phone && (
                <button
                  onClick={() => setUpgrade(true)}
                  className="btn-primary inline-flex items-center gap-2"
                  data-testid="customer-save-details"
                >
                  <ShieldCheck className="h-4 w-4" /> Save my details
                </button>
              )}
              <Link to="/discover" className="btn-ghost inline-flex items-center gap-2" data-testid="customer-discover-link">
                <Store className="h-4 w-4" /> Browse stores
              </Link>
              <button onClick={onLogout} className="btn-ghost inline-flex items-center gap-2" data-testid="customer-logout">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MiniStat label="Active" value={data.current.length} icon={Clock} tone="text-amber-300" />
            <MiniStat label="Completed" value={data.past.length} icon={ShieldCheck} tone="text-emerald-400" />
            <MiniStat label="Online" value={data.byChannel.online.length} icon={ShoppingBag} tone="text-brand" />
            <MiniStat label="Walk-in" value={data.byChannel.walk_in.length} icon={Store} tone="text-fuchsia-300" />
          </div>

          {/* Tabs + filter */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="inline-flex items-center gap-0.5 rounded-full border border-line bg-bg-elevated p-1" data-testid="customer-tabs">
              {[
                { id: "current", label: "Current orders" },
                { id: "past", label: "Past orders" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  data-testid={`customer-tab-${t.id}`}
                  className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                    tab === t.id
                      ? "bg-white text-bg-base font-medium shadow-sm"
                      : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="inline-flex items-center gap-0.5 rounded-full border border-line bg-bg-elevated p-1" data-testid="customer-channel-filter">
              {[
                { id: "all", label: "All" },
                { id: "online", label: "Online" },
                { id: "walk_in", label: "Walk-in" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setChannel(c.id)}
                  data-testid={`customer-channel-${c.id}`}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                    channel === c.id
                      ? "bg-white text-bg-base font-medium shadow-sm"
                      : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="mt-6">
            {filtered.length === 0 ? (
              <div className="card-surface p-16 text-center" data-testid="customer-list-empty">
                <div className="mx-auto h-12 w-12 rounded-full bg-brand-soft border border-brand/30 grid place-items-center">
                  <Receipt className="h-5 w-5 text-brand" />
                </div>
                <div className="mt-4 font-display text-lg">
                  {tab === "current" ? "No active orders" : "No past orders yet"}
                </div>
                <p className="mt-1 text-ink-secondary text-sm">
                  Explore your favourite stores and place your first order.
                </p>
                <Link to="/discover" className="btn-primary mt-6 inline-flex items-center gap-2">
                  <Store className="h-4 w-4" /> Browse stores
                </Link>
              </div>
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {filtered.map((r) => (
                  <RecordCard key={r.id} record={r} />
                ))}
              </ul>
            )}
          </div>
        </Container>
      </main>
      <PublicFooter />
      <CustomerAuthModal open={upgrade} onClose={() => setUpgrade(false)} variant="upgrade" />
    </>
  );
}

function MiniStat({ label, value, icon: Icon, tone }) {
  return (
    <div className="card-surface p-4">
      <div className={`h-8 w-8 rounded-lg border border-line bg-white/5 grid place-items-center ${tone}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-3 text-[10px] uppercase tracking-widest text-ink-muted">{label}</div>
      <div className="mt-0.5 font-display font-semibold text-2xl tracking-tight">{value}</div>
    </div>
  );
}

function RecordCard({ record: r }) {
  const isOrder = r.type === "order";
  const Icon = isOrder ? Receipt : CalendarClock;
  return (
    <li
      className="card-surface p-4 card-hover"
      data-testid={`customer-record-${r.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-xl border grid place-items-center flex-shrink-0 ${
            isOrder ? "bg-orange-500/10 border-orange-500/30 text-orange-300" : "bg-amber-500/10 border-amber-500/30 text-amber-300"
          }`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-ink-muted font-mono">{r.code}</div>
            <div className="mt-0.5 text-sm font-medium truncate">
              {isOrder
                ? r.items?.map((it) => `${it.name} ×${it.qty}`).join(", ")
                : r.service?.name}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-muted">
              <span>{timeAgo(r.createdAt)}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                {r.channel === "walk_in" ? <Store className="h-2.5 w-2.5" /> : <MapPin className="h-2.5 w-2.5" />}
                {r.channel === "walk_in" ? "Walk-in" : "Online"}
              </span>
            </div>
          </div>
        </div>
        <StatusBadge status={r.status} />
      </div>
      <div className="mt-3 pt-3 border-t border-line flex items-center justify-between text-xs">
        <span className="text-ink-muted">Total</span>
        <span className="font-mono text-ink-primary">
          {formatINR(isOrder ? r.total : r.service?.price || 0)}
        </span>
      </div>
    </li>
  );
}
