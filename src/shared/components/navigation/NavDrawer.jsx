import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import ThemeToggle from "@/shared/components/controls/ThemeToggle";

/**
 * NavDrawer — reusable slide-in menu.
 *
 * Renders two panels for the two distinct layouts:
 *   - Mobile (< lg) → bottom sheet, scrollable, slides UP
 *   - Desktop (lg+) → right-side sheet, slides IN from the right
 *
 * Both share content built from a `sections` payload so pages provide
 * only existing content (no invented copy).
 */
export default function NavDrawer({ open, onClose, sections = [], footer, title = "Menu" }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[70] ${open ? "" : "invisible pointer-events-none"}`}
      aria-hidden={!open}
      data-testid="nav-drawer"
    >
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        data-testid="nav-drawer-backdrop"
      />

      {/* --- MOBILE bottom sheet (visible < lg) --- */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ position: "fixed", left: 0, right: 0, bottom: 0, maxHeight: "85vh" }}
        className={`lg:hidden w-full bg-bg-surface border border-line border-b-0 rounded-t-3xl grain overflow-hidden flex flex-col shadow-2xl transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        data-testid="nav-drawer-panel-mobile"
      >
        <Handle />
        <DrawerHeader title={title} onClose={onClose} />
        <DrawerBody sections={sections} onClose={onClose} />
        {footer && <DrawerFooter>{footer}</DrawerFooter>}
      </aside>

      {/* --- DESKTOP right-side sheet (visible lg+) --- */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 420, height: "100vh" }}
        className={`hidden lg:flex bg-bg-surface border border-line border-r-0 rounded-l-3xl grain overflow-hidden flex-col shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        data-testid="nav-drawer-panel-desktop"
      >
        <DrawerHeader title={title} onClose={onClose} />
        <DrawerBody sections={sections} onClose={onClose} />
        {footer && <DrawerFooter>{footer}</DrawerFooter>}
      </aside>
    </div>
  );
}

/* --------- Shared sub-components (Presentational) --------- */

function Handle() {
  return (
    <div className="pt-3 pb-1 grid place-items-center flex-shrink-0">
      <span className="h-1 w-10 rounded-full bg-white/15" />
    </div>
  );
}

function DrawerHeader({ title, onClose }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-line flex-shrink-0">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-brand">{title}</div>
        <div className="mt-0.5 font-display text-lg font-medium">Where would you like to go?</div>
      </div>
      <button
        onClick={onClose}
        className="h-9 w-9 grid place-items-center rounded-full border border-line bg-bg-elevated text-ink-secondary hover:text-ink-primary hover:border-white/20 transition-colors"
        aria-label="Close menu"
        data-testid="nav-drawer-close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function DrawerBody({ sections, onClose }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-6">
      {/* Theme toggle — persists globally */}
      <div className="flex items-center justify-between rounded-xl border border-line bg-bg-elevated/50 px-3 py-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-ink-muted">Appearance</div>
          <div className="mt-0.5 text-sm text-ink-primary">Dark or light theme</div>
        </div>
        <ThemeToggle testid="drawer-theme-toggle" />
      </div>
      {sections.map((section, si) => (
        <section key={section.title || si} data-testid={`nav-drawer-section-${si}`}>
          {section.title && (
            <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-2 px-2">
              {section.title}
            </div>
          )}
          <ul className="grid gap-1.5">
            {section.items.map((item, ii) => (
              <li key={item.label + ii}>
                <NavItem item={item} onClose={onClose} testid={`nav-drawer-item-${si}-${ii}`} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function DrawerFooter({ children }) {
  return (
    <div className="border-t border-line px-4 sm:px-6 py-4 space-y-2 bg-bg-elevated/40 flex-shrink-0">
      {children}
    </div>
  );
}

function NavItem({ item, onClose, testid }) {
  const { label, description, icon: Icon, to, href, external } = item;
  const commonClass =
    "group flex items-start gap-3 rounded-xl border border-line bg-bg-elevated/50 hover:bg-bg-elevated hover:border-brand/30 px-3 py-3 transition-colors";
  const inner = (
    <>
      {Icon && (
        <span className="h-9 w-9 rounded-lg bg-brand-soft border border-brand/30 grid place-items-center flex-shrink-0">
          <Icon className="h-4 w-4 text-brand" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ink-primary">{label}</span>
        {description && (
          <span className="block text-[11px] text-ink-muted mt-0.5">{description}</span>
        )}
      </span>
      <ArrowRight className="h-4 w-4 text-ink-muted group-hover:text-brand mt-1 flex-shrink-0 transition-colors" />
    </>
  );

  if (to) {
    return (
      <Link to={to} onClick={onClose} className={commonClass} data-testid={testid}>
        {inner}
      </Link>
    );
  }
  return (
    <a
      href={href}
      onClick={onClose}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={commonClass}
      data-testid={testid}
    >
      {inner}
    </a>
  );
}
