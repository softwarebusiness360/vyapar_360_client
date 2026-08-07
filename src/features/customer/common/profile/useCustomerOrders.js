import { useMemo } from "react";
import * as repository from "@/data/engagementRepository";

/**
 * useCustomerOrders — pull orders + bookings for the current customer.
 * Splits into `current` (active) vs `past` (completed/delivered/cancelled)
 * and also groups by channel (walk-in vs online).
 */

const ACTIVE_ORDER = ["pending", "confirmed", "preparing", "ready", "out_for_delivery"];
const ACTIVE_BOOKING = ["pending", "confirmed"];

export default function useCustomerOrders(customer) {
  const { getCustomerTransactions } = repository;
  return useMemo(() => {
    if (!customer) return { orders: [], bookings: [], current: [], past: [], byChannel: { online: [], walk_in: [] } };
    const { orders, bookings } = getCustomerTransactions({
      id: customer.id,
      phone: customer.phone,
      name: customer.name,
    });
    const merged = [
      ...orders.map((o) => ({ type: "order", ...o })),
      ...bookings.map((b) => ({ type: "booking", ...b })),
    ].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

    const isActive = (r) =>
      r.type === "order" ? ACTIVE_ORDER.includes(r.status) : ACTIVE_BOOKING.includes(r.status);
    const current = merged.filter(isActive);
    const past = merged.filter((r) => !isActive(r));
    const byChannel = {
      online: merged.filter((r) => (r.channel || "online") === "online"),
      walk_in: merged.filter((r) => r.channel === "walk_in"),
    };
    return { orders, bookings, merged, current, past, byChannel };
  }, [customer]);
}
