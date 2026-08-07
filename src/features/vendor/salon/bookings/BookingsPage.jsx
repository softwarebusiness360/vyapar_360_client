import React, { useState } from "react";
import { toast } from "sonner";
import { Search, Eye, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useAuth } from "../../../../lib/auth";
import useBookings from "./useBookings";
import useStorefronts from "@/features/vendor/common/storefronts/useStorefronts";
import * as repository from "@/data/bookingRepository";
import { formatINR, formatDate } from "../../../../lib/utils";
import StatusBadge from "@/shared/components/feedback/StatusBadge";
import StoreFilter from "@/features/vendor/common/analytics/components/StoreFilter";
import Modal from "@/shared/components/feedback/Modal";

export default function BookingsPage() {
  const { SALON_BOOKING_STATUSES } = repository;
  const { vendor, isOwner } = useAuth();
  const { allowed } = useStorefronts();
  const [storeFilter, setStoreFilter] = useState("all");
  const { bookings, setStatus } = useBookings({ storefrontId: storeFilter });
  const [q, setQ] = useState("");
  const [status, setStatus_] = useState("all");
  const [viewing, setViewing] = useState(null);

  const filtered = bookings.filter(
    (b) =>
      (status === "all" || b.status === status) &&
      (q.trim() === "" ||
        b.code.toLowerCase().includes(q.toLowerCase()) ||
        b.customer?.name?.toLowerCase().includes(q.toLowerCase())),
  );

  const setStatusFor = async (id, next) => {
    await setStatus(id, next);
    toast.success(`Marked as ${next}`);
    if (viewing?.id === id) setViewing({ ...viewing, status: next });
  };

  if (vendor.businessType !== "salon") {
    return <div className="text-ink-secondary">Bookings are only available for salon accounts.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-muted">Appointments</div>
          <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="bookings-title">Bookings</h1>
          <p className="mt-1 text-ink-secondary">
            {isOwner
              ? "All your upcoming and past appointments across stores."
              : `Bookings for your ${allowed.length} assigned storefront${allowed.length === 1 ? "" : "s"}.`}
          </p>
        </div>
        <StoreFilter storefronts={allowed} value={storeFilter} onChange={setStoreFilter} testid="bookings-store-filter" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by code or customer"
            className="input-field pl-10"
            data-testid="bookings-search"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus_(e.target.value)}
          className="input-field sm:max-w-[180px]"
          data-testid="bookings-status-filter"
        >
          <option value="all">All statuses</option>
          {SALON_BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card-surface p-16 text-center">
          <div className="font-display text-lg">No bookings match</div>
          <p className="mt-1 text-ink-secondary text-sm">Share your store link to start receiving bookings.</p>
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="hidden md:grid grid-cols-12 px-5 py-3 text-[11px] uppercase tracking-widest text-ink-muted border-b border-line">
            <div className="col-span-2">Booking</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-3">Service</div>
            <div className="col-span-2">When</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right">Action</div>
          </div>
          <ul className="divide-y divide-line">
            {filtered.map((b) => (
              <li key={b.id} className="px-4 sm:px-5 py-4 grid md:grid-cols-12 gap-3 items-center hover:bg-white/[0.02] transition-colors" data-testid={`booking-row-${b.id}`}>
                <div className="md:col-span-2">
                  <div className="font-mono text-sm">{b.code}</div>
                  <div className="text-[11px] text-ink-muted">{formatDate(b.createdAt)}</div>
                </div>
                <div className="md:col-span-3">
                  <div className="text-sm truncate">{b.customer?.name}</div>
                  <div className="text-[11px] text-ink-muted truncate">{b.customer?.phone}</div>
                </div>
                <div className="md:col-span-3">
                  <div className="text-sm truncate">{b.service?.name}</div>
                  <div className="text-[11px] text-ink-muted">{formatINR(b.service?.price)} · {b.service?.duration}m</div>
                </div>
                <div className="md:col-span-2 text-sm flex flex-col">
                  <span className="inline-flex items-center gap-1"><CalendarIcon className="h-3 w-3 text-ink-muted" />{formatDate(b.date)}</span>
                  <span className="inline-flex items-center gap-1 text-ink-secondary"><Clock className="h-3 w-3 text-ink-muted" />{b.slot}</span>
                </div>
                <div className="md:col-span-1">
                  <StatusBadge status={b.status} />
                </div>
                <div className="md:col-span-1 flex justify-start md:justify-end">
                  <button
                    onClick={() => setViewing(b)}
                    className="btn-ghost !py-1.5 !px-2.5 inline-flex items-center gap-1 text-xs"
                    data-testid={`view-booking-${b.id}`}
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
                <h2 className="mt-1 font-display text-2xl font-medium">Booking details</h2>
              </div>
              <StatusBadge status={viewing.status} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <InfoBlock label="Customer">{viewing.customer.name}</InfoBlock>
              <InfoBlock label="Phone">{viewing.customer.phone}</InfoBlock>
              <InfoBlock label="Date">{formatDate(viewing.date)}</InfoBlock>
              <InfoBlock label="Time slot">{viewing.slot}</InfoBlock>
              <InfoBlock label="Service" className="col-span-2">
                {viewing.service.name} · <span className="text-ink-muted">{viewing.service.duration}m</span>
              </InfoBlock>
              <InfoBlock label="Price" className="col-span-2">{formatINR(viewing.service.price)}</InfoBlock>
              {viewing.notes && (<InfoBlock label="Notes" className="col-span-2">{viewing.notes}</InfoBlock>)}
            </div>

            <div className="mt-6 pt-5 border-t border-line">
              <div className="text-xs uppercase tracking-widest text-ink-muted mb-3">Change status</div>
              <div className="flex flex-wrap gap-2">
                {SALON_BOOKING_STATUSES.map((s) => (
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
