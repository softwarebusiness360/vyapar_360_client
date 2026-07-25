import React, { useState } from "react";
import { toast } from "sonner";
import { X, User, Phone, ShieldCheck, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { useCustomer } from "../lib/customerAuth";

/**
 * CustomerAuthModal — 2-step guest / upgrade flow.
 *
 *  Step 1: Enter name → immediate guest session.
 *  Step 2 (optional): Save my details → phone → mock OTP (any 4+ digit;
 *          demo code shown inline). Upserts into customer DB.
 *
 * Uses `variant="upgrade"` to skip the name step for logged-in guests
 * who want to add a phone.
 */
export default function CustomerAuthModal({ open, onClose, variant = "login" }) {
  const { login, upgrade, mockOtp } = useCustomer();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(variant === "upgrade" ? "phone" : "name");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const reset = () => {
    setStep(variant === "upgrade" ? "phone" : "name");
    setName(""); setPhone(""); setOtp(""); setOtpSent(false);
  };
  const close = () => { reset(); onClose?.(); };

  const submitName = (e) => {
    e?.preventDefault();
    try {
      const c = login({ name });
      toast.success(`Welcome, ${c.name}!`);
      close();
    } catch (e2) { toast.error(e2.message); }
  };

  const sendOtp = (e) => {
    e?.preventDefault();
    if (!phone.trim() || phone.trim().length < 6) return toast.error("Enter a valid phone number");
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setOtpSent(true);
      toast.success(`OTP sent (demo: ${mockOtp})`);
    }, 700);
  };

  const submitOtp = (e) => {
    e?.preventDefault();
    try {
      const c = variant === "upgrade"
        ? upgrade({ phone, otp })
        : login({ name, phone, otp });
      toast.success("Details saved — you'll never lose your history now.");
      close();
    } catch (e2) { toast.error(e2.message); }
  };

  return (
    <div className="fixed inset-0 z-[80]" data-testid="customer-auth-modal">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md bg-bg-surface border border-line grain rounded-2xl shadow-2xl p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-brand">
              {variant === "upgrade" ? "Save your details" : "Continue as customer"}
            </div>
            <h3 className="mt-1 font-display text-2xl font-medium tracking-tight">
              {step === "name" && "What's your name?"}
              {step === "phone" && (otpSent ? "Verify your phone" : "Add a phone number")}
            </h3>
            <p className="mt-1 text-sm text-ink-secondary">
              {step === "name" && "We'll use it to greet you and remember your journey."}
              {step === "phone" && !otpSent && "Optional — save your order history across devices."}
              {step === "phone" && otpSent && `For demo, any 4+ digit OTP works. Try ${mockOtp}.`}
            </p>
          </div>
          <button
            onClick={close}
            className="h-8 w-8 grid place-items-center rounded-full border border-line text-ink-secondary hover:text-ink-primary transition-colors"
            aria-label="Close"
            data-testid="customer-auth-close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === "name" && (
          <form onSubmit={submitName} className="space-y-4">
            <label className="block">
              <div className="text-xs uppercase tracking-widest text-ink-muted mb-1.5">Your name</div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
                <input
                  autoFocus
                  className="input-field pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya"
                  data-testid="customer-auth-name"
                />
              </div>
            </label>
            <div className="flex flex-col gap-2 pt-2">
              <button type="submit" className="btn-primary w-full inline-flex items-center justify-center gap-2" data-testid="customer-auth-continue">
                Continue as guest <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => { if (!name.trim()) return toast.error("Enter your name first"); setStep("phone"); }}
                className="btn-ghost w-full inline-flex items-center justify-center gap-2 text-sm"
                data-testid="customer-auth-goto-phone"
              >
                <ShieldCheck className="h-4 w-4" /> Save my details with phone
              </button>
            </div>
          </form>
        )}

        {step === "phone" && !otpSent && (
          <form onSubmit={sendOtp} className="space-y-4">
            <label className="block">
              <div className="text-xs uppercase tracking-widest text-ink-muted mb-1.5">Phone</div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
                <input
                  autoFocus
                  type="tel"
                  className="input-field pl-10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  data-testid="customer-auth-phone"
                />
              </div>
            </label>
            <div className="flex gap-2">
              {variant !== "upgrade" && (
                <button type="button" onClick={() => setStep("name")} className="btn-ghost w-1/3">Back</button>
              )}
              <button type="submit" disabled={busy} className="btn-primary flex-1 inline-flex items-center justify-center gap-2" data-testid="customer-auth-send-otp">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Send OTP
              </button>
            </div>
          </form>
        )}

        {step === "phone" && otpSent && (
          <form onSubmit={submitOtp} className="space-y-4">
            <label className="block">
              <div className="text-xs uppercase tracking-widest text-ink-muted mb-1.5">4-digit OTP</div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
                <input
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  className="input-field pl-10 tracking-widest font-mono"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder={mockOtp}
                  data-testid="customer-auth-otp"
                />
              </div>
              <div className="mt-1 text-[11px] text-ink-muted">
                Sent to <span className="font-mono text-ink-secondary">{phone}</span> · <button type="button" onClick={() => { setOtpSent(false); setOtp(""); }} className="text-brand hover:text-brand-hover">change</button>
              </div>
            </label>
            <button type="submit" className="btn-primary w-full inline-flex items-center justify-center gap-2" data-testid="customer-auth-verify">
              Verify & save <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
