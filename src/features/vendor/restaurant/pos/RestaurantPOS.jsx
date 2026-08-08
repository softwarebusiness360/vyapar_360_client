import React, { useState } from "react";
import { Check, Search } from "lucide-react";
import { toast } from "sonner";
import { createOrder } from "@/data/orderRepository";
import { formatINR } from "@/lib/utils";
import { isValidPhone, sanitizePhoneInput } from "@/shared/validation/phone";
import { normalizeOrderMode } from "@/domain/restaurantOrders";

export default function RestaurantPOS({ storefront, employee, vendor, vendorId }) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [completed, setCompleted] = useState(null);
  const mode = normalizeOrderMode(vendor?.orderMode);
  const [source, setSource] = useState(mode === "counter" ? "counter" : mode === "table" ? "table" : "");
  const [tableId, setTableId] = useState("");
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const items = (storefront.items || []).filter(
    (item) => item.available && item.name.toLowerCase().includes(query.toLowerCase())
  );
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const add = (item) => setCart((current) => {
    const existing = current.find((entry) => entry.id === item.id);
    return existing
      ? current.map((entry) => entry.id === item.id ? { ...entry, qty: entry.qty + 1 } : entry)
      : [...current, { id: item.id, name: item.name, price: item.price, qty: 1 }];
  });

  const place = () => {
    if (!cart.length) return toast.error("Add at least one item");
    if (!source) return toast.error("Choose Counter or Table");
    const table = (vendor?.tables || []).find((entry) => entry.id === tableId && entry.storefrontId === storefront.id);
    if (source === "table" && !table) return toast.error("Choose a valid table");
    if (customer.phone && !isValidPhone(customer.phone)) return toast.error("Enter a valid phone number");
    try {
    const order = createOrder({
      vendorId,
      storefrontId: storefront.id,
      employeeId: employee?.id || null,
      customer: { name: customer.name.trim() || "Walk-in", phone: customer.phone.trim() },
      source,
      channel: "walk_in",
      tableId: table?.id || null,
      tableLabel: table?.label || null,
      items: cart,
      subtotal: total,
      tax: 0,
      total,
      notes: "",
    });
    setCompleted(order);
    setCart([]);
    toast.success(`Order ${order.code} placed`);
    } catch (error) { toast.error(error?.message || "Could not create the order. Try again."); }
  };

  if (completed) return (
    <div className="card-surface p-8 text-center" data-testid="restaurant-pos-complete">
      <Check className="mx-auto text-emerald-400" />
      <h2 className="mt-4 font-display text-2xl">Order confirmed</h2>
      <div className="font-mono text-brand">{completed.code}</div>
      <button className="btn-primary mt-6" onClick={() => setCompleted(null)}>Take another order</button>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-3 gap-4" data-testid="restaurant-pos">
      <div className="lg:col-span-2 card-surface p-5">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4" />
          <input className="input-field pl-10" placeholder="Search menu…" value={query}
            onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {items.map((item) => (
            <button key={item.id} className="card-surface p-3 text-left"
              data-testid={`pos-item-${item.id}`} onClick={() => add(item)}>
              <div>{item.name}</div><div className="text-brand">{formatINR(item.price)}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="card-surface p-5">
        <h2 className="font-display text-lg">Cart</h2>
        {cart.map((item) => <div key={item.id}>{item.name} × {item.qty}</div>)}
        <div className="mt-4">{formatINR(total)}</div>
        {mode === "both" && <fieldset className="mt-4"><legend className="text-sm mb-2">Order source</legend><div className="flex gap-4">{["counter", "table"].map((value) => <label key={value} className="min-h-[44px] flex items-center gap-2"><input type="radio" name="source" value={value} checked={source === value} onChange={() => setSource(value)} data-testid={`order-source-${value}`} /> {value === "counter" ? "Counter" : "Table"}</label>)}</div></fieldset>}
        {source === "table" && <label className="block mt-3 text-sm">Table<select className="input-field mt-1" value={tableId} onChange={(event) => setTableId(event.target.value)} data-testid="new-order-table"><option value="">Choose a table</option>{(vendor?.tables || []).filter((table) => table.storefrontId === storefront.id).map((table) => <option key={table.id} value={table.id}>{table.label}</option>)}</select></label>}
        <label className="block mt-3 text-sm">Customer name (optional)<input className="input-field mt-1" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} data-testid="new-order-customer-name" /></label>
        <label className="block mt-3 text-sm">Phone (optional)<input className="input-field mt-1" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: sanitizePhoneInput(event.target.value) })} data-testid="new-order-customer-phone" /></label>
        <button className="btn-primary w-full mt-4" data-testid="pos-place-order-btn" onClick={place}>Place order</button>
      </div>
    </div>
  );
}
