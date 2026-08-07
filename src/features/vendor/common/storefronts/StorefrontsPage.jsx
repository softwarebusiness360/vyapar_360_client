import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, ExternalLink, Store, Trash2, Utensils, Scissors, Edit2 } from "lucide-react";
import { useAuth } from "../../../../lib/auth";
import * as repository from "@/data/storefrontRepository";
import { slugify } from "../../../../lib/utils";
import Modal from "@/shared/components/feedback/Modal";
import UpgradeGate from "@/shared/components/feedback/UpgradeGate";

export default function StorefrontsPage() {
  const { addStorefront, deleteStorefront } = repository;
  const { vendor, refresh } = useAuth();
  const nav = useNavigate();
  const [adding, setAdding] = useState(null);

  const canAddMore = vendor?.features?.multiStore || (vendor?.storefronts?.length || 0) === 0;

  const openAdd = () => {
    if (!vendor?.features?.multiStore) {
      toast.error("Multi-storefront is a Pro feature. Contact platform admin to enable it.");
      return;
    }
    setAdding({ name: "", slug: "", businessType: vendor.storefronts[0]?.businessType || "restaurant" });
  };

  const submit = () => {
    if (!adding.name.trim()) return toast.error("Name is required");
    try {
      const sf = addStorefront(vendor.id, {
        name: adding.name.trim(),
        slug: slugify(adding.slug || adding.name),
        businessType: adding.businessType,
      });
      setAdding(null);
      refresh();
      toast.success(`${sf.name} added`);
      nav(`/dashboard/storefronts/${sf.id}`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const remove = (sf) => {
    if (vendor.storefronts.length <= 1) return toast.error("You must have at least one storefront");
    if (!window.confirm(`Delete ${sf.name}? All its orders/bookings will be removed too.`)) return;
    deleteStorefront(vendor.id, sf.id);
    refresh();
    toast.success("Storefront deleted");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-muted">Outlets</div>
          <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="storefronts-title">Storefronts</h1>
          <p className="mt-1 text-ink-secondary">
            {vendor.storefronts.length} outlet{vendor.storefronts.length === 1 ? "" : "s"} · {vendor.features?.multiStore ? "Multi-store enabled" : "Single-store only (Pro plan unlocks more)"}
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2" data-testid="add-storefront-btn" disabled={!canAddMore}>
          <Plus className="h-4 w-4" /> Add storefront
        </button>
      </div>

      {!vendor.features?.multiStore && vendor.storefronts.length === 1 && (
        <div className="card-surface p-4 border-brand/30 bg-brand-soft/40 text-sm flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-brand mt-0.5" />
          <div>
            <div className="text-ink-primary font-medium">Grow into a chain</div>
            <div className="text-ink-secondary mt-0.5">Upgrade to Pro to run multiple outlets under one dashboard. Platform admin can enable this per business.</div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendor.storefronts.map((sf) => (
          <div key={sf.id} className="card-surface card-hover overflow-hidden flex flex-col" data-testid={`storefront-card-${sf.id}`}>
            <div className="relative h-32 bg-bg-elevated overflow-hidden">
              {sf.coverImage ? (
                <img src={sf.coverImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full grid place-items-center text-ink-muted">
                  <Store className="h-6 w-6" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-surface/95 via-bg-surface/40 to-transparent" />
              <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border backdrop-blur ${sf.businessType === "salon" ? "bg-amber-500/15 border-amber-500/30 text-amber-300" : "bg-orange-500/15 border-orange-500/30 text-orange-300"}`}>
                {sf.businessType === "salon" ? <Scissors className="h-2.5 w-2.5" /> : <Utensils className="h-2.5 w-2.5" />}
                {sf.businessType}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="font-display text-lg font-medium truncate">{sf.name || "Untitled"}</div>
              <div className="text-xs text-ink-muted font-mono">/store/{sf.slug}</div>
              <div className="text-xs text-ink-secondary mt-2">
                {sf.businessType === "restaurant"
                  ? `${sf.items?.length || 0} items · ${sf.categories?.length || 0} categories`
                  : `${sf.services?.length || 0} services · ${sf.categories?.length || 0} categories`}
              </div>
              <div className="mt-auto pt-4 flex items-center gap-1.5">
                <Link to={`/dashboard/storefronts/${sf.id}`} className="btn-ghost !py-1.5 !px-3 text-xs inline-flex items-center gap-1 flex-1 justify-center" data-testid={`open-storefront-${sf.id}`}>
                  <Edit2 className="h-3 w-3" /> Manage
                </Link>
                <a href={`/store/${sf.slug}`} target="_blank" rel="noreferrer" className="h-8 w-8 grid place-items-center rounded-md border border-line text-ink-secondary hover:text-ink-primary hover:border-white/20 transition-colors" aria-label="Open storefront" data-testid={`view-storefront-${sf.id}`}>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                {vendor.storefronts.length > 1 && (
                  <button onClick={() => remove(sf)} className="h-8 w-8 grid place-items-center rounded-md border border-line text-ink-secondary hover:text-red-400 hover:border-red-500/30 transition-colors" aria-label="Delete" data-testid={`delete-storefront-${sf.id}`}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!adding} onClose={() => setAdding(null)}>
        {adding && (
          <div>
            <h2 className="font-display text-xl font-medium">Add a new storefront</h2>
            <p className="text-sm text-ink-secondary mb-5 mt-1">Each outlet gets its own catalogue, orders, and public URL.</p>
            <div className="space-y-4">
              <Row label="Name"><input className="input-field" value={adding.name} onChange={(e) => setAdding({ ...adding, name: e.target.value, slug: adding.slug || slugify(e.target.value) })} placeholder="e.g. Pizza Hub — Andheri" data-testid="new-storefront-name" /></Row>
              <Row label="Slug (URL)"><input className="input-field" value={adding.slug} onChange={(e) => setAdding({ ...adding, slug: slugify(e.target.value) })} placeholder="pizza-hub-andheri" data-testid="new-storefront-slug" /></Row>
              <Row label="Business type">
                <div className="grid grid-cols-2 gap-2">
                  {["restaurant", "salon"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAdding({ ...adding, businessType: t })}
                      data-testid={`new-storefront-type-${t}`}
                      className={`px-3 py-2 rounded-lg border text-sm inline-flex items-center gap-2 justify-center transition-colors capitalize ${adding.businessType === t ? "bg-brand-soft border-brand/40 text-ink-primary" : "bg-bg-elevated border-line text-ink-secondary"}`}
                    >
                      {t === "restaurant" ? <Utensils className="h-4 w-4" /> : <Scissors className="h-4 w-4" />}
                      {t}
                    </button>
                  ))}
                </div>
              </Row>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setAdding(null)} className="btn-ghost">Cancel</button>
                <button onClick={submit} className="btn-primary" data-testid="save-new-storefront-btn">Create storefront</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Sparkles(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>;
}

function Row({ label, children }) {
  return (
    <label className="block">
      <div className="text-xs uppercase tracking-widest text-ink-muted mb-1.5">{label}</div>
      {children}
    </label>
  );
}
