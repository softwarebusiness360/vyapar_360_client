import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import Logo from "../../components/Logo";
import { useAuth } from "../../lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { vendor, employee, role } = login(email.trim(), password);
      const displayName = employee?.name || vendor?.name || vendor?.email;
      toast.success(`Welcome back, ${displayName}`);
      if (role === "employee") nav("/dashboard/pos");
      else if (vendor?.onboarded) nav("/dashboard");
      else nav("/onboarding");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const useDemo = (which) => {
    if (which === "pizza") {
      setEmail("owner@pizzahub.com");
      setPassword("demo1234");
    } else {
      setEmail("owner@stylesalon.com");
      setPassword("demo1234");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Logo />
          <h1 className="mt-10 text-3xl font-display font-medium tracking-tight" data-testid="login-title">
            Welcome back
          </h1>
          <p className="mt-2 text-ink-secondary">Sign in to manage your storefront.</p>

          <form onSubmit={submit} className="mt-8 space-y-4" data-testid="login-form">
            <div>
              <label className="text-xs uppercase tracking-widest text-ink-muted" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@business.com"
                className="input-field mt-2"
                data-testid="login-email-input"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-ink-muted" htmlFor="password">Password</label>
              <div className="relative mt-2">
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-11"
                  data-testid="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center text-ink-muted hover:text-ink-primary transition-colors"
                  aria-label="Toggle password visibility"
                  data-testid="login-password-toggle"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60"
              data-testid="login-submit-btn"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-ink-muted uppercase tracking-widest">Try a demo</span>
            <div className="h-px flex-1 bg-line" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button onClick={() => useDemo("pizza")} className="btn-ghost text-sm" data-testid="demo-login-pizza">
              🍕 Pizza Hub
            </button>
            <button onClick={() => useDemo("salon")} className="btn-ghost text-sm" data-testid="demo-login-salon">
              ✂️ Style Salon
            </button>
          </div>

          <p className="mt-8 text-sm text-ink-secondary">
            New here?{" "}
            <Link to="/register" className="text-brand hover:text-brand-hover font-medium transition-colors" data-testid="login-goto-register">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Right visual */}
      <div className="hidden lg:block relative overflow-hidden border-l border-line">
        <div className="absolute inset-0 grain" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-transparent to-restaurant/10" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/30504703/pexels-photo-30504703.jpeg?auto=compress&cs=tinysrgb&w=1600')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/60 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-12">
          <blockquote className="max-w-md">
            <p className="text-2xl font-display font-medium leading-snug">
              "Vyapar360 turned our WhatsApp menu into a real storefront overnight."
            </p>
            <footer className="mt-4 text-ink-secondary text-sm">— Rohan M., Owner · Pizza Hub</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
