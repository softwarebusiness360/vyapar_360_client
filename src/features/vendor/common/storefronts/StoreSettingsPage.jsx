import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, Loader2, Check, X as XIcon } from "lucide-react";
import { useAuth } from "../../../../lib/auth";
import * as repository from "@/data/storefrontRepository";
import { slugify } from "../../../../lib/utils";
import { ORDER_MODES } from "@/domain/restaurantOrders";
import { resizeTables } from "@/domain/restaurantTables";
import { buildStorefrontUrl, createQrSvgDataUrl } from "@/domain/publicStoreUrls";
import { getOrders } from "@/data/orderRepository";

export default function StoreSettingsPage() {
  const { slugAvailable, DEFAULT_CHECKOUT_FIELDS, DEFAULT_BOOKING_FIELDS } = repository;
  const { vendor, updateVendor } = useAuth();
  const isRestaurant = vendor.businessType === "restaurant";
  const [form, setForm] = useState({
    name: vendor.name,
    slug: vendor.slug,
    tagline: vendor.tagline,
    description: vendor.description,
    logo: vendor.logo,
    coverImage: vendor.coverImage,
    address: vendor.address,
    phone: vendor.phone,
  });
  const [fields, setFields] = useState(
    isRestaurant
      ? { ...DEFAULT_CHECKOUT_FIELDS, ...(vendor.checkoutFields || {}) }
      : { ...DEFAULT_BOOKING_FIELDS, ...(vendor.bookingFields || {}) }
  );
  const [busy, setBusy] = useState(false);
  const [orderMode, setOrderMode] = useState(vendor.orderMode || "counter");
  const [tableCount, setTableCount] = useState(String(vendor.tables?.length || 1));
  const [tableError, setTableError] = useState("");
  const setField = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const storeUrl = `${window.location.origin}/store/${vendor.slug}`;

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      toast.success("Store link copied");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const save = () => {
    if (!form.name.trim()) return toast.error("Business name is required");
    const s = slugify(form.slug || form.name);
    if (!s) return toast.error("Store URL is required");
    if (!slugAvailable(s, vendor.id)) return toast.error("That store URL is taken");
    setBusy(true);
    const patch = { ...form, slug: s };
    if (isRestaurant) patch.checkoutFields = fields;
    else patch.bookingFields = fields;
    if (isRestaurant) {
      if (!ORDER_MODES.includes(orderMode)) return toast.error("Choose a valid order mode");
      if (!vendor.capabilities?.tableOrdering && orderMode !== "counter") return toast.error("Enable table ordering before choosing Table or Both mode");
      patch.orderMode = orderMode;
      if (["table", "both"].includes(orderMode) && vendor.capabilities?.tableOrdering) {
        const count = Number(tableCount);
        const result = resizeTables({ storefrontId: vendor.storefronts?.[0]?.id, count, tables: vendor.tables || [], orders: getOrders(vendor.id) });
        if (!result.ok) { setTableError(result.error); setBusy(false); return; }
        if (result.removed?.length && !window.confirm(`Remove ${result.removed.map(({ label }) => label).join(", ")}?`)) { setBusy(false); return; }
        patch.tables = result.tables;
      }
    }
    updateVendor(patch);
    setTimeout(() => {
      setBusy(false);
      toast.success("Store settings saved");
    }, 300);
  };

  const toggleField = (key, prop) => {
    setFields((f) => {
      const next = { ...f, [key]: { ...f[key], [prop]: !f[key][prop] } };
      // If disabling, also un-require
      if (prop === "enabled" && next[key].enabled === false) next[key].required = false;
      return next;
    });
  };
  const updateFieldLabel = (key, prop, value) => {
    setFields((f) => ({ ...f, [key]: { ...f[key], [prop]: value } }));
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-ink-muted">Configuration</div>
        <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="settings-title">Store settings</h1>
        <p className="mt-1 text-ink-secondary">Public storefront details customers see.</p>
      </div>

      {/* Store link card */}
      <div className="card-surface p-5">
        <div className="text-xs uppercase tracking-widest text-ink-muted">Storefront link</div>
        <div className="mt-3 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <div className="flex-1 min-w-0 rounded-lg bg-bg-elevated border border-line px-4 py-3 font-mono text-sm truncate" data-testid="store-url">
            {storeUrl}
          </div>
          <div className="flex gap-2">
            <button onClick={copyUrl} className="btn-ghost inline-flex items-center gap-2" data-testid="copy-url-btn">
              <Copy className="h-4 w-4" /> Copy
            </button>
            <a href={`/store/${vendor.slug}`} target="_blank" rel="noreferrer" className="btn-primary inline-flex items-center gap-2" data-testid="open-store-btn">
              <ExternalLink className="h-4 w-4" /> Open
            </a>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="card-surface p-5 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormRow label="Business name" required>
            <input className="input-field" value={form.name} onChange={setField("name")} data-testid="settings-name-input" />
          </FormRow>
          <FormRow label="Store URL slug" required>
            <div className="flex items-stretch gap-2">
              <span className="px-3 grid place-items-center rounded-lg border border-line bg-bg-elevated text-sm text-ink-muted whitespace-nowrap">/store/</span>
              <input className="input-field" value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} data-testid="settings-slug-input" />
            </div>
          </FormRow>
          <FormRow label="Tagline" className="sm:col-span-2">
            <input className="input-field" value={form.tagline} onChange={setField("tagline")} data-testid="settings-tagline-input" />
          </FormRow>
          <FormRow label="Description" className="sm:col-span-2">
            <textarea className="input-field min-h-[100px] resize-y" value={form.description} onChange={setField("description")} data-testid="settings-description-input" />
          </FormRow>
          <FormRow label="Address">
            <input className="input-field" value={form.address} onChange={setField("address")} data-testid="settings-address-input" />
          </FormRow>
          <FormRow label="Phone">
            <input className="input-field" value={form.phone} onChange={setField("phone")} data-testid="settings-phone-input" />
          </FormRow>
          <FormRow label="Logo URL">
            <input className="input-field" value={form.logo} onChange={setField("logo")} data-testid="settings-logo-input" />
          </FormRow>
          <FormRow label="Cover image URL">
            <input className="input-field" value={form.coverImage} onChange={setField("coverImage")} data-testid="settings-cover-input" />
          </FormRow>
        </div>

        <div className="flex justify-end pt-4 border-t border-line">
          <button onClick={save} disabled={busy} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60" data-testid="settings-save-btn">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
          </button>
        </div>
      </div>

      {isRestaurant && (
        <div className="card-surface p-5 space-y-5" data-testid="restaurant-order-settings">
          <div><h2 className="font-display text-lg font-medium">Restaurant ordering</h2><p className="text-sm text-ink-secondary">Choose how staff and guests identify orders.</p></div>
          <fieldset><legend className="text-xs uppercase tracking-widest text-ink-muted mb-2">Order mode</legend><div className="grid sm:grid-cols-3 gap-2">{ORDER_MODES.map((mode) => { const disabled = mode !== "counter" && !vendor.capabilities?.tableOrdering; return <label key={mode} className={`min-h-[44px] rounded-lg border border-line px-3 flex items-center gap-2 ${disabled ? "opacity-50" : ""}`}><input type="radio" name="order-mode" disabled={disabled} checked={orderMode === mode} onChange={() => { setOrderMode(mode); setTableError(""); }} data-testid={`order-mode-${mode}`} /><span className="capitalize">{mode}</span></label>; })}</div>{!vendor.capabilities?.tableOrdering && <p className="mt-2 text-sm text-ink-secondary" role="status">Table and Both modes require the Platform Admin table-ordering capability.</p>}</fieldset>
          {vendor.capabilities?.tableOrdering && ["table", "both"].includes(orderMode) && <label className="block max-w-xs text-sm">Number of tables<input type="number" min="1" step="1" className="input-field mt-1" value={tableCount} onChange={(event) => { setTableCount(event.target.value); setTableError(""); }} data-testid="table-count-input" />{tableError && <span role="alert" className="block mt-1 text-red-400">{tableError}</span>}</label>}
        </div>
      )}

      <QrCard vendor={vendor} />

      {/* Customer fields config */}
      <div className="card-surface p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-display text-lg font-medium">
              {isRestaurant ? "Checkout fields" : "Booking fields"}
            </div>
            <p className="mt-1 text-sm text-ink-secondary max-w-lg">
              Choose what details you ask customers for at {isRestaurant ? "checkout" : "booking"}.
              Toggle a field off to hide it entirely — or keep it on but optional.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {Object.entries(fields).map(([key, f]) => (
            <div key={key} className="rounded-xl border border-line bg-bg-elevated p-4" data-testid={`field-config-${key}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                <div className="min-w-0 flex-1">
                  <input
                    className="w-full bg-transparent border-0 p-0 text-sm font-medium text-ink-primary focus:outline-none"
                    value={f.label}
                    onChange={(e) => updateFieldLabel(key, "label", e.target.value)}
                    data-testid={`field-label-${key}`}
                  />
                  <div className="mt-0.5 text-[11px] text-ink-muted font-mono uppercase tracking-widest">
                    {key}
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <Toggle
                    label="Show"
                    checked={!!f.enabled}
                    onChange={() => toggleField(key, "enabled")}
                    testid={`field-enabled-${key}`}
                  />
                  <Toggle
                    label="Required"
                    checked={!!f.required}
                    onChange={() => toggleField(key, "required")}
                    disabled={!f.enabled}
                    testid={`field-required-${key}`}
                  />
                </div>
              </div>
              {f.enabled && (
                <input
                  className="input-field mt-3 !py-2 text-xs"
                  value={f.placeholder}
                  onChange={(e) => updateFieldLabel(key, "placeholder", e.target.value)}
                  placeholder="Placeholder shown in the input"
                  data-testid={`field-placeholder-${key}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg bg-bg-elevated border border-line p-3 text-xs text-ink-muted">
          <span className="text-ink-secondary font-medium">Tip: </span>
          You control every field customers see. By default, only Name is required —
          Phone is optional, Address & Notes are hidden. Turn them on if you need them.
        </div>

        <div className="flex justify-end pt-4 mt-4 border-t border-line">
          <button onClick={save} disabled={busy} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60" data-testid="settings-save-fields-btn">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function QrCard({ vendor }) {
  const url = buildStorefrontUrl(window.location.origin, vendor.slug);
  const [image, setImage] = useState(null);
  const [qrError, setQrError] = useState("");
  useEffect(() => { let active = true; createQrSvgDataUrl(url).then((value) => active && setImage(value)).catch(() => active && setQrError("Could not generate the store QR. Try again.")); return () => { active = false; }; }, [url]);
  const download = () => {
    if (!image) return toast.error("Set a public store URL first");
    const anchor = document.createElement("a"); anchor.href = image; anchor.download = `${vendor.slug}-store.png`; anchor.click();
  };
  const print = () => {
    if (!url) return toast.error("Set a public store URL first");
    const popup = window.open("", "_blank");
    if (!popup) return toast.error("Allow pop-ups to print the store QR");
    popup.document.write(`<title>${vendor.name} store link</title><h1>${vendor.name}</h1><img alt="Store QR" src="${image}"><p>${url}</p>`); popup.document.close(); popup.print();
  };
  return <section className="card-surface p-5" data-testid="general-store-qr"><h2 className="font-display text-lg">General store QR</h2><p className="mt-1 text-sm text-ink-secondary">This link opens the store and does not assign a table.</p>{image ? <img src={image} alt={`QR for ${vendor.name}`} className="mt-4 w-48 h-48 bg-white" /> : <p role="status" className="mt-4 text-sm text-ink-secondary">{qrError || (url ? "Generating QR…" : "Set a public store URL to enable QR actions.")}</p>}<p className="mt-3 font-mono text-xs break-all">{url || "Unavailable"}</p><div className="mt-4 flex flex-wrap gap-2"><button className="btn-ghost min-h-[44px]" onClick={download} disabled={!image} data-testid="general-qr-download">Download image</button><button className="btn-primary min-h-[44px]" onClick={print} disabled={!image} data-testid="general-qr-print">Print</button></div></section>;
}

function Toggle({ label, checked, onChange, disabled, testid }) {
  return (
    <label className={`flex items-center gap-2 text-xs uppercase tracking-widest cursor-pointer select-none ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={disabled ? undefined : onChange}
        disabled={disabled}
        data-testid={testid}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          checked ? "bg-brand" : "bg-bg-surface border border-line"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "left-4" : "left-0.5"
          }`}
        />
      </button>
      <span className={checked ? "text-ink-primary" : "text-ink-muted"}>{label}</span>
    </label>
  );
}

function FormRow({ label, required, className = "", children }) {
  return (
    <div className={className}>
      <div className="text-xs uppercase tracking-widest text-ink-muted mb-2">
        {label}
        {required && <span className="text-restaurant ml-1">*</span>}
      </div>
      {children}
    </div>
  );
}
