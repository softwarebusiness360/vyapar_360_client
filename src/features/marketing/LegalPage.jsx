import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/shared/components/branding/Logo";
import { Container } from "@/shared/components/layout/Container";
import * as repository from "@/data/adminRepository";

export default function LegalPage({ page }) {
  const cfg = repository.getLandingConfig();
  const content = cfg.legal?.[page];

  if (!content) return null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <Container className="h-16 flex items-center justify-between">
          <Logo name={cfg.brand?.name} logoUrl={cfg.brand?.logoUrl} />
          <Link to="/" className="text-sm text-ink-secondary hover:text-ink-primary">Back to home</Link>
        </Container>
      </header>
      <main>
        <Container className="max-w-3xl py-16 sm:py-24">
          <h1 className="text-4xl sm:text-5xl font-display font-medium tracking-tight" data-testid={`legal-${page}-title`}>{content.title}</h1>
          <div className="mt-8 space-y-5 text-ink-secondary leading-relaxed">
            {(content.paragraphs || []).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        </Container>
      </main>
    </div>
  );
}
