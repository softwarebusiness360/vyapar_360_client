import React from "react";
import { Trophy, Users } from "lucide-react";
import { formatINR } from "../../lib/utils";

/**
 * EmployeePerformanceTable — pure presentational grid of employee KPIs.
 * Consumers pass `rows` from useEmployeePerformance().
 */
export default function EmployeePerformanceTable({ rows, onEdit, isRestaurant = true }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="card-surface p-12 text-center" data-testid="team-perf-empty">
        <Users className="h-6 w-6 mx-auto text-ink-muted" />
        <div className="mt-3 font-display text-lg">No team activity in this period</div>
        <p className="mt-1 text-ink-secondary text-sm">
          Invite team members and assign them to storefronts to see performance metrics here.
        </p>
      </div>
    );
  }

  const topRevenue = Math.max(...rows.map((r) => r.revenue), 1);

  return (
    <div className="card-surface overflow-hidden" data-testid="team-perf-table">
      <div className="hidden md:grid grid-cols-12 px-5 py-3 text-[11px] uppercase tracking-widest text-ink-muted border-b border-line">
        <div className="col-span-4">Employee</div>
        <div className="col-span-3">Assigned storefronts</div>
        <div className="col-span-1">{isRestaurant ? "Orders" : "Bookings"}</div>
        <div className="col-span-2">Revenue</div>
        <div className="col-span-1">Avg ticket</div>
        <div className="col-span-1 text-right">Action</div>
      </div>
      <ul className="divide-y divide-line">
        {rows.map((r, i) => {
          const isTop = r.revenue > 0 && r.revenue === topRevenue;
          return (
            <li
              key={r.employee.id}
              className="px-4 sm:px-5 py-4 grid md:grid-cols-12 gap-3 items-center hover:bg-white/[0.02] transition-colors"
              data-testid={`team-perf-row-${r.employee.id}`}
            >
              <div className="md:col-span-4 flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-brand-soft border border-brand/30 grid place-items-center flex-shrink-0 text-brand font-medium text-sm">
                  {(r.employee.name || r.employee.email).slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate flex items-center gap-2">
                    {r.employee.name || <span className="text-ink-muted">Unnamed</span>}
                    {isTop && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 border border-amber-500/40 text-amber-300">
                        <Trophy className="h-2.5 w-2.5" /> Top
                      </span>
                    )}
                    <RoleTag role={r.employee.role} />
                  </div>
                  <div className="text-[11px] text-ink-muted truncate">{r.employee.email}</div>
                </div>
              </div>
              <div className="md:col-span-3 text-xs text-ink-secondary">
                {r.assignedStores.length === 0 ? (
                  <span className="text-ink-muted">Unassigned</span>
                ) : (
                  r.assignedStores.map((s) => s.name || s.slug).join(" · ")
                )}
              </div>
              <div className="md:col-span-1 font-mono text-sm">
                {isRestaurant ? r.orders : r.bookings}
              </div>
              <div className="md:col-span-2">
                <div className="font-mono text-sm">{formatINR(r.revenue)}</div>
                <div className="mt-1 h-1 w-full rounded-full bg-bg-elevated overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-fuchsia-500"
                    style={{ width: `${(r.revenue / topRevenue) * 100}%` }}
                  />
                </div>
              </div>
              <div className="md:col-span-1 font-mono text-xs text-ink-secondary">
                {formatINR(r.avgTicket)}
              </div>
              <div className="md:col-span-1 flex justify-start md:justify-end">
                {onEdit && (
                  <button
                    onClick={() => onEdit(r.employee)}
                    className="btn-ghost !py-1.5 !px-2.5 inline-flex items-center gap-1 text-xs"
                    data-testid={`team-perf-edit-${r.employee.id}`}
                  >
                    Manage
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RoleTag({ role }) {
  if (!role || role === "employee") return null;
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-300">
      {role}
    </span>
  );
}
