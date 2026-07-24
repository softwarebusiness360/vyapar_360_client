import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="text-center max-w-md">
        <div className="text-6xl font-display font-semibold tracking-tighter text-brand">404</div>
        <h1 className="mt-4 text-2xl font-display font-medium">Page not found</h1>
        <p className="mt-3 text-ink-secondary">
          The page you're looking for doesn't exist or has moved.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary inline-flex items-center justify-center gap-2" data-testid="not-found-home-btn">
            <Home className="h-4 w-4" /> Go home
          </Link>
          <button onClick={() => window.history.back()} className="btn-ghost inline-flex items-center justify-center gap-2" data-testid="not-found-back-btn">
            <ArrowLeft className="h-4 w-4" /> Go back
          </button>
        </div>
      </div>
    </div>
  );
}
