import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Minus, X, Search, ShoppingBag, Check } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { createOrder, createBooking, getSlotsForDate } from "../../lib/store";
import { formatINR } from "../../lib/utils";

/**
 * Point-of-sale — for walk-in customers.
 * Owner or employee taps this to create an order/booking without customer self-service.
 */
export default function POSPage() {
  const { vendor, employee, role } = useAuth();

  // Which storefronts this user can operate
  const allowed = useMemo(() => {
    const list = vendor?.storefronts || [];
    if (role === "employee") return list.filter((s) => employee.storefrontIds.includes(s.id));
    return list;
  }, [vendor, employee, role]);

  const [activeSfId, setActiveSfId] = useState(allowed[0]?.id || "");
  const sf = allowed.find((s) => s.id === activeSfId) || allowed[0];

  if (!sf) {
    return (
      <div className="card-surface p-16 text-center">
        <div className="font-display text-lg">No storefronts assigned</div>
        <p className="text-ink-secondary text-sm mt-1">Ask your owner to assign you to at least one storefront.</p>
      </div>
    );
  }

  const isRestaurant = sf.businessType === "restaurant";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-muted">POS · Walk-in</div>
          <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="pos-title">
            {isRestaurant ? "New order" : "New booking"}
          </h1>
          <p className="mt-1 text-ink-secondary">Take a walk-in {isRestaurant ? "order" : "booking"} for {sf.name}.</p>
        </div>
        {allowed.length > 1 && (
          <select
            value={activeSfId}
            onChange={(e) => setActiveSfId(e.target.value)}
            className="input-field sm:max-w-[240px]"
            data-testid="pos-storefront-select"
          >
            {allowed.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
      </div>

      {isRestaurant ? <RestaurantPOS storefront={sf} employee={employee} vendorId={vendor.id} /> : <SalonPOS storefront={sf} employee={employee} vendorId={vendor.id} />}
    </div>
  );
}

function RestaurantPOS({ storefront, employee, vendorId }) {
  const [q, setQ] = useState("");
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(null);

  const items = (storefront.items || []).filter((it) => it.available && (!q || it.name.toLowerCase().includes(q.toLowerCase())));
  const add = (it) => setCart((c) => {
    const idx = c.findIndex((x) => x.id === it.id);
    if (idx >= 0) { const n = [...c]; n[idx].qty += 1; return n; }
    return [...c, { id: it.id, name: it.name, price: it.price, qty: 1 }];
  });
  const dec = (id) => setCart((c) => c.map((x) => x.id === id ? { ...x, qty: x.qty - 1 } : x).filter((x) => x.qty > 0));
  const inc = (id) => setCart((c) => c.map((x) => x.id === id ? { ...x, qty: x.qty + 1 } : x));
  const remove = (id) => setCart((c) => c.filter((x) => x.id !== id));

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  const place = () => {
    if (cart.length === 0) return toast.error("Add at least one item");
    setBusy(true);
    setTimeout(() => {
      const o = createOrder({
        vendorId,
        storefrontId: storefront.id,
        employeeId: employee?.id || null,
        customer: { name: customer.name.trim() || "Walk-in", phone: customer.phone.trim() },
        items: cart,
        subtotal, tax, total,
        notes: "",
      });
      setBusy(false);
      setCompleted(o);
      setCart([]);
      setCustomer({ name: "", phone: "" });
      toast.success(`Order ${o.code} placed`);
    }, 300);
  };

  if (completed) {
    return (
      <div className="card-surface p-8 text-center max-w-md mx-auto">
        <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/15 border border-emerald-500/40 grid place-items-center">
          <Check className="h-6 w-6 text-emerald-400" />
        </div>
        <h2 className="mt-4 font-display text-2xl">Order confirmed</h2>
        <div className="mt-2 font-mono text-brand">{completed.code}</div>
        <div className="mt-1 text-sm text-ink-secondary">{formatINR(completed.total)}</div>
        <button onClick={() => setCompleted(null)} className="btn-primary mt-6" data-testid="pos-new-order-btn">Take another order</button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 card-surface p-5">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search menu…" className="input-field pl-10" data-testid="pos-search" />
        </div>
        {items.length === 0 ? (
          <div className="text-sm text-ink-muted text-center py-8">No items match.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {items.map((it) => (
              <button key={it.id} onClick={() => add(it)} className="text-left card-surface !bg-bg-elevated p-3 card-hover" data-testid={`pos-item-${it.id}`}>
                <div className="font-medium text-sm truncate">{it.name}</div>
                <div className="text-xs text-brand font-mono mt-1">{formatINR(it.price)}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card-surface p-5 flex flex-col">
        <div className="font-display text-lg font-medium">Cart</div>
        <div className="mt-4 space-y-2 flex-1">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-sm text-ink-muted">
              <ShoppingBag className="h-6 w-6 mx-auto mb-2 opacity-50" />
              Tap items to add
            </div>
          ) : (
            cart.map((line) => (
              <div key={line.id} className="rounded-lg bg-bg-elevated border border-line p-2.5 flex items-center gap-2" data-testid={`pos-cart-line-${line.id}`}>
                <div className="min-w-0 flex-1">
                  <div className="text-sm truncate">{line.name}</div>
                  <div className="text-[11px] text-ink-muted font-mono">{formatINR(line.price)} × {line.qty}</div>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full border border-line bg-bg-surface">
                  <button onClick={() => dec(line.id)} className="h-6 w-6 grid place-items-center rounded-full hover:bg-white/5"><Minus className="h-3 w-3" /></button>
                  <span className="text-xs font-mono min-w-[16px] text-center">{line.qty}</span>
                  <button onClick={() => inc(line.id)} className="h-6 w-6 grid place-items-center rounded-full hover:bg-white/5"><Plus className="h-3 w-3" /></button>
                </div>
                <button onClick={() => remove(line.id)} className="text-ink-muted hover:text-red-400"><X className="h-3.5 w-3.5" /></button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="mt-4 pt-4 border-t border-line space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Customer name (optional)" className="input-field !py-2 text-sm" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} data-testid="pos-customer-name" />
              <input placeholder="Phone (optional)" className="input-field !py-2 text-sm" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} data-testid="pos-customer-phone" />
            </div>
            <div className="text-sm flex justify-between"><span className="text-ink-secondary">Subtotal</span><span className="font-mono">{formatINR(subtotal)}</span></div>
            <div className="text-sm flex justify-between"><span className="text-ink-secondary">Tax (5%)</span><span className="font-mono">{formatINR(tax)}</span></div>
            <div className="flex justify-between items-center pt-2 border-t border-line"><span className="font-medium">Total</span><span className="font-mono text-lg font-semibold">{formatINR(total)}</span></div>
            <button onClick={place} disabled={busy} className="btn-primary w-full disabled:opacity-60" data-testid="pos-place-order-btn">
              {busy ? "…" : `Place order · ${formatINR(total)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SalonPOS({ storefront, employee, vendorId }) {
  const [q, setQ] = useState("");
  const [service, setService] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState("");
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(null);

  const services = (storefront.services || []).filter((s) => s.available && (!q || s.name.toLowerCase().includes(q.toLowerCase())));
  const slots = useMemo(() => (service ? getSlotsForDate(vendorId, date) : []), [service, date, vendorId]);

  const confirm = () => {
    if (!service) return toast.error("Pick a service");
    if (!slot) return toast.error("Pick a time slot");
    setBusy(true);
    setTimeout(() => {
      const b = createBooking({
        vendorId,
        storefrontId: storefront.id,
        employeeId: employee?.id || null,
        customer: { name: customer.name.trim() || "Walk-in", phone: customer.phone.trim() },
        service: { id: service.id, name: service.name, price: service.price, duration: service.duration },
        date, slot,
        notes: "",
      });
      setBusy(false);
      setCompleted(b);
      setService(null); setSlot(""); setCustomer({ name: "", phone: "" });
      toast.success(`Booking ${b.code} confirmed`);
    }, 300);
  };

  if (completed) {
    return (
      <div className="card-surface p-8 text-center max-w-md mx-auto">
        <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/15 border border-emerald-500/40 grid place-items-center">
          <Check className="h-6 w-6 text-emerald-400" />
        </div>
        <h2 className="mt-4 font-display text-2xl">Booking confirmed</h2>
        <div className="mt-2 font-mono text-salon">{completed.code}</div>
        <div className="mt-1 text-sm text-ink-secondary">{completed.service.name} · {completed.date} {completed.slot}</div>
        <button onClick={() => setCompleted(null)} className="btn-primary mt-6" data-testid="pos-new-booking-btn">Take another booking</button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 card-surface p-5">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services…" className="input-field pl-10" data-testid="pos-search" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => setService(s)}
              data-testid={`pos-service-${s.id}`}
              className={`text-left p-3 rounded-lg border transition-colors ${service?.id === s.id ? "border-salon/50 bg-salon/10" : "border-line bg-bg-elevated hover:border-white/20"}`}
            >
              <div className="font-medium text-sm truncate">{s.name}</div>
              <div className="text-xs text-salon font-mono mt-1">{formatINR(s.price)} · {s.duration}m</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card-surface p-5">
        <div className="font-display text-lg font-medium">Appointment</div>
        {service ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg bg-bg-elevated border border-line p-3 text-sm">
              <div className="font-medium">{service.name}</div>
              <div className="text-xs text-ink-muted">{formatINR(service.price)} · {service.duration}m</div>
            </div>
            <input type="date" className="input-field" value={date} onChange={(e) => { setDate(e.target.value); setSlot(""); }} data-testid="pos-date" />
            <div className="grid grid-cols-3 gap-1.5">
              {slots.map((s) => (
                <button key={s.time} disabled={!s.available} onClick={() => setSlot(s.time)} data-testid={`pos-slot-${s.time}`}
                  className={`py-1.5 rounded text-xs font-mono ${!s.available ? "opacity-30 line-through cursor-not-allowed" : slot === s.time ? "bg-salon/20 border border-salon/40 text-ink-primary" : "border border-line hover:border-white/20"}`}>
                  {s.time}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <input placeholder="Customer name" className="input-field !py-2 text-sm" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} data-testid="pos-customer-name" />
              <input placeholder="Phone (optional)" className="input-field !py-2 text-sm" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} data-testid="pos-customer-phone" />
            </div>
            <button onClick={confirm} disabled={busy} className="btn-primary w-full" data-testid="pos-confirm-booking-btn">
              {busy ? "…" : "Confirm booking"}
            </button>
          </div>
        ) : (
          <div className="mt-8 text-center text-sm text-ink-muted">Pick a service to begin</div>
        )}
      </div>
    </div>
  );
}
