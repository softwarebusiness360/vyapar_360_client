import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Eye } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { getOrders, updateOrderStatus, RESTAURANT_ORDER_STATUSES } from "../../lib/store";
import { formatINR, formatDateTime } from "../../lib/utils";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";

export default function OrdersPage() {
  const { vendor } = useAuth();
  const [refresh, setRefresh] = useState(0);
  const orders = useMemo(() => getOrders(vendor.id), [vendor.id, refresh]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [viewing, setViewing] = useState(null);

  const filtered = orders.filter(
    (o) =>
      (status === "all" || o.status === status) &&
      (q.trim() === "" ||
        o.code.toLowerCase().includes(q.toLowerCase()) ||
        o.customer?.name?.toLowerCase().includes(q.toLowerCase()))
  );

  const setStatusFor = (id, next) => {
    updateOrderStatus(id, next);
    toast.success(`Marked as ${next}`);
    setRefresh((r) => r + 1);
    if (viewing?.id === id) setViewing({ ...viewing, status: next });
  };

  if (vendor.businessType !== "restaurant") {
    return <div className="text-ink-secondary">Orders are only available for restaurant accounts.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-ink-muted">Live</div>
        <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="orders-title">Orders</h1>
        <p className="mt-1 text-ink-secondary">Manage every order coming into your kitchen.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by code or customer"
            className="input-field pl-10"
            data-testid="orders-search"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input-field sm:max-w-[180px]"
          data-testid="orders-status-filter"
        >
          <option value="all">All statuses</option>
          {RESTAURANT_ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card-surface p-16 text-center">
          <div className="font-display text-lg">No orders match</div>
          <p className="mt-1 text-ink-secondary text-sm">Try changing filters or share your store link to get orders in.</p>
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="hidden md:grid grid-cols-12 px-5 py-3 text-[11px] uppercase tracking-widest text-ink-muted border-b border-line">
            <div className="col-span-2">Order</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-3">Items</div>
            <div className="col-span-1">Total</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Action</div>
          </div>
          <ul className="divide-y divide-line">
            {filtered.map((o) => (
              <li key={o.id} className="px-4 sm:px-5 py-4 grid md:grid-cols-12 gap-3 items-center hover:bg-white/[0.02] transition-colors" data-testid={`order-row-${o.id}`}>
                <div className="md:col-span-2">
                  <div className="font-mono text-sm">{o.code}</div>
                  <div className="text-[11px] text-ink-muted">{formatDateTime(o.createdAt)}</div>
                </div>
                <div className="md:col-span-3">
                  <div className="text-sm truncate">{o.customer?.name}</div>
                  <div className="text-[11px] text-ink-muted truncate">{o.customer?.phone}</div>
                </div>
                <div className="md:col-span-3 text-sm text-ink-secondary truncate">
                  {o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
                </div>
                <div className="md:col-span-1 font-mono text-sm">{formatINR(o.total)}</div>
                <div className="md:col-span-2">
                  <StatusBadge status={o.status} />
                </div>
                <div className="md:col-span-1 flex justify-start md:justify-end">
                  <button
                    onClick={() => setViewing(o)}
                    className="btn-ghost !py-1.5 !px-2.5 inline-flex items-center gap-1 text-xs"
                    data-testid={`view-order-${o.id}`}
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} className="sm:max-w-xl">
        {viewing && (
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-ink-muted font-mono">{viewing.code}</div>
                <h2 className="mt-1 font-display text-2xl font-medium">Order details</h2>
                <div className="mt-1 text-sm text-ink-secondary">{formatDateTime(viewing.createdAt)}</div>
              </div>
              <StatusBadge status={viewing.status} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <InfoBlock label="Customer">{viewing.customer.name}</InfoBlock>
              <InfoBlock label="Phone">{viewing.customer.phone}</InfoBlock>
              <InfoBlock label="Delivery address" className="col-span-2">
                {viewing.customer.address || "—"}
              </InfoBlock>
              {viewing.notes && (
                <InfoBlock label="Notes" className="col-span-2">{viewing.notes}</InfoBlock>
              )}
            </div>

            <div className="mt-6">
              <div className="text-xs uppercase tracking-widest text-ink-muted mb-2">Items</div>
              <ul className="rounded-lg border border-line divide-y divide-line">
                {viewing.items.map((i) => (
                  <li key={i.id} className="flex items-center justify-between px-4 py-3">
                    <div className="text-sm">{i.name} <span className="text-ink-muted">×{i.qty}</span></div>
                    <div className="font-mono text-sm">{formatINR(i.price * i.qty)}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatINR(viewing.subtotal)} />
              <Row label="Tax (5%)" value={formatINR(viewing.tax)} />
              <Row label="Total" value={formatINR(viewing.total)} bold />
            </div>

            <div className="mt-6 pt-5 border-t border-line">
              <div className="text-xs uppercase tracking-widest text-ink-muted mb-3">Change status</div>
              <div className="flex flex-wrap gap-2">
                {RESTAURANT_ORDER_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFor(viewing.id, s)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      viewing.status === s
                        ? "bg-brand-soft border-brand/40 text-ink-primary"
                        : "bg-bg-elevated border-line text-ink-secondary hover:text-ink-primary hover:border-white/20"
                    }`}
                    data-testid={`change-status-${s}`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function InfoBlock({ label, children, className = "" }) {
  return (
    <div className={className}>
      <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-1">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}
function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "text-ink-primary font-medium" : "text-ink-secondary"}>{label}</span>
      <span className={`font-mono ${bold ? "text-lg font-semibold" : ""}`}>{value}</span>
    </div>
  );
}
