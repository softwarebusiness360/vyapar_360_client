import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, MapPin, Phone } from "lucide-react";
import * as repository from "@/data/orderRepository";
import { formatINR, formatDateTime } from "../../../../lib/utils";
import StatusBadge from "@/shared/components/feedback/StatusBadge";
import Logo from "@/shared/components/branding/Logo";

export default function OrderConfirmationPage() {
  const { getOrders, getVendorBySlug, seedIfNeeded } = repository;
  const { slug, orderId } = useParams();
  const [state, setState] = useState({ vendor: null, order: null, loaded: false });

  useEffect(() => {
    seedIfNeeded();
    const v = getVendorBySlug(slug);
    const o = getOrders(v?.id).find((x) => x.id === orderId) || null;
    setState({ vendor: v, order: o, loaded: true });
  }, [slug, orderId]);

  if (!state.loaded) return null;
  if (!state.vendor || !state.order) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-display">Order not found</h1>
          <Link to="/discover" className="btn-primary mt-4 inline-flex">Discover stores</Link>
        </div>
      </div>
    );
  }
  const { vendor, order } = state;

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to={`/store/${vendor.slug}`} className="text-sm text-ink-secondary hover:text-ink-primary transition-colors" data-testid="confirm-back-store">
            Back to {vendor.name}
          </Link>
          <Logo size="sm" />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 18 }} className="mx-auto h-16 w-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 grid place-items-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </motion.div>
        <div className="mt-6 text-center">
          <div className="text-xs uppercase tracking-widest text-emerald-400">Order confirmed</div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-display font-medium tracking-tighter" data-testid="order-confirmation-title">
            Your order is on its way.
          </h1>
          <p className="mt-3 text-ink-secondary">
            The restaurant has received your order. You'll be notified as it progresses.
          </p>
        </div>

        <div className="mt-10 card-surface overflow-hidden" data-testid={`confirmation-order-${order.id}`}>
          <div className="px-6 py-5 border-b border-line flex items-center justify-between">
            <div>
              <div className="text-xs text-ink-muted font-mono">{order.code}</div>
              <div className="mt-0.5 text-sm text-ink-secondary">{formatDateTime(order.createdAt)}</div>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <div className="p-6 space-y-5">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-2">Items</div>
              <ul className="rounded-lg border border-line divide-y divide-line">
                {order.items.map((i) => (
                  <li key={i.id} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm">{i.name} <span className="text-ink-muted">×{i.qty}</span></span>
                    <span className="font-mono text-sm">{formatINR(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatINR(order.subtotal)} />
              <Row label="Tax" value={formatINR(order.tax)} />
              <Row label="Total paid" value={formatINR(order.total)} bold />
            </div>
            <div className="pt-5 border-t border-line grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-1">Delivering to</div>
                <div>{order.customer.name}</div>
                <div className="mt-1 text-ink-secondary inline-flex items-start gap-1.5"><MapPin className="h-3.5 w-3.5 mt-0.5" /> {order.customer.address}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-1">Contact</div>
                <div className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {order.customer.phone}</div>
                {order.notes && <div className="mt-2 text-ink-secondary">"{order.notes}"</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={`/store/${vendor.slug}`} className="btn-primary inline-flex items-center gap-2" data-testid="order-back-menu">
            Order more from {vendor.name} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/discover" className="btn-ghost inline-flex items-center gap-2">Discover more stores</Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "text-ink-primary font-medium" : "text-ink-secondary"}>{label}</span>
      <span className={`font-mono ${bold ? "text-lg font-semibold" : ""}`}>{value}</span>
    </div>
  );
}
