import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/shared/components/branding/Logo";
import { Container } from "./Container";
import { APP_CONFIG } from "@/config/appConfig";

const DEFAULT_FOOTER = { description: "Take your local business online.", links: [], copyrightSuffix: "Built for local businesses." };

export default function PublicFooter({ footer = DEFAULT_FOOTER }) {
  const openSupport = () => window.dispatchEvent(new CustomEvent("vyapar360:open-support"));
  return (
    <footer className="border-t border-line mt-24">
      <Container className="py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <Logo size="sm" />
          <p className="mt-3 text-sm text-ink-secondary max-w-sm">
            {footer.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-secondary">
          {(footer.links || []).filter((item) => item.visible !== false).map((item) => item.action === "support" ? (
            <button key={item.id} type="button" onClick={openSupport} className="hover:text-ink-primary transition-colors" data-testid="footer-support">{item.label}</button>
          ) : (
            <Link key={item.id} to={item.to} className="hover:text-ink-primary transition-colors" data-testid={`footer-link-${item.id}`}>{item.label}</Link>
          ))}
        </div>
      </Container>
      <div className="border-t border-line">
        <Container className="py-5 text-xs text-ink-muted flex items-center justify-between">
          <span>© {new Date().getFullYear()} {APP_CONFIG.companyName}. {footer.copyrightSuffix}</span>
        </Container>
      </div>
    </footer>
  );
}
