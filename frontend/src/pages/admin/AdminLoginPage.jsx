import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import Logo from "../../components/Logo";
import { useAdminAuth } from "../../lib/adminAuth";

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const a = login(email.trim(), password);
      toast.success(`Welcome, ${a.name}`);
      nav("/admin");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const useDemo = () => {
    setEmail("admin@vyapar360.com");
    setPassword("admin123");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Logo />
          <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-brand">
            <ShieldCheck className="h-3.5 w-3.5" /> Platform admin
          </div>
          <h1 className="mt-4 text-3xl font-display font-medium tracking-tight" data-testid="admin-login-title">
            Sign in to control panel
          </h1>
          <p className="mt-2 text-ink-secondary">Vyapar360 internal — vendors and customers can't reach this page.</p>

          <form onSubmit={submit} className="mt-8 space-y-4" data-testid="admin-login-form">
            <div>
              <label className="text-xs uppercase tracking-widest text-ink-muted" htmlFor="a-email">Email</label>
              <input
                id="a-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vyapar360.com"
                className="input-field mt-2"
                data-testid="admin-login-email-input"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-ink-muted" htmlFor="a-password">Password</label>
              <div className="relative mt-2">
                <input
                  id="a-password"
                  type={show ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-11"
                  data-testid="admin-login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center text-ink-muted hover:text-ink-primary transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60"
              data-testid="admin-login-submit-btn"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-ink-muted uppercase tracking-widest">Demo credentials</span>
            <div className="h-px flex-1 bg-line" />
          </div>
          <button onClick={useDemo} className="btn-ghost text-sm w-full mt-4" data-testid="admin-demo-btn">
            Use demo admin
          </button>

          <p className="mt-8 text-xs text-ink-muted">
            Not a platform admin? <Link to="/login" className="text-brand hover:text-brand-hover">Vendor sign in</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:block relative overflow-hidden border-l border-line">
        <div className="absolute inset-0 grain" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand/30 via-fuchsia-500/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/40 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-12">
          <ShieldCheck className="h-10 w-10 text-brand" />
          <h2 className="mt-4 text-3xl font-display font-medium tracking-tight max-w-md">
            The control room for Vyapar360.
          </h2>
          <p className="mt-3 text-ink-secondary max-w-md">
            See every vendor, every order, every booking — and shape the marketing site
            without shipping code.
          </p>
        </div>
      </div>
    </div>
  );
}
