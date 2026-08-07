import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import * as repository from "@/data/adminRepository";
import { formatINR, formatDate } from "../../../lib/utils";
import StatusBadge from "@/shared/components/feedback/StatusBadge";

export default function AdminBookingsPage() {
  const { getBookings, getVendors, SALON_BOOKING_STATUSES } = repository;
  const bookings = useMemo(() => getBookings(), []);
  const vendors = useMemo(() => getVendors(), []);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = bookings.filter(
    (b) =>
      (status === "all" || b.status === status) &&
      (q.trim() === "" ||
        b.code.toLowerCase().includes(q.toLowerCase()) ||
        (b.customer?.name || "").toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-ink-muted">Cross-vendor</div>
        <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="admin-bookings-title">All bookings</h1>
        <p className="mt-1 text-ink-secondary">Every appointment booked across every salon on Vyapar360.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search code or customer" className="input-field pl-10" data-testid="admin-bookings-search" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field sm:max-w-[180px]" data-testid="admin-bookings-status">
          <option value="all">All statuses</option>
          {SALON_BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card-surface p-16 text-center text-ink-muted">No bookings yet.</div>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="hidden md:grid grid-cols-12 px-5 py-3 text-[11px] uppercase tracking-widest text-ink-muted border-b border-line">
            <div className="col-span-2">Code</div>
            <div className="col-span-3">Salon</div>
            <div className="col-span-3">Service</div>
            <div className="col-span-2">When</div>
            <div className="col-span-2 text-right">Status</div>
          </div>
          <ul className="divide-y divide-line">
            {filtered.map((b) => {
              const vendor = vendors.find((v) => v.id === b.vendorId);
              return (
                <li key={b.id} className="px-4 sm:px-5 py-4 grid md:grid-cols-12 gap-3 items-center hover:bg-white/[0.02] transition-colors" data-testid={`admin-booking-row-${b.id}`}>
                  <div className="md:col-span-2 font-mono text-sm">{b.code}</div>
                  <div className="md:col-span-3">
                    <Link to={`/admin/businesses/${b.vendorId}`} className="text-sm hover:text-brand transition-colors">
                      {vendor?.name || "—"}
                    </Link>
                    <div className="text-[11px] text-ink-muted truncate">{b.customer?.name || "Anonymous"}</div>
                  </div>
                  <div className="md:col-span-3 text-sm truncate">
                    {b.service?.name} <span className="text-ink-muted">· {formatINR(b.service?.price)}</span>
                  </div>
                  <div className="md:col-span-2 text-sm">
                    <div>{formatDate(b.date)}</div>
                    <div className="text-[11px] text-ink-muted font-mono">{b.slot}</div>
                  </div>
                  <div className="md:col-span-2 flex md:justify-end"><StatusBadge status={b.status} /></div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
