import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Receipt,
  CalendarClock,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Store,
  Users,
  Zap,
  UserCircle,
} from "lucide-react";
import Logo from "../../components/Logo";
import ThemeToggle from "../../components/ThemeToggle";
import { useAuth } from "../../lib/auth";

export default function VendorDashboardLayout() {
  const { vendor, employee, role, isOwner, logout } = useAuth();
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isRestaurant = vendor?.businessType === "restaurant";
  const perms = employee?.permissions || {};

  const items = [];
  // Owner sees everything; employee sees only permitted tabs
  if (isOwner) {
    items.push({ to: "/dashboard", icon: LayoutDashboard, label: "Overview", end: true, testid: "nav-overview" });
  }
  items.push({ to: "/dashboard/pos", icon: Zap, label: "POS", testid: "nav-pos" });
  if (isOwner || perms.editCatalogue) {
    items.push({ to: "/dashboard/catalogue", icon: Package, label: isRestaurant ? "Menu" : "Services", testid: "nav-catalogue" });
  }
  if (isOwner || perms.takeOrders) {
    if (isRestaurant) items.push({ to: "/dashboard/orders", icon: Receipt, label: "Orders", testid: "nav-orders" });
  }
  if (isOwner || perms.takeBookings) {
    if (!isRestaurant) items.push({ to: "/dashboard/bookings", icon: CalendarClock, label: "Bookings", testid: "nav-bookings" });
  }
  if (isOwner || perms.viewInsights) {
    items.push({ to: "/dashboard/insights", icon: BarChart3, label: "Insights", testid: "nav-insights" });
  }
  if (isOwner && vendor?.features?.multiStore) {
    items.push({ to: "/dashboard/storefronts", icon: Store, label: "Storefronts", testid: "nav-storefronts" });
  }
  if (isOwner && vendor?.features?.employees) {
    items.push({ to: "/dashboard/team", icon: Users, label: "Team", testid: "nav-team" });
  }
  if (isOwner) {
    items.push({ to: "/dashboard/settings", icon: Settings, label: "Store settings", testid: "nav-settings" });
  }
  // Profile is available for every signed-in role
  items.push({ to: "/dashboard/profile", icon: UserCircle, label: "My profile", testid: "nav-profile" });

  const doLogout = () => {
    logout();
    nav("/");
  };

  const displayName = employee?.name || vendor?.name || "Store";
  const displayRoleLabel = employee
    ? (employee.role === "manager" ? "Store Manager" : "Employee")
    : (vendor?.businessType || "owner");

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-30 border-b border-line bg-bg-base/95 backdrop-blur">
        <div className="h-14 px-4 flex items-center justify-between">
          <Logo size="sm" />
          <button
            className="btn-ghost !p-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            data-testid="mobile-menu-btn"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:flex sticky top-0 h-screen w-64 flex-col border-r border-line bg-bg-surface/40">
          <div className="h-16 px-5 flex items-center border-b border-line">
            <Logo size="sm" />
          </div>

          <div className="p-4 border-b border-line">
            <div className="flex items-center gap-3 rounded-xl bg-bg-elevated border border-line p-3">
              <div className="h-9 w-9 rounded-lg bg-bg-surface border border-line overflow-hidden grid place-items-center flex-shrink-0">
                {vendor?.logo ? <img src={vendor.logo} alt="" className="h-full w-full object-cover" /> : <Store className="h-4 w-4 text-ink-muted" />}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate" data-testid="sidebar-vendor-name">{displayName}</div>
                <div className="text-[11px] uppercase tracking-widest text-ink-muted">{displayRoleLabel}</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {items.map((it) => (
              <SidebarLink key={it.to} {...it} />
            ))}
          </nav>

          <div className="p-3 border-t border-line space-y-1">
            <a
              href={`/store/${vendor?.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-secondary hover:bg-white/5 hover:text-ink-primary transition-colors"
              data-testid="view-store-btn"
            >
              <ExternalLink className="h-4 w-4" /> View storefront
            </a>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-[10px] uppercase tracking-widest text-ink-muted">Theme</span>
              <ThemeToggle variant="icon" testid="vendor-theme-toggle" />
            </div>
            <button
              onClick={doLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-secondary hover:bg-white/5 hover:text-ink-primary transition-colors"
              data-testid="logout-btn"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        {/* Sidebar - mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <aside className="relative w-72 bg-bg-surface border-r border-line flex flex-col animate-fade-in-up">
              <div className="h-14 px-4 flex items-center justify-between border-b border-line">
                <Logo size="sm" />
                <button className="btn-ghost !p-2" onClick={() => setMobileOpen(false)} data-testid="mobile-menu-close-btn">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 border-b border-line">
                <div className="text-sm font-medium">{vendor?.name}</div>
                <div className="text-[11px] uppercase tracking-widest text-ink-muted">{vendor?.businessType}</div>
              </div>
              <nav className="flex-1 p-3 space-y-1" onClick={() => setMobileOpen(false)}>
                {items.map((it) => (
                  <SidebarLink key={it.to} {...it} />
                ))}
              </nav>
              <div className="p-3 border-t border-line space-y-1">
                <a href={`/store/${vendor?.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-secondary hover:bg-white/5">
                  <ExternalLink className="h-4 w-4" /> View storefront
                </a>
                <button onClick={doLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-secondary hover:bg-white/5">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10" data-testid="vendor-dashboard-main">
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
