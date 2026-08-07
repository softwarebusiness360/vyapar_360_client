import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/shared/components/branding/Logo";
import { Container } from "./Container";

export default function PublicFooter() {
  return (
    <footer className="border-t border-line mt-24">
      <Container className="py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <Logo size="sm" />
          <p className="mt-3 text-sm text-ink-secondary max-w-sm">
            Give your local business a beautiful digital storefront. Built for restaurants,
            salons, and every neighbourhood brand.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-secondary">
          <Link to="/discover" className="hover:text-ink-primary transition-colors">Discover</Link>
          <Link to="/register" className="hover:text-ink-primary transition-colors">Start a store</Link>
          <Link to="/login" className="hover:text-ink-primary transition-colors">Vendor sign in</Link>
        </div>
      </Container>
      <div className="border-t border-line">
        <Container className="py-5 text-xs text-ink-muted flex items-center justify-between">
          <span>© {new Date().getFullYear()} Vyapar360. Crafted for local businesses.</span>
          <span className="hidden sm:inline">MVP · LocalStorage powered</span>
        </Container>
      </div>
    </footer>
  );
}
