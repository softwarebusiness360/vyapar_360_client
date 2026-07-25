import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Search, Store, Trash2, ExternalLink, EyeOff, Eye } from "lucide-react";
import { getVendors, deleteVendor, saveVendor } from "../../lib/store";
import { formatDate } from "../../lib/utils";

export default function AdminBusinessesPage() {
  const nav = useNavigate();
  const [refresh, setRefresh] = useState(0);
  const vendors = useMemo(() => getVendors(), [refresh]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");

  const filtered = vendors.filter(
    (v) =>
      (type === "all" || v.businessType === type) &&
      (q.trim() === "" ||
        (v.name || "").toLowerCase().includes(q.toLowerCase()) ||
        v.email.toLowerCase().includes(q.toLowerCase()) ||
        (v.slug || "").includes(q.toLowerCase()))
  );

  const handleDelete = (v) => {
    if (!window.confirm(`Delete ${v.name || v.email}? This removes all their orders and bookings too.`)) return;
    deleteVendor(v.id);
    setRefresh((r) => r + 1);
    toast.success(`${v.name || v.email} deleted`);
  };

  const toggleDisable = (v) => {
    const next = { ...v, disabled: !v.disabled };
    saveVendor(next);
    setRefresh((r) => r + 1);
    toast.success(next.disabled ? "Business disabled" : "Business enabled");
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-ink-muted">Directory</div>
        <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="admin-businesses-title">
          All businesses
        </h1>
        <p className="mt-1 text-ink-secondary">
          {vendors.length} total · {vendors.filter((v) => v.onboarded).length} live
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, or slug"
            className="input-field pl-10"
            data-testid="admin-businesses-search"
          />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="input-field sm:max-w-[180px]" data-testid="admin-businesses-type-filter">
          <option value="all">All types</option>
          <option value="restaurant">Restaurants</option>
          <option value="salon">Salons</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card-surface p-16 text-center">
          <Store className="h-8 w-8 mx-auto text-ink-muted" />
          <div className="mt-3 font-display text-lg">No businesses match</div>
          <p className="mt-1 text-ink-secondary text-sm">Try different filters.</p>
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="hidden md:grid grid-cols-12 px-5 py-3 text-[11px] uppercase tracking-widest text-ink-muted border-b border-line">
            <div className="col-span-4">Business</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Slug</div>
            <div className="col-span-2">Created</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <ul className="divide-y divide-line">
            {filtered.map((v) => (
              <li
                key={v.id}
                className="px-4 sm:px-5 py-4 grid md:grid-cols-12 gap-3 items-center hover:bg-white/[0.02] transition-colors cursor-pointer"
                data-testid={`admin-vendor-row-${v.id}`}
                onClick={() => nav(`/admin/businesses/${v.id}`)}
              >
                <div className="md:col-span-4 flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 rounded-lg bg-bg-elevated border border-line overflow-hidden flex-shrink-0 grid place-items-center">
                    {v.logo ? <img src={v.logo} alt="" className="h-full w-full object-cover" /> : <Store className="h-4 w-4 text-ink-muted" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate flex items-center gap-2">
                      {v.name || <span className="text-ink-muted">Untitled</span>}
                      {!v.onboarded && <span className="tag !text-[10px]">Onboarding</span>}
                      {v.disabled && <span className="tag !text-[10px] !text-red-300 !border-red-500/30 !bg-red-500/10">Disabled</span>}
                    </div>
                    <div className="text-xs text-ink-muted truncate">{v.email}</div>
                  </div>
                </div>
                <div className="md:col-span-2 text-sm capitalize">{v.businessType || "—"}</div>
                <div className="md:col-span-2 text-sm font-mono text-ink-secondary truncate">
                  {v.slug ? `/${v.slug}` : "—"}
                </div>
                <div className="md:col-span-2 text-sm text-ink-secondary">{formatDate(v.createdAt)}</div>
                <div className="md:col-span-2 flex items-center gap-1 justify-start md:justify-end" onClick={(e) => e.stopPropagation()}>
                  {v.slug && (
                    <a
                      href={`/store/${v.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="h-8 w-8 grid place-items-center rounded-md text-ink-secondary hover:bg-white/5 hover:text-ink-primary transition-colors"
                      aria-label="Open storefront"
                      data-testid={`admin-vendor-open-${v.id}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => toggleDisable(v)}
                    className="h-8 w-8 grid place-items-center rounded-md text-ink-secondary hover:bg-white/5 hover:text-ink-primary transition-colors"
                    aria-label={v.disabled ? "Enable" : "Disable"}
                    data-testid={`admin-vendor-toggle-${v.id}`}
                  >
                    {v.disabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(v)}
                    className="h-8 w-8 grid place-items-center rounded-md text-ink-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    aria-label="Delete"
                    data-testid={`admin-vendor-delete-${v.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
