import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Tag,
  Compass,
  LayoutGrid,
  LogIn,
  Rocket,
  HelpCircle,
  Utensils,
} from "lucide-react";
import Logo from "./Logo";
import { Container } from "./Container";
import NavDrawer from "./NavDrawer";
import NavToggle from "./NavToggle";

/**
 * PublicHeader — sticky top header + reusable NavDrawer.
 *
 * The horizontal nav stays visible on `md+` for quick access, but we ALSO
 * expose a hamburger on the top-right at every breakpoint. On mobile a
 * floating hamburger sits at the bottom-right so it's always reachable
 * while scrolling. Both triggers open the SAME scrollable drawer.
 */
export default function PublicHeader() {
  const [open, setOpen] = useState(false);

  const sections = [
    {
      title: "Explore",
      items: [
        { label: "Features",       description: "What's included in every store", icon: Sparkles,   href: "/#features" },
        { label: "Pricing",        description: "Free, Growth, Pro, Enterprise",  icon: Tag,        href: "/#pricing" },
        { label: "Business types", description: "Restaurants, salons & more",     icon: LayoutGrid, href: "/#business-types" },
        { label: "How it works",   description: "From signup to first order",     icon: Rocket,     href: "/#how-it-works" },
        { label: "FAQ",            description: "Quick answers to common ones",   icon: HelpCircle, href: "/#faq" },
      ],
    },
    {
      title: "Discover stores",
      items: [
        { label: "Browse the directory", description: "See live restaurants & salons", icon: Compass, to: "/discover" },
        { label: "Try a demo store",     description: "Order from Pizza Hub",           icon: Utensils, to: "/store/pizza-hub" },
      ],
    },
    {
      title: "Vendors",
      items: [
        { label: "Sign in",           description: "Owners & team members",         icon: LogIn,   to: "/login" },
        { label: "Start a free store", description: "Sign up — no credit card",     icon: Rocket,  to: "/register" },
      ],
    },
  ];

  const footer = (
    <>
      <Link
        to="/register"
        onClick={() => setOpen(false)}
        className="btn-primary w-full inline-flex items-center justify-center gap-2"
        data-testid="drawer-cta-register"
      >
        Get started free <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        to="/login"
        onClick={() => setOpen(false)}
        className="btn-ghost w-full inline-flex items-center justify-center gap-2"
        data-testid="drawer-cta-signin"
      >
        Sign in
      </Link>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-40 glass border-b border-white/5">
        <Container className="flex items-center justify-between h-16 gap-3">
          <Logo />

          {/* Inline nav — kept as-is on md+ for quick access */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-ink-secondary">
            <a href="/#features" className="hover:text-ink-primary transition-colors" data-testid="nav-features">Features</a>
            <a href="/#pricing" className="hover:text-ink-primary transition-colors" data-testid="nav-pricing">Pricing</a>
            <a href="/#business-types" className="hover:text-ink-primary transition-colors" data-testid="nav-business-types">Business Types</a>
            <Link to="/discover" className="hover:text-ink-primary transition-colors" data-testid="nav-discover">Discover Stores</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-sm text-ink-secondary hover:text-ink-primary px-3 py-2 rounded-lg transition-colors"
              data-testid="nav-login-btn"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="hidden sm:inline-flex btn-primary text-sm items-center gap-1.5"
              data-testid="nav-register-btn"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            {/* Top hamburger — visible on desktop (per user request) and small screens */}
            <NavToggle onOpen={() => setOpen(true)} variant="top" testid="nav-toggle-top" />
          </div>
        </Container>
      </header>

      {/* Floating bottom hamburger — mobile only, always reachable while scrolling */}
      <NavToggle onOpen={() => setOpen(true)} variant="floating" testid="nav-toggle-floating" />

      <NavDrawer open={open} onClose={() => setOpen(false)} sections={sections} footer={footer} />
    </>
  );
}
