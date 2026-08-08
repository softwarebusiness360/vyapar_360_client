import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Eye, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../lib/auth";
import useOrders from "./useOrders";
import useStorefronts from "@/features/vendor/common/storefronts/useStorefronts";
import * as repository from "@/data/orderRepository";
import { formatINR, formatDateTime } from "../../../../lib/utils";
import StatusBadge from "@/shared/components/feedback/StatusBadge";
import StoreFilter from "@/features/vendor/common/analytics/components/StoreFilter";
import Modal from "@/shared/components/feedback/Modal";
import { getTableState } from "@/domain/restaurantTables";
import { buildTableUrl, createQrSvgDataUrl } from "@/domain/publicStoreUrls";

export default function OrdersPage() {
  const { RESTAURANT_ORDER_STATUSES } = repository;
  const { vendor, isOwner } = useAuth();
  const { allowed } = useStorefronts();
  const [storeFilter, setStoreFilter] = useState("all");
  const { orders, setStatus, cancel, closeTable, appendItems } = useOrders({ storefrontId: storeFilter });
  const [q, setQ] = useState("");
  const [status, setStatus_] = useState("all");
  const [viewing, setViewing] = useState(null);
  const [tab, setTab] = useState("orders");
  const [additionId, setAdditionId] = useState("");
  const showTables = vendor.capabilities?.tableOrdering && ["table", "both"].includes(vendor.orderMode);

  const filtered = orders.filter(
    (o) =>
      (status === "all" || o.status === status) &&
      (q.trim() === "" ||
        o.code.toLowerCase().includes(q.toLowerCase()) ||
        o.customer?.name?.toLowerCase().includes(q.toLowerCase())),
  );

  const setStatusFor = async (id, next) => {
    const updated = await setStatus(id, next);
    if (!updated) return toast.error("That status change is no longer valid. Refresh and try the next available action.");
    toast.success(`Marked as ${next}`);
    if (viewing?.id === id) setViewing(updated);
  };
  const addItemToViewing = () => {
    const storefront = vendor.storefronts?.find(({ id }) => id === viewing.storefrontId);
    const item = storefront?.items?.find(({ id }) => id === additionId);
    if (!item) return toast.error("Choose an available menu item");
    const updated = appendItems(viewing.id, [{ id: item.id, name: item.name, price: item.price, qty: 1 }]);
    if (!updated) return toast.error("Items can only be added while an order is New or Preparing. Your selection was kept.");
    setViewing(updated); setAdditionId(""); toast.success("Item added to this order");
  };
  const cancelViewing = () => {
    if (!window.confirm(`Cancel ${viewing.code}${viewing.tableLabel ? ` and mark ${viewing.tableLabel} ready to close` : ""}?`)) return;
    const result = cancel(viewing.id);
    if (!result) return toast.error("This order can no longer be cancelled");
    setViewing(result); toast.success("Order cancelled");
  };
  const completeViewingTable = () => {
    const result = closeTable(viewing.id);
    if (!result) return toast.error("Complete or cancel the order before closing the table");
    setViewing(null); toast.success("Table is now free");
  };

  if (vendor.businessType !== "restaurant") {
    return <div className="text-ink-secondary">Orders are only available for restaurant accounts.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-muted">Live</div>
          <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="orders-title">Orders</h1>
          <p className="mt-1 text-ink-secondary">
            {isOwner
              ? "Manage every order across your stores."
              : `Orders for your ${allowed.length} assigned storefront${allowed.length === 1 ? "" : "s"}.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2"><StoreFilter storefronts={allowed} value={storeFilter} onChange={setStoreFilter} testid="orders-store-filter" /><Link to="/dashboard/orders/new" className="btn-primary min-h-[44px] inline-flex items-center gap-2" data-testid="new-order-link"><Plus className="h-4 w-4" /> New order</Link></div>
      </div>

      <div role="tablist" aria-label="Orders workspace" className="flex gap-2 border-b border-line"><button role="tab" aria-selected={tab === "orders"} onClick={() => setTab("orders")} className="min-h-[44px] px-4" data-testid="orders-tab">All Orders</button>{showTables && <button role="tab" aria-selected={tab === "tables"} onClick={() => setTab("tables")} className="min-h-[44px] px-4" data-testid="tables-tab">Tables</button>}</div>

      {tab === "tables" && showTables ? <TableGrid vendor={vendor} tables={(vendor.tables || []).filter((table) => storeFilter === "all" || table.storefrontId === storeFilter)} orders={orders} onOpen={(order) => order && setViewing(order)} /> : <>

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
          onChange={(e) => setStatus_(e.target.value)}
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
                {({ new: ["preparing"], preparing: ["ready"], ready: ["completed"] }[viewing.status] || []).map((s) => (
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
              {["new", "preparing"].includes(viewing.status) && viewing.source === "table" && <div className="mt-5 rounded-lg border border-line p-3"><div className="text-xs uppercase tracking-widest text-ink-muted mb-2">Add items</div><div className="flex flex-col sm:flex-row gap-2"><select value={additionId} onChange={(event) => setAdditionId(event.target.value)} className="input-field" data-testid="add-order-item-select"><option value="">Choose menu item</option>{(vendor.storefronts?.find(({ id }) => id === viewing.storefrontId)?.items || []).filter((item) => item.available !== false).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button onClick={addItemToViewing} className="btn-primary min-h-[44px]" data-testid="add-order-item-button">Add item</button></div></div>}
              <div className="mt-4 flex flex-wrap gap-2">
                {["new", "preparing", "ready"].includes(viewing.status) && <button onClick={cancelViewing} className="btn-ghost min-h-[44px]" data-testid="cancel-order-button">Cancel order</button>}
                {viewing.source === "table" && ["completed", "cancelled"].includes(viewing.status) && !viewing.tableClosedAt && <button onClick={completeViewingTable} className="btn-primary min-h-[44px]" data-testid="complete-table-button">Complete table</button>}
              </div>
            </div>
          </div>
        )}
      </Modal>
      </>}
    </div>
  );
}

function TableGrid({ vendor, tables, orders, onOpen }) {
  const [qrTable, setQrTable] = useState(null);
  return <><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" data-testid="table-grid">{tables.map((table) => { const detail = getTableState(table, orders); return <article key={table.id} className="card-surface min-h-[150px] p-4"><button onClick={() => onOpen(detail.order)} className="w-full min-h-[80px] text-left focus-visible:ring-2 focus-visible:ring-brand" data-testid={`table-card-${table.id}`}><div className="font-display text-lg">{table.label}</div><div className="mt-2 text-sm capitalize">{detail.state.replaceAll("_", " ")}</div>{detail.order && <><div className="mt-2 text-xs font-mono">{detail.order.code}</div><div className="text-xs capitalize">{detail.order.status}</div></>}</button><button className="btn-ghost min-h-[44px] mt-2 text-xs" onClick={() => setQrTable(table)} data-testid={`table-qr-${table.id}`}>Table QR</button></article>; })}</div><TableQrModal vendor={vendor} table={qrTable} onClose={() => setQrTable(null)} /></>;
}

function TableQrModal({ vendor, table, onClose }) {
  const url = table ? buildTableUrl(window.location.origin, vendor, table.id) : null;
  const [image, setImage] = useState(null);
  React.useEffect(() => { let active = true; setImage(null); if (url) createQrSvgDataUrl(url).then((value) => active && setImage(value)).catch(() => active && toast.error("Could not generate this table QR. Try again.")); return () => { active = false; }; }, [url]);
  const download = () => { if (!image) return toast.error("Wait for the QR preview to finish"); const anchor = document.createElement("a"); anchor.href = image; anchor.download = `${vendor.slug}-${table.id}.png`; anchor.click(); };
  const print = () => { if (!image) return toast.error("Wait for the QR preview to finish"); const popup = window.open("", "_blank"); if (!popup) return toast.error("Allow pop-ups to print this table QR"); popup.document.write(`<title>${vendor.name} ${table.label}</title><h1>${vendor.name}</h1><h2>${table.label}</h2><img alt="${table.label} QR" src="${image}"><p>${url}</p>`); popup.document.close(); popup.print(); };
  return <Modal open={!!table} onClose={onClose}>{table && <div data-testid="table-qr-preview"><h2 className="font-display text-2xl">{vendor.name}</h2><p className="mt-1 font-medium">{table.label}</p>{image ? <img className="mt-4 w-56 h-56 bg-white" src={image} alt={`QR for ${vendor.name} ${table.label}`} /> : <p role="status" className="mt-4">Generating QR…</p>}<p className="mt-3 text-xs font-mono break-all">{url || "This table QR is unavailable."}</p><div className="mt-4 flex gap-2"><button className="btn-ghost min-h-[44px]" onClick={download} data-testid="table-qr-download">Download PNG</button><button className="btn-primary min-h-[44px]" onClick={print} data-testid="table-qr-print">Print</button></div></div>}</Modal>;
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
