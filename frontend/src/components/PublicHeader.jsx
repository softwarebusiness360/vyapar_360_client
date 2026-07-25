import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Logo from "./Logo";
import { Container } from "./Container";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 glass border-b border-white/5">
      <Container className="flex items-center justify-between h-16">
        <Logo />
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
            className="btn-primary text-sm inline-flex items-center gap-1.5"
            data-testid="nav-register-btn"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </header>
  );
}
