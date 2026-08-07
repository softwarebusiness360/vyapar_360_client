import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import { CartProvider, useCart } from "../../../../lib/cart";
import * as repository from "@/data/orderRepository";
import { formatINR } from "../../../../lib/utils";
import Logo from "@/shared/components/branding/Logo";
import { isValidPhone, sanitizePhoneInput } from "@/shared/validation/phone";

export default function CheckoutPage() {
  const { getVendorBySlug, createOrder, seedIfNeeded, DEFAULT_CHECKOUT_FIELDS } = repository;
  const { slug } = useParams();
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    seedIfNeeded();
    setVendor(getVendorBySlug(slug));
  }, [slug]);

  if (!vendor) return null;
  if (vendor.businessType !== "restaurant") {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="text-center">
          <p className="text-ink-secondary">Checkout is only available for restaurant stores.</p>
          <Link to={`/store/${slug}`} className="btn-primary mt-4 inline-flex">Back to store</Link>
        </div>
      </div>
    );
  }
  return (
    <CartProvider vendorSlug={vendor.slug}>
      <CheckoutContent vendor={vendor} />
    </CartProvider>
  );
}

function CheckoutContent({ vendor }) {
  const { items, subtotal, tax, total, clear } = useCart();
  const nav = useNavigate();
  const cfg = vendor.checkoutFields || repository.DEFAULT_CHECKOUT_FIELDS;
  const enabledKeys = useMemo(
    () => Object.keys(cfg).filter((k) => cfg[k]?.enabled),
    [cfg]
  );
  const [form, setForm] = useState(() =>
    enabledKeys.reduce((acc, k) => ({ ...acc, [k]: "" }), {})
  );
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setPhone = (e) => setForm((f) => ({ ...f, phone: sanitizePhoneInput(e.target.value) }));

  const place = () => {
    if (items.length === 0) return toast.error("Your cart is empty");
    // Validate required fields dynamically
    for (const k of enabledKeys) {
      const field = cfg[k];
      if (field.required && !String(form[k] || "").trim()) {
        return toast.error(`${field.label} is required`);
      }
    }
    if (form.phone && !isValidPhone(form.phone)) {
      return toast.error("Enter a valid phone number");
    }
    setBusy(true);
    setTimeout(() => {
      const customer = {
        name: (form.name || "").trim(),
        phone: (form.phone || "").trim(),
        address: (form.address || "").trim(),
      };
      const order = repository.createOrder({
        vendorId: vendor.id,
        customer,
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        subtotal,
        tax,
        total,
        notes: (form.notes || "").trim(),
      });
      clear();
      nav(`/store/${vendor.slug}/order/${order.id}`);
    }, 500);
  };

  const isTextarea = (k) => k === "address" || k === "notes";

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to={`/store/${vendor.slug}`} className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-ink-primary transition-colors" data-testid="checkout-back-btn">
            <ArrowLeft className="h-4 w-4" /> Back to {vendor.name}
          </Link>
          <Logo size="sm" />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-xs uppercase tracking-widest text-restaurant">Checkout</div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-display font-medium tracking-tighter" data-testid="checkout-title">
          Confirm your order
        </h1>

        <div className="mt-10 grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 card-surface p-6 space-y-5">
            <div>
              <div className="font-display text-lg font-medium">Your details</div>
              <div className="text-sm text-ink-secondary">
                Only what the store needs — nothing more.
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {enabledKeys.length === 0 && (
                <div className="sm:col-span-2 text-sm text-ink-muted text-center py-6">
                  This store doesn't request any details at checkout.
                </div>
              )}
              {enabledKeys.map((k) => {
                const field = cfg[k];
                const colSpan = isTextarea(k) ? "sm:col-span-2" : "";
                return (
                  <Field
                    key={k}
                    label={field.label}
                    required={field.required}
                    className={colSpan}
                  >
                    {isTextarea(k) ? (
                      <textarea
                        className="input-field min-h-[90px] resize-y"
                        value={form[k] || ""}
                        onChange={set(k)}
                        placeholder={field.placeholder}
                        data-testid={`checkout-${k}-input`}
                      />
                    ) : (
                      <input
                        className="input-field"
                        value={form[k] || ""}
                        onChange={k === "phone" ? setPhone : set(k)}
                        inputMode={k === "phone" ? "tel" : undefined}
                        placeholder={field.placeholder}
                        data-testid={`checkout-${k}-input`}
                      />
                    )}
                  </Field>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card-surface p-6 sticky top-6">
              <div className="font-display text-lg font-medium">Order summary</div>
              {items.length === 0 ? (
                <div className="mt-6 text-center py-8">
                  <ShoppingBag className="h-8 w-8 text-ink-muted mx-auto" />
                  <div className="mt-2 text-sm text-ink-secondary">Your cart is empty.</div>
                  <Link to={`/store/${vendor.slug}`} className="btn-primary mt-4 inline-flex">Browse menu</Link>
                </div>
              ) : (
                <>
                  <ul className="mt-5 space-y-2.5">
                    {items.map((i) => (
                      <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate">{i.name} <span className="text-ink-muted">×{i.qty}</span></span>
                        <span className="font-mono">{formatINR(i.price * i.qty)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 pt-4 border-t border-line space-y-1.5">
                    <Row label="Subtotal" value={formatINR(subtotal)} />
                    <Row label="Tax (5%)" value={formatINR(tax)} />
                    <Row label="Total" value={formatINR(total)} bold />
                  </div>
                  <button
                    onClick={place}
                    disabled={busy}
                    className="btn-primary w-full mt-6 inline-flex items-center justify-center gap-2 disabled:opacity-60"
                    data-testid="place-order-btn"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : `Place order · ${formatINR(total)}`}
                  </button>
                  <p className="mt-3 text-[11px] text-ink-muted text-center">
                    MVP demo: no real payment is charged.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <div className="text-xs uppercase tracking-widest text-ink-muted mb-2">
        {label}
        {required && <span className="text-restaurant ml-1">*</span>}
        {!required && <span className="text-ink-muted ml-1 normal-case tracking-normal text-[10px]">(optional)</span>}
      </div>
      {children}
    </label>
  );
}
function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "text-ink-primary font-medium" : "text-ink-secondary text-sm"}>{label}</span>
      <span className={`font-mono ${bold ? "text-lg font-semibold" : "text-sm"}`}>{value}</span>
    </div>
  );
}
