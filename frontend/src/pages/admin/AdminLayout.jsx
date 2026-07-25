import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Receipt,
  CalendarClock,
  Sparkles,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  BadgeDollarSign,
} from "lucide-react";
import Logo from "../../components/Logo";
import { useAdminAuth } from "../../lib/adminAuth";

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = [
    { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true, testid: "admin-nav-overview" },
    { to: "/admin/businesses", icon: Store, label: "Businesses", testid: "admin-nav-businesses" },
    { to: "/admin/orders", icon: Receipt, label: "All orders", testid: "admin-nav-orders" },
    { to: "/admin/bookings", icon: CalendarClock, label: "All bookings", testid: "admin-nav-bookings" },
    { to: "/admin/plans", icon: BadgeDollarSign, label: "Plan matrix", testid: "admin-nav-plans" },
    { to: "/admin/landing", icon: Sparkles, label: "Landing CMS", testid: "admin-nav-landing" },
  ];

  const doLogout = () => {
    logout();
    nav("/admin/login");
  };

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-30 border-b border-line bg-bg-base/95 backdrop-blur">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-brand px-1.5 py-0.5 rounded border border-brand/40 bg-brand-soft">
              Admin
            </span>
          </div>
          <button className="btn-ghost !p-2" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex sticky top-0 h-screen w-64 flex-col border-r border-line bg-bg-surface/40">
          <div className="h-16 px-5 flex items-center border-b border-line justify-between">
            <Logo size="sm" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-brand px-1.5 py-0.5 rounded border border-brand/40 bg-brand-soft">
              Admin
            </span>
          </div>

          <div className="p-4 border-b border-line">
            <div className="flex items-center gap-3 rounded-xl bg-bg-elevated border border-line p-3">
              <div className="h-9 w-9 rounded-lg bg-brand-soft border border-brand/40 grid place-items-center">
                <ShieldCheck className="h-4 w-4 text-brand" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{admin?.name}</div>
                <div className="text-[11px] uppercase tracking-widest text-ink-muted">{admin?.role}</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {items.map((it) => <SidebarLink key={it.to} {...it} />)}
          </nav>

          <div className="p-3 border-t border-line">
            <button
              onClick={doLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-secondary hover:bg-white/5 hover:text-ink-primary transition-colors"
              data-testid="admin-logout-btn"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <aside className="relative w-72 bg-bg-surface border-r border-line flex flex-col animate-fade-in-up">
              <div className="h-14 px-4 flex items-center justify-between border-b border-line">
                <div className="flex items-center gap-2">
                  <Logo size="sm" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-brand px-1.5 py-0.5 rounded border border-brand/40 bg-brand-soft">
                    Admin
                  </span>
                </div>
                <button className="btn-ghost !p-2" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1" onClick={() => setMobileOpen(false)}>
                {items.map((it) => <SidebarLink key={it.to} {...it} />)}
              </nav>
              <div className="p-3 border-t border-line">
                <button onClick={doLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-secondary hover:bg-white/5">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </aside>
          </div>
        )}

        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10" data-testid="admin-dashboard-main">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ to, icon: Icon, label, end, testid }) {
  return (
    <NavLink
      to={to}
      end={end}
      data-testid={testid}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
          isActive
            ? "bg-brand-soft text-ink-primary border border-brand/30"
            : "text-ink-secondary hover:bg-white/5 hover:text-ink-primary border border-transparent"
        }`
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );
}
