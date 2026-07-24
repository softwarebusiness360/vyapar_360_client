import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { getOrders, getVendors, RESTAURANT_ORDER_STATUSES } from "../../lib/store";
import { formatINR, formatDateTime } from "../../lib/utils";
import StatusBadge from "../../components/StatusBadge";

export default function AdminOrdersPage() {
  const orders = useMemo(() => getOrders(), []);
  const vendors = useMemo(() => getVendors(), []);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = orders.filter(
    (o) =>
      (status === "all" || o.status === status) &&
      (q.trim() === "" ||
        o.code.toLowerCase().includes(q.toLowerCase()) ||
        (o.customer?.name || "").toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-ink-muted">Cross-vendor</div>
        <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="admin-orders-title">All orders</h1>
        <p className="mt-1 text-ink-secondary">Every order placed across every restaurant on Vyapar360.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search code or customer" className="input-field pl-10" data-testid="admin-orders-search" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field sm:max-w-[180px]" data-testid="admin-orders-status">
          <option value="all">All statuses</option>
          {RESTAURANT_ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card-surface p-16 text-center text-ink-muted">No orders yet.</div>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="hidden md:grid grid-cols-12 px-5 py-3 text-[11px] uppercase tracking-widest text-ink-muted border-b border-line">
            <div className="col-span-2">Code</div>
            <div className="col-span-3">Business</div>
            <div className="col-span-2">Customer</div>
            <div className="col-span-2">When</div>
            <div className="col-span-1">Total</div>
            <div className="col-span-2 text-right">Status</div>
          </div>
          <ul className="divide-y divide-line">
            {filtered.map((o) => {
              const vendor = vendors.find((v) => v.id === o.vendorId);
              return (
                <li key={o.id} className="px-4 sm:px-5 py-4 grid md:grid-cols-12 gap-3 items-center hover:bg-white/[0.02] transition-colors" data-testid={`admin-order-row-${o.id}`}>
                  <div className="md:col-span-2 font-mono text-sm">{o.code}</div>
                  <div className="md:col-span-3 truncate">
                    <Link to={`/admin/businesses/${o.vendorId}`} className="text-sm hover:text-brand transition-colors">
                      {vendor?.name || "—"}
                    </Link>
                  </div>
                  <div className="md:col-span-2 text-sm truncate">{o.customer?.name || "Anonymous"}</div>
                  <div className="md:col-span-2 text-xs text-ink-muted">{formatDateTime(o.createdAt)}</div>
                  <div className="md:col-span-1 font-mono text-sm">{formatINR(o.total)}</div>
                  <div className="md:col-span-2 flex md:justify-end"><StatusBadge status={o.status} /></div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
