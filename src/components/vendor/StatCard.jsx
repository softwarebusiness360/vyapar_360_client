import React from "react";
import { motion } from "framer-motion";

/**
 * StatCard — a single KPI tile.
 * Pure presentational: no data-fetching, everything comes via props.
 */
export default function StatCard({ icon: Icon, label, value, tint = "text-brand", ring = "border-brand/30 bg-brand-soft", index = 0, testid }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="card-surface p-4 sm:p-5"
      data-testid={testid}
    >
      <div className={`h-9 w-9 rounded-lg border grid place-items-center ${ring}`}>
        {Icon ? <Icon className={`h-4 w-4 ${tint}`} /> : null}
      </div>
      <div className="mt-4 text-[11px] uppercase tracking-widest text-ink-muted">{label}</div>
      <div className="mt-1 font-display font-semibold text-2xl tracking-tight">{value}</div>
    </motion.div>
  );
}
