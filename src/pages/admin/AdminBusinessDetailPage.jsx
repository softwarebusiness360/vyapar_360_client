import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, MapPin, Phone, Mail, Store, Sparkles } from "lucide-react";
import { getVendorById, getOrders, getBookings, updateVendorFeatures, updateVendorPlan, saveVendor } from "../../lib/store";
import { formatINR, formatDate, timeAgo } from "../../lib/utils";
import StatusBadge from "../../components/StatusBadge";

export default function AdminBusinessDetailPage() {
  const { vendorId } = useParams();
  const nav = useNavigate();
  const [refresh, setRefresh] = useState(0);
  const vendor = useMemo(() => getVendorById(vendorId), [vendorId, refresh]);
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

      {/* Plan & feature flags — admin controls */}
      <div className="card-surface p-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-brand" />
          <div className="font-display text-lg font-medium">Plan & feature flags</div>
        </div>
        <p className="text-sm text-ink-secondary mb-5">
          Enable Pro features for this business. Changes are instant.
        </p>
        <div className="grid gap-3">
          <div className="rounded-lg bg-bg-elevated border border-line p-4">
            <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-2">Plan</div>
            <div className="flex flex-wrap gap-2">
              {["free", "growth", "pro", "enterprise"].map((p) => (
                <button
                  key={p}
                  onClick={() => { updateVendorPlan(vendor.id, p); setRefresh((r) => r + 1); toast.success(`Plan set to ${p}`); }}
                  data-testid={`admin-plan-${p}`}
                  className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-widest border transition-colors ${vendor.plan === p ? "bg-brand text-white border-brand" : "bg-bg-surface border-line text-ink-secondary hover:text-ink-primary"}`}
                >
                  {p}
                </button>
              ))}
            </div>
            {vendor.planConfig && (
              <div className="mt-3 text-[11px] text-ink-muted flex flex-wrap gap-x-4 gap-y-1">
                <span>Max stores: <span className="text-ink-secondary font-mono">{vendor.planConfig.maxStores}</span></span>
                <span>Max employees: <span className="text-ink-secondary font-mono">{vendor.planConfig.maxEmployees}</span></span>
                <span>Insights: <span className="text-ink-secondary">{vendor.planConfig.insights}</span></span>
              </div>
            )}
          </div>
          <div className="rounded-lg bg-bg-elevated border border-line p-4">
            <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-3">Features</div>
            <div className="space-y-2">
              {[
                { key: "multiStore", label: "Multi-storefront (multiple outlets under one owner)" },
                { key: "employees", label: "Team members (employees with limited access)" },
              ].map((f) => (
                <label key={f.key} className="flex items-center gap-3 cursor-pointer" data-testid={`admin-feature-${f.key}`}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!vendor.features?.[f.key]}
                    onClick={() => { updateVendorFeatures(vendor.id, { [f.key]: !vendor.features?.[f.key] }); setRefresh((r) => r + 1); toast.success(`${f.label} ${!vendor.features?.[f.key] ? "enabled" : "disabled"}`); }}
                    className={`relative h-5 w-9 rounded-full transition-colors ${vendor.features?.[f.key] ? "bg-brand" : "bg-bg-surface border border-line"}`}
                  >
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${vendor.features?.[f.key] ? "left-4" : "left-0.5"}`} />
                  </button>
                  <span className="text-sm">{f.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

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
