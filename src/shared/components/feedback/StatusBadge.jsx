import React from "react";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  pending: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  preparing: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  ready: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  delivered: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  confirmed: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  completed: "bg-zinc-500/10 text-zinc-300 border-zinc-500/30",
  cancelled: "bg-red-500/10 text-red-300 border-red-500/30",
};

const LABEL = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready",
  delivered: "Delivered",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function StatusBadge({ status, className = "" }) {
  const style = STATUS_STYLES[status] || "bg-zinc-500/10 text-zinc-300 border-zinc-500/30";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border tracking-wide",
        style,
        className
      )}
      data-testid={`status-badge-${status}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABEL[status] || status}
    </span>
  );
}
