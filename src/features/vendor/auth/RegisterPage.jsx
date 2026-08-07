import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Loader2, Check } from "lucide-react";
import Logo from "@/shared/components/branding/Logo";
import { useAuth } from "../../../lib/auth";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      register(email.trim(), password);
      toast.success("Account created. Let's set up your business.");
      nav("/onboarding");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  const perks = [
    "Storefront hosted at /store/your-brand",
    "Take orders & bookings — no code",
    "Insights dashboard included",
    "Free while in MVP",
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Logo />
          <h1 className="mt-10 text-3xl font-display font-medium tracking-tight" data-testid="register-title">
            Start your storefront
          </h1>
          <p className="mt-2 text-ink-secondary">
            A free vendor account. No credit card required.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4" data-testid="register-form">
            <div>
              <label className="text-xs uppercase tracking-widest text-ink-muted" htmlFor="email">Work email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@business.com"
                className="input-field mt-2"
                data-testid="register-email-input"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-ink-muted" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="input-field mt-2"
                data-testid="register-password-input"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60"
              data-testid="register-submit-btn"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-8 text-sm text-ink-secondary">
            Already have an account?{" "}
            <Link to="/login" className="text-brand hover:text-brand-hover font-medium transition-colors" data-testid="register-goto-login">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex relative overflow-hidden border-l border-line items-center justify-center p-12">
        <div className="absolute inset-0 grain" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand/15 via-transparent to-salon/10" />
        <div className="relative max-w-md">
          <div className="tag mb-6 text-brand border-brand/30 bg-brand-soft">What you get</div>
          <h2 className="text-3xl font-display font-medium tracking-tight">
            A production-ready storefront in minutes.
          </h2>
          <ul className="mt-8 space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-3 text-ink-secondary">
                <span className="mt-1 h-5 w-5 rounded-full bg-success/10 border border-success/30 grid place-items-center flex-shrink-0">
                  <Check className="h-3 w-3 text-success" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
