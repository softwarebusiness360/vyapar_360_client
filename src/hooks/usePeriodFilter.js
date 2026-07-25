/**
 * usePeriodFilter — one-shot hook to drive the "Today / 7 days / 30 days / MTD"
 * pill filter used across the Overview / Insights / Team-performance pages.
 *
 * Returns the current period, its ISO bounds, and a setter — plus a stable
 * list of options for rendering the toggle group.
 */
import { useMemo, useState, useCallback } from "react";

export const PERIODS = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "mtd", label: "Month to date" },
  { id: "all", label: "All time" },
];

function boundsFor(period) {
  const now = new Date();
  const to = new Date(now); to.setHours(23, 59, 59, 999);
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  if (period === "today") return { from: from.toISOString(), to: to.toISOString() };
  if (period === "7d") { from.setDate(from.getDate() - 6); return { from: from.toISOString(), to: to.toISOString() }; }
  if (period === "30d") { from.setDate(from.getDate() - 29); return { from: from.toISOString(), to: to.toISOString() }; }
  if (period === "mtd") { from.setDate(1); return { from: from.toISOString(), to: to.toISOString() }; }
  return { from: undefined, to: undefined }; // "all"
}

export default function usePeriodFilter(initial = "30d") {
  const [period, setPeriod] = useState(initial);
  const bounds = useMemo(() => boundsFor(period), [period]);
  const setById = useCallback((id) => setPeriod(id), []);
  const currentLabel = PERIODS.find((p) => p.id === period)?.label || "";
  return { period, setPeriod: setById, from: bounds.from, to: bounds.to, options: PERIODS, currentLabel };
}
