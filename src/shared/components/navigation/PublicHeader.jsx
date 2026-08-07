import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LayoutGrid, LogIn, Sparkles, Tag } from "lucide-react";
import Logo from "@/shared/components/branding/Logo";
import { Container } from "@/shared/components/layout/Container";
import NavDrawer from "./NavDrawer";
import NavToggle from "./NavToggle";

const defaults = [
  { id: "features", label: "Features", href: "/#features", visible: true },
  { id: "pricing", label: "Pricing", href: "/#pricing", visible: true },
  { id: "business-types", label: "Business Types", href: "/#business-types", visible: true },
];
const icons = { features: Sparkles, pricing: Tag, "business-types": LayoutGrid };

export default function PublicHeader({ brand = {}, navigation = {} }) {
  const [open, setOpen] = useState(false);
  const items = (navigation.items || defaults).filter((item) => item.visible !== false);
  const loginLabel = navigation.loginLabel || "Business login";
  const loginTo = navigation.loginTo || "/login";
  const ctaLabel = navigation.ctaLabel || "Start free";
  const ctaTo = navigation.ctaTo || "/register";
  const sections = [
    { title: "Explore", items: items.map((item) => ({ ...item, icon: icons[item.id] || Sparkles })) },
    { title: "Your business", items: [{ label: loginLabel, description: "For owners and team members", icon: LogIn, to: loginTo }] },
  ];
  const footer = <Link to={ctaTo} onClick={() => setOpen(false)} className="btn-primary w-full inline-flex items-center justify-center gap-2" data-testid="drawer-cta-register">{ctaLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>;

  return <>
    <header className="sticky top-0 z-40 glass border-b border-white/5">
      <Container className="flex h-16 items-center gap-3">
        <Logo name={brand.name} logoUrl={brand.logoUrl} />
        <nav className="ml-auto hidden items-center gap-6 text-sm lg:flex" aria-label="Primary navigation" data-testid="desktop-primary-nav">
          {items.map((item) => <a key={item.id || item.label} href={item.href} className="rounded-md px-1 py-2 text-ink-secondary transition-colors hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-brand" data-testid={`nav-${item.id}`}>{item.label}</a>)}
          <Link to={loginTo} className="rounded-lg px-3 py-2 text-ink-secondary transition-colors hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-brand" data-testid="nav-login-btn">{loginLabel}</Link>
          <Link to={ctaTo} className="btn-primary inline-flex items-center gap-1.5 text-sm" data-testid="nav-register-btn">{ctaLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </nav>
        <Link to={ctaTo} className="btn-primary ml-auto inline-flex items-center gap-1.5 whitespace-nowrap px-3 text-sm lg:hidden" data-testid="nav-register-mobile">{ctaLabel}</Link>
      </Container>
    </header>
    <NavToggle onOpen={() => setOpen(true)} variant="floating" testid="nav-toggle-floating" />
    <NavDrawer open={open} onClose={() => setOpen(false)} sections={sections} footer={footer} />
  </>;
}
