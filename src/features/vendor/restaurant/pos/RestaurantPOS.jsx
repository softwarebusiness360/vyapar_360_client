import React, { useState } from "react";
import { Check, Search } from "lucide-react";
import { toast } from "sonner";
import { createOrder } from "@/data/orderRepository";
import { formatINR } from "@/lib/utils";

export default function RestaurantPOS({ storefront, employee, vendorId }) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [completed, setCompleted] = useState(null);
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
    const order = createOrder({
      vendorId,
      storefrontId: storefront.id,
      employeeId: employee?.id || null,
      customer: { name: "Walk-in", phone: "" },
      items: cart,
      subtotal: total,
      tax: 0,
      total,
      notes: "",
    });
    setCompleted(order);
    setCart([]);
    toast.success(`Order ${order.code} placed`);
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
        <button className="btn-primary w-full mt-4" data-testid="pos-place-order-btn" onClick={place}>Place order</button>
      </div>
    </div>
  );
}
