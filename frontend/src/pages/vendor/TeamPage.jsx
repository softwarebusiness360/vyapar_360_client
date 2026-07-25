import React, { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Users, Copy, Lock, X } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { addEmployee, deleteEmployee, updateEmployee, DEFAULT_EMPLOYEE_PERMISSIONS } from "../../lib/store";
import Modal from "../../components/Modal";
import UpgradeGate from "../../components/UpgradeGate";

export default function TeamPage() {
  const { vendor, refresh } = useAuth();
  const [openAdd, setOpenAdd] = useState(false);
  const [editing, setEditing] = useState(null);

  if (!vendor?.features?.employees) {
    return <UpgradeGate feature="Team members" description="Invite employees to help take orders and manage bookings — available on the Growth and Pro plans." />;
  }

  const employees = vendor.employees || [];
  const storefronts = vendor.storefronts || [];

  const openNew = () =>
    setEditing({
      id: null,
      name: "",
      email: "",
      password: "",
      storefrontIds: storefronts.map((s) => s.id),
      permissions: { ...DEFAULT_EMPLOYEE_PERMISSIONS },
      disabled: false,
    });

  const submit = () => {
    if (!editing.name.trim()) return toast.error("Name is required");
    if (!editing.email.trim()) return toast.error("Email is required");
    if (!editing.id && editing.password.length < 6) return toast.error("Password must be 6+ characters");
    if (editing.storefrontIds.length === 0) return toast.error("Assign at least one storefront");

    try {
      if (editing.id) {
        const patch = {
          name: editing.name.trim(),
          email: editing.email.trim(),
          storefrontIds: editing.storefrontIds,
          permissions: editing.permissions,
          disabled: editing.disabled,
        };
        if (editing.password) patch.password = editing.password;
        updateEmployee(vendor.id, editing.id, patch);
        toast.success("Employee updated");
      } else {
        addEmployee(vendor.id, {
          name: editing.name.trim(),
          email: editing.email.trim(),
          password: editing.password,
          storefrontIds: editing.storefrontIds,
          permissions: editing.permissions,
        });
        toast.success("Employee added — share their credentials");
      }
      setEditing(null);
      refresh();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const remove = (emp) => {
    if (!window.confirm(`Remove ${emp.name || emp.email}? They will lose access immediately.`)) return;
    deleteEmployee(vendor.id, emp.id);
    refresh();
    toast.success("Employee removed");
  };

  const toggleAssign = (sfId) => {
    const has = editing.storefrontIds.includes(sfId);
    setEditing({
      ...editing,
      storefrontIds: has ? editing.storefrontIds.filter((x) => x !== sfId) : [...editing.storefrontIds, sfId],
    });
  };

  const togglePerm = (key) => setEditing({ ...editing, permissions: { ...editing.permissions, [key]: !editing.permissions[key] } });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-muted">Access</div>
          <h1 className="mt-1 text-3xl font-display font-medium tracking-tight" data-testid="team-title">Team</h1>
          <p className="mt-1 text-ink-secondary">Employees who help take orders and manage bookings.</p>
        </div>
        <button onClick={openNew} className="btn-primary inline-flex items-center gap-2" data-testid="add-employee-btn">
          <Plus className="h-4 w-4" /> Add employee
        </button>
      </div>

      {employees.length === 0 ? (
        <div className="card-surface p-16 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-brand-soft border border-brand/30 grid place-items-center">
            <Users className="h-5 w-5 text-brand" />
          </div>
          <div className="mt-4 font-display text-lg">No employees yet</div>
          <p className="mt-1 text-ink-secondary text-sm">Add your first staff member — they'll log in with their own credentials and see only what you allow.</p>
          <button onClick={openNew} className="btn-primary mt-6 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add employee
          </button>
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="hidden md:grid grid-cols-12 px-5 py-3 text-[11px] uppercase tracking-widest text-ink-muted border-b border-line">
            <div className="col-span-4">Name / Email</div>
            <div className="col-span-3">Assigned storefronts</div>
            <div className="col-span-3">Permissions</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <ul className="divide-y divide-line">
            {employees.map((emp) => {
              const emps = storefronts.filter((s) => emp.storefrontIds.includes(s.id));
              const perms = Object.entries(emp.permissions || {}).filter(([, v]) => v).map(([k]) => k);
              return (
                <li key={emp.id} className="px-4 sm:px-5 py-4 grid md:grid-cols-12 gap-3 items-center" data-testid={`employee-row-${emp.id}`}>
                  <div className="md:col-span-4">
                    <div className="font-medium flex items-center gap-2">
                      {emp.name || <span className="text-ink-muted">Untitled</span>}
                      {emp.disabled && <span className="tag !text-[10px] !text-red-300 !border-red-500/30 !bg-red-500/10">Disabled</span>}
                    </div>
                    <div className="text-xs text-ink-muted">{emp.email}</div>
                  </div>
                  <div className="md:col-span-3 text-xs text-ink-secondary">
                    {emps.length === 0 ? <span className="text-ink-muted">None</span> : emps.map((s) => s.name || s.slug).join(", ")}
                  </div>
                  <div className="md:col-span-3 text-xs text-ink-secondary">
                    {perms.length === 0 ? <span className="text-ink-muted">—</span> : perms.map((p) => humanPerm(p)).join(", ")}
                  </div>
                  <div className="md:col-span-2 flex items-center gap-2 justify-start md:justify-end">
                    <button onClick={() => setEditing({ ...emp, password: "" })} className="btn-ghost !py-1.5 !px-3 text-xs" data-testid={`edit-employee-${emp.id}`}>Edit</button>
                    <button onClick={() => remove(emp)} className="h-8 w-8 grid place-items-center rounded-md text-ink-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors" aria-label="Remove" data-testid={`delete-employee-${emp.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)}>
        {editing && (
          <div>
            <h2 className="font-display text-xl font-medium mb-1">{editing.id ? "Edit employee" : "Add employee"}</h2>
            <p className="text-sm text-ink-secondary mb-5">They'll log in at the same login page. Their access is scoped by what you set below.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Row label="Name"><input className="input-field" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} data-testid="employee-name-input" /></Row>
                <Row label="Email"><input className="input-field" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} data-testid="employee-email-input" /></Row>
              </div>
              <Row label={editing.id ? "New password (leave blank to keep)" : "Password"}>
                <input type="password" className="input-field" value={editing.password} onChange={(e) => setEditing({ ...editing, password: e.target.value })} placeholder={editing.id ? "Leave blank to keep current" : "Min. 6 characters"} data-testid="employee-password-input" />
              </Row>

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
                        className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${on ? "bg-brand-soft border-brand/40 text-ink-primary" : "bg-bg-elevated border-line text-ink-secondary hover:text-ink-primary"}`}
                      >
                        {s.name || s.slug}
                        <div className="text-[10px] font-mono text-ink-muted mt-0.5">/{s.slug}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-widest text-ink-muted mb-2">Permissions</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(DEFAULT_EMPLOYEE_PERMISSIONS).map((k) => (
                    <label key={k} className="flex items-center gap-2 rounded-lg border border-line bg-bg-elevated px-3 py-2 cursor-pointer">
                      <input type="checkbox" checked={!!editing.permissions[k]} onChange={() => togglePerm(k)} data-testid={`employee-perm-${k}`} />
                      <span className="text-sm">{humanPerm(k)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {editing.id && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.disabled} onChange={(e) => setEditing({ ...editing, disabled: e.target.checked })} />
                  Disable account (prevents login)
                </label>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
                <button onClick={submit} className="btn-primary" data-testid="save-employee-btn">
                  {editing.id ? "Save" : "Add employee"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

const HUMAN = {
  takeOrders: "Take orders",
  takeBookings: "Take bookings",
  viewInsights: "View insights",
  editCatalogue: "Edit catalogue",
};
function humanPerm(k) { return HUMAN[k] || k; }
function Row({ label, children }) {
  return (
    <label className="block">
      <div className="text-xs uppercase tracking-widest text-ink-muted mb-1.5">{label}</div>
      {children}
    </label>
  );
}
