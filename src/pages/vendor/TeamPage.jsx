import React, { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Users, ShieldCheck } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { useEmployees, useEmployeePerformance, useStorefronts, usePeriodFilter } from "../../hooks";
import Modal from "../../components/Modal";
import UpgradeGate from "../../components/UpgradeGate";
import EmployeePerformanceTable from "../../components/vendor/EmployeePerformanceTable";
import PeriodFilter from "../../components/vendor/PeriodFilter";
import StoreFilter from "../../components/vendor/StoreFilter";

const HUMAN_PERM = {
  takeOrders: "Take orders",
  takeBookings: "Take bookings",
  viewInsights: "View insights",
  editCatalogue: "Edit catalogue",
};
const ROLE_LABELS = {
  employee: "Employee — operational access only",
  manager: "Store Manager — near-owner access, no team/settings",
};

export default function TeamPage() {
  const { vendor } = useAuth();
  const { storefronts } = useStorefronts();
  const {
    employees,
    canAddMore,
    remainingSeats,
    maxEmployees,
    rolePresets,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
  } = useEmployees();
  const period = usePeriodFilter("30d");
  const [storeFilter, setStoreFilter] = useState("all");
  const [editing, setEditing] = useState(null);

  const scopedIds = storeFilter === "all" ? storefronts.map((s) => s.id) : [storeFilter];
  const perfRows = useEmployeePerformance({
    vendor,
    storefrontIds: scopedIds,
    from: period.from,
    to: period.to,
  });

  if (!vendor?.features?.employees) {
    return (
      <UpgradeGate
        feature="Team members"
        description="Invite employees to help take orders and manage bookings — available on Growth, Pro, and Enterprise plans."
      />
    );
  }

  const openNew = () => {
    if (!canAddMore) {
      toast.error(`You've reached your plan's limit of ${maxEmployees} team members.`);
      return;
    }
    setEditing({
      id: null,
      name: "",
      email: "",
      password: "",
      role: "employee",
      storefrontIds: storefronts.map((s) => s.id),
      permissions: { ...rolePresets.employee },
      disabled: false,
    });
  };

  const submit = async () => {
    if (!editing.name.trim()) return toast.error("Name is required");
    if (!editing.email.trim()) return toast.error("Email is required");
    if (!editing.id && editing.password.length < 6) return toast.error("Password must be 6+ characters");
    if (editing.storefrontIds.length === 0) return toast.error("Assign at least one storefront");

    try {
      if (editing.id) {
        const patch = {
          name: editing.name.trim(),
          email: editing.email.trim(),
          role: editing.role,
          storefrontIds: editing.storefrontIds,
          permissions: editing.permissions,
          disabled: editing.disabled,
        };
        if (editing.password) patch.password = editing.password;
        await updateTeamMember(editing.id, patch);
        toast.success("Team member updated");
      } else {
        await addTeamMember({
          name: editing.name.trim(),
          email: editing.email.trim(),
          password: editing.password,
          role: editing.role,
          storefrontIds: editing.storefrontIds,
          permissions: editing.permissions,
        });
        toast.success("Team member added — share credentials");
      }
      setEditing(null);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const confirmRemove = async (emp) => {
    if (!window.confirm(`Remove ${emp.name || emp.email}? They will lose access immediately.`)) return;
    await removeTeamMember(emp.id);
    toast.success("Team member removed");
  };

  const setRole = (nextRole) => {
    setEditing({
      ...editing,
      role: nextRole,
      permissions: { ...rolePresets[nextRole] },
    });
  };

  const toggleAssign = (sfId) => {
    const has = editing.storefrontIds.includes(sfId);
    setEditing({
      ...editing,
      storefrontIds: has ? editing.storefrontIds.filter((x) => x !== sfId) : [...editing.storefrontIds, sfId],
    });
  };
  const togglePerm = (key) =>
    setEditing({
      ...editing,
      permissions: { ...editing.permissions, [key]: !editing.permissions[key] },
    });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-muted">Access</div>
          <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="team-title">Team</h1>
          <p className="mt-1 text-ink-secondary">
            {employees.length} of {maxEmployees} seats used · {remainingSeats} remaining ({vendor.planConfig?.label} plan)
          </p>
        </div>
        <button
          onClick={openNew}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
          disabled={!canAddMore}
          data-testid="add-employee-btn"
        >
          <Plus className="h-4 w-4" /> Add team member
        </button>
      </div>

      {/* Roster */}
      {employees.length === 0 ? (
        <div className="card-surface p-16 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-brand-soft border border-brand/30 grid place-items-center">
            <Users className="h-5 w-5 text-brand" />
          </div>
          <div className="mt-4 font-display text-lg">No team members yet</div>
          <p className="mt-1 text-ink-secondary text-sm">
            Add your first staff member — they'll log in with their own credentials and see only what you allow.
          </p>
          <button onClick={openNew} className="btn-primary mt-6 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add team member
          </button>
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="hidden md:grid grid-cols-12 px-5 py-3 text-[11px] uppercase tracking-widest text-ink-muted border-b border-line">
            <div className="col-span-4">Name / Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-3">Assigned storefronts</div>
            <div className="col-span-2">Permissions</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          <ul className="divide-y divide-line">
            {employees.map((emp) => {
              const assigned = storefronts.filter((s) => emp.storefrontIds.includes(s.id));
              const perms = Object.entries(emp.permissions || {})
                .filter(([, v]) => v)
                .map(([k]) => HUMAN_PERM[k] || k);
              return (
                <li
                  key={emp.id}
                  className="px-4 sm:px-5 py-4 grid md:grid-cols-12 gap-3 items-center"
                  data-testid={`employee-row-${emp.id}`}
                >
                  <div className="md:col-span-4">
                    <div className="font-medium flex items-center gap-2">
                      {emp.name || <span className="text-ink-muted">Untitled</span>}
                      {emp.disabled && (
                        <span className="tag !text-[10px] !text-red-300 !border-red-500/30 !bg-red-500/10">Disabled</span>
                      )}
                    </div>
                    <div className="text-xs text-ink-muted">{emp.email}</div>
                  </div>
                  <div className="md:col-span-2 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                        emp.role === "manager"
                          ? "bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-300"
                          : "bg-white/5 border border-line text-ink-secondary"
                      }`}
                    >
                      {emp.role === "manager" ? <ShieldCheck className="h-2.5 w-2.5" /> : null}
                      {emp.role}
                    </span>
                  </div>
                  <div className="md:col-span-3 text-xs text-ink-secondary">
                    {assigned.length === 0 ? <span className="text-ink-muted">None</span> : assigned.map((s) => s.name || s.slug).join(", ")}
                  </div>
                  <div className="md:col-span-2 text-xs text-ink-secondary">
                    {perms.length === 0 ? <span className="text-ink-muted">—</span> : perms.join(", ")}
                  </div>
                  <div className="md:col-span-1 flex items-center gap-2 justify-start md:justify-end">
                    <button
                      onClick={() => setEditing({ ...emp, password: "" })}
                      className="btn-ghost !py-1.5 !px-3 text-xs"
                      data-testid={`edit-employee-${emp.id}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmRemove(emp)}
                      className="h-8 w-8 grid place-items-center rounded-md text-ink-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      aria-label="Remove"
                      data-testid={`delete-employee-${emp.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Performance panel */}
      <div className="space-y-3 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-ink-muted">Team</div>
            <h2 className="mt-1 font-display text-xl font-medium">Performance</h2>
            <p className="mt-1 text-sm text-ink-secondary">Orders handled, bookings managed, and revenue driven per employee.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StoreFilter
              storefronts={storefronts}
              value={storeFilter}
              onChange={setStoreFilter}
              testid="team-store-filter"
            />
            <PeriodFilter
              options={period.options}
              value={period.period}
              onChange={period.setPeriod}
              testid="team-period-filter"
            />
          </div>
        </div>
        <EmployeePerformanceTable
          rows={perfRows}
          isRestaurant={vendor.businessType === "restaurant"}
          onEdit={(emp) => setEditing({ ...emp, password: "" })}
        />
      </div>

      {/* Edit / add modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)}>
        {editing && (
          <div>
            <h2 className="font-display text-xl font-medium mb-1">
              {editing.id ? "Edit team member" : "Add team member"}
            </h2>
            <p className="text-sm text-ink-secondary mb-5">
              They'll log in at the same login page. Their access is scoped by what you set below.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Row label="Name">
                  <input
                    className="input-field"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    data-testid="employee-name-input"
                  />
                </Row>
                <Row label="Email">
                  <input
                    className="input-field"
                    value={editing.email}
                    onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                    data-testid="employee-email-input"
                  />
                </Row>
              </div>

              <Row label={editing.id ? "New password (leave blank to keep)" : "Password"}>
                <input
                  type="password"
                  className="input-field"
                  value={editing.password}
                  onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                  placeholder={editing.id ? "Leave blank to keep current" : "Min. 6 characters"}
                  data-testid="employee-password-input"
                />
              </Row>

              <div>
                <div className="text-xs uppercase tracking-widest text-ink-muted mb-2">Role</div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {["employee", "manager"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      data-testid={`employee-role-${r}`}
                      className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                        editing.role === r
                          ? "bg-brand-soft border-brand/40 text-ink-primary"
                          : "bg-bg-elevated border-line text-ink-secondary hover:text-ink-primary"
                      }`}
                    >
                      <div className="font-medium capitalize">{r === "manager" ? "Store Manager" : "Employee"}</div>
                      <div className="mt-0.5 text-[11px] text-ink-muted">{ROLE_LABELS[r]}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-widest text-ink-muted mb-2">Assigned storefronts</div>
                <div className="grid grid-cols-2 gap-2">
                  {storefronts.map((s) => {
                    const on = editing.storefrontIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleAssign(s.id)}
                        data-testid={`employee-assign-${s.id}`}
                        className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                          on
                            ? "bg-brand-soft border-brand/40 text-ink-primary"
                            : "bg-bg-elevated border-line text-ink-secondary hover:text-ink-primary"
                        }`}
                      >
                        {s.name || s.slug}
                        <div className="text-[10px] font-mono text-ink-muted mt-0.5">/{s.slug}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-widest text-ink-muted mb-2">
                  Permissions <span className="text-[10px] normal-case tracking-normal">(role sets defaults, override anytime)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(HUMAN_PERM).map((k) => (
                    <label
                      key={k}
                      className="flex items-center gap-2 rounded-lg border border-line bg-bg-elevated px-3 py-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!!editing.permissions[k]}
                        onChange={() => togglePerm(k)}
                        data-testid={`employee-perm-${k}`}
                      />
                      <span className="text-sm">{HUMAN_PERM[k]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {editing.id && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editing.disabled}
                    onChange={(e) => setEditing({ ...editing, disabled: e.target.checked })}
                  />
                  Disable account (prevents login)
                </label>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
                <button onClick={submit} className="btn-primary" data-testid="save-employee-btn">
                  {editing.id ? "Save" : "Add team member"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <label className="block">
      <div className="text-xs uppercase tracking-widest text-ink-muted mb-1.5">{label}</div>
      {children}
    </label>
  );
}
