import React, { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, MapPin, Phone, Mail, Store } from "lucide-react";
import { getVendorById, getOrders, getBookings } from "../../lib/store";
import { formatINR, formatDate, timeAgo } from "../../lib/utils";
import StatusBadge from "../../components/StatusBadge";

export default function AdminBusinessDetailPage() {
  const { vendorId } = useParams();
  const nav = useNavigate();
  const vendor = useMemo(() => getVendorById(vendorId), [vendorId]);
  const orders = useMemo(() => (vendor ? getOrders(vendor.id) : []), [vendor]);
  const bookings = useMemo(() => (vendor ? getBookings(vendor.id) : []), [vendor]);

  if (!vendor) {
    return (
      <div className="text-center py-16">
        <h1 className="font-display text-2xl">Business not found</h1>
        <button onClick={() => nav("/admin/businesses")} className="btn-primary mt-4 inline-flex">
          Back to list
        </button>
      </div>
    );
  }

  const isRestaurant = vendor.businessType === "restaurant";
  const activityCount = isRestaurant ? orders.length : bookings.length;
  const gmv = isRestaurant
    ? orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0)
    : bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + (b.service?.price || 0), 0);

  return (
    <div className="space-y-8">
      <button
        onClick={() => nav("/admin/businesses")}
        className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-ink-primary transition-colors"
        data-testid="admin-detail-back-btn"
      >
        <ArrowLeft className="h-4 w-4" /> Back to businesses
      </button>

      {/* Header */}
      <div className="card-surface overflow-hidden">
        <div
          className="h-32 sm:h-40 bg-cover bg-center bg-bg-elevated"
          style={{ backgroundImage: vendor.coverImage ? `url(${vendor.coverImage})` : undefined }}
        >
          <div className="h-full bg-gradient-to-t from-bg-surface via-bg-surface/40 to-transparent" />
        </div>
        <div className="p-6 -mt-14 relative">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div className="flex items-end gap-4">
              <div className="h-20 w-20 rounded-2xl bg-bg-elevated border border-line overflow-hidden grid place-items-center flex-shrink-0">
                {vendor.logo ? <img src={vendor.logo} alt="" className="h-full w-full object-cover" /> : <Store className="h-6 w-6 text-ink-muted" />}
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-widest text-brand">{vendor.businessType}</div>
                <h1 className="mt-1 font-display text-2xl font-medium" data-testid="admin-detail-name">{vendor.name || "Untitled"}</h1>
                <div className="mt-1 text-sm text-ink-secondary">{vendor.tagline}</div>
              </div>
            </div>
            {vendor.slug && (
              <a
                href={`/store/${vendor.slug}`}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost inline-flex items-center gap-2"
                data-testid="admin-detail-open-store"
              >
                <ExternalLink className="h-4 w-4" /> View storefront
              </a>
            )}
          </div>

          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-6 border-t border-line">
            <Stat label="Total revenue" value={formatINR(gmv)} />
            <Stat label={isRestaurant ? "Orders" : "Bookings"} value={activityCount} />
            <Stat label={isRestaurant ? "Menu items" : "Services"} value={isRestaurant ? vendor.items.length : vendor.services.length} />
            <Stat label="Categories" value={vendor.categories.length} />
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-surface p-5">
          <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-3">Contact</div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-ink-muted" /> {vendor.email}</li>
            {vendor.phone && <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-ink-muted" /> {vendor.phone}</li>}
            {vendor.address && <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-ink-muted mt-0.5" /> {vendor.address}</li>}
          </ul>
        </div>
        <div className="card-surface p-5">
          <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-3">Account</div>
          <ul className="space-y-2 text-sm">
            <li><span className="text-ink-muted">Registered:</span> {formatDate(vendor.createdAt)}</li>
            <li><span className="text-ink-muted">Slug:</span> <span className="font-mono">/{vendor.slug || "—"}</span></li>
            <li><span className="text-ink-muted">Status:</span> {vendor.onboarded ? "Live" : "Onboarding"}{vendor.disabled ? " · Disabled" : ""}</li>
          </ul>
        </div>
      </div>

      {/* Description */}
      {vendor.description && (
        <div className="card-surface p-5">
          <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-2">Description</div>
          <p className="text-ink-secondary leading-relaxed">{vendor.description}</p>
        </div>
      )}

      {/* Activity */}
      <div className="card-surface p-5">
        <div className="font-display text-lg font-medium mb-4">
          {isRestaurant ? "Orders" : "Bookings"} ({activityCount})
        </div>
        {(isRestaurant ? orders : bookings).length === 0 ? (
          <div className="text-sm text-ink-muted py-8 text-center">Nothing yet.</div>
        ) : (
          <ul className="divide-y divide-line">
            {(isRestaurant ? orders : bookings).map((r) => (
              <li key={r.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-ink-muted font-mono">{r.code}</div>
                  <div className="text-sm truncate">
                    {isRestaurant ? r.items.map((i) => `${i.name} ×${i.qty}`).join(", ") : r.service?.name}
                  </div>
                  <div className="text-[11px] text-ink-muted mt-0.5">
                    {r.customer?.name || "Anonymous"} · {timeAgo(r.createdAt)}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <StatusBadge status={r.status} />
                  <div className="mt-1 font-mono text-sm">
                    {isRestaurant ? formatINR(r.total) : formatINR(r.service?.price)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-ink-muted">{label}</div>
      <div className="mt-1 font-display font-semibold text-xl tracking-tight">{value}</div>
    </div>
  );
}
