import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Utensils,
  Scissors,
  Check,
  Sparkles,
  Store,
  Loader2,
} from "lucide-react";
import Logo from "../../components/Logo";
import { useAuth } from "../../lib/auth";
import { slugAvailable } from "../../lib/store";
import { slugify } from "../../lib/utils";

const BUSINESS_TYPES = [
  {
    id: "restaurant",
    name: "Restaurant",
    icon: Utensils,
    accent: "restaurant",
    color: "text-restaurant",
    tint: "from-orange-500/20 to-orange-500/0",
    desc: "Food menu, categories, cart-based ordering.",
  },
  {
    id: "salon",
    name: "Salon",
    icon: Scissors,
    accent: "salon",
    color: "text-salon",
    tint: "from-amber-500/20 to-amber-500/0",
    desc: "Service catalogue, time slots, appointment bookings.",
  },
];

export default function OnboardingPage() {
  const { vendor, updateVendor } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(vendor?.businessType ? 1 : 0);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    businessType: vendor?.businessType || "",
    name: vendor?.name || "",
    slug: vendor?.slug || "",
    tagline: vendor?.tagline || "",
    description: vendor?.description || "",
    logo: vendor?.logo || "",
    coverImage: vendor?.coverImage || "",
    address: vendor?.address || "",
    phone: vendor?.phone || "",
  });

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const [slugEdited, setSlugEdited] = useState(!!vendor?.slug);
  const setName = (e) => {
    const name = e.target.value;
    setForm((f) => ({ ...f, name, slug: slugEdited ? f.slug : slugify(name) }));
  };
  const setSlug = (e) => {
    setSlugEdited(true);
    setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
  };

  const suggestedSlug = useMemo(() => slugify(form.name), [form.name]);

  const goNext = () => {
    if (step === 0) {
      if (!form.businessType) return toast.error("Choose a business type to continue.");
    }
    if (step === 1) {
      if (!form.name.trim()) return toast.error("Business name is required.");
      const s = slugify(form.slug || form.name);
      if (!s) return toast.error("Please enter a valid store URL.");
      if (!slugAvailable(s, vendor.id)) return toast.error("That store URL is already taken.");
      setForm((f) => ({ ...f, slug: s }));
    }
    setStep((s) => Math.min(2, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    setBusy(true);
    try {
      const accent = form.businessType === "restaurant" ? "restaurant" : "salon";
      const finalSlug = slugify(form.slug || form.name);
      updateVendor({
        ...form,
        slug: finalSlug,
        accent,
        onboarded: true,
      });
      toast.success("Your store is live!");
      nav("/dashboard");
    } catch (e) {
      toast.error("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <div className="text-xs text-ink-muted">Step {step + 1} of 3</div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* progress */}
        <div className="flex items-center gap-2 mb-10">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-brand" : "bg-line"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="inline-flex items-center gap-2 text-brand text-xs uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5" /> Onboarding
              </div>
              <h1 className="mt-3 text-3xl sm:text-4xl font-display font-medium tracking-tight" data-testid="onboarding-step-title">
                What kind of business are you setting up?
              </h1>
              <p className="mt-3 text-ink-secondary">Choose the type that best fits — we'll tailor your dashboard accordingly.</p>

              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {BUSINESS_TYPES.map((t) => {
                  const selected = form.businessType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, businessType: t.id }))}
                      data-testid={`onboarding-type-${t.id}`}
                      className={`relative text-left card-surface p-6 card-hover overflow-hidden ${
                        selected ? "border-brand/60 ring-1 ring-brand/40" : ""
                      }`}
                    >
                      <div className={`pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br ${t.tint} blur-2xl`} />
                      <div className={`h-12 w-12 rounded-xl border border-line grid place-items-center bg-bg-elevated`}>
                        <t.icon className={`h-6 w-6 ${t.color}`} />
                      </div>
                      <div className="mt-4 font-display text-xl font-medium">{t.name}</div>
                      <div className="mt-1.5 text-sm text-ink-secondary">{t.desc}</div>
                      {selected && (
                        <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-brand grid place-items-center">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="text-3xl sm:text-4xl font-display font-medium tracking-tight" data-testid="onboarding-step-title">
                Tell us about your business
              </h1>
              <p className="mt-3 text-ink-secondary">This is what customers see on your storefront.</p>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field label="Business name" required>
                  <input
                    className="input-field"
                    value={form.name}
                    onChange={setName}
                    placeholder="e.g. Pizza Hub"
                    data-testid="onboarding-name-input"
                  />
                </Field>
                <Field
                  label="Store URL"
                  hint={
                    <>
                      vyapar360.app/store/
                      <span className="text-brand">{form.slug || suggestedSlug || "your-brand"}</span>
                    </>
                  }
                  required
                >
                  <input
                    className="input-field"
                    value={form.slug}
                    onChange={setSlug}
                    placeholder={suggestedSlug || "your-brand"}
                    data-testid="onboarding-slug-input"
                  />
                </Field>
                <Field label="Tagline" className="sm:col-span-2">
                  <input
                    className="input-field"
                    value={form.tagline}
                    onChange={setField("tagline")}
                    placeholder="A short one-liner for your storefront hero"
                    data-testid="onboarding-tagline-input"
                  />
                </Field>
                <Field label="Description" className="sm:col-span-2">
                  <textarea
                    className="input-field min-h-[100px] resize-y"
                    value={form.description}
                    onChange={setField("description")}
                    placeholder="Tell customers what makes your business special..."
                    data-testid="onboarding-description-input"
                  />
                </Field>
                <Field label="Address">
                  <input
                    className="input-field"
                    value={form.address}
                    onChange={setField("address")}
                    placeholder="Street, City"
                    data-testid="onboarding-address-input"
                  />
                </Field>
                <Field label="Phone">
                  <input
                    className="input-field"
                    value={form.phone}
                    onChange={setField("phone")}
                    placeholder="+91 98xxx xxxxx"
                    data-testid="onboarding-phone-input"
                  />
                </Field>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="text-3xl sm:text-4xl font-display font-medium tracking-tight" data-testid="onboarding-step-title">
                Add your branding
              </h1>
              <p className="mt-3 text-ink-secondary">Paste image URLs — we'll show a live preview.</p>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field label="Logo URL">
                  <input
                    className="input-field"
                    value={form.logo}
                    onChange={setField("logo")}
                    placeholder="https://..."
                    data-testid="onboarding-logo-input"
                  />
                </Field>
                <Field label="Cover image URL">
                  <input
                    className="input-field"
                    value={form.coverImage}
                    onChange={setField("coverImage")}
                    placeholder="https://..."
                    data-testid="onboarding-cover-input"
                  />
                </Field>
              </div>

              {/* Preview */}
              <div className="mt-8 card-surface overflow-hidden">
                <div
                  className="relative h-40 sm:h-52 bg-bg-elevated bg-cover bg-center"
                  style={{ backgroundImage: form.coverImage ? `url(${form.coverImage})` : undefined }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3">
                    <div className="h-14 w-14 rounded-xl bg-bg-surface border border-line overflow-hidden grid place-items-center flex-shrink-0">
                      {form.logo ? (
                        <img src={form.logo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Store className="h-6 w-6 text-ink-muted" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-display font-medium text-lg truncate">{form.name || "Your business"}</div>
                      <div className="text-xs text-ink-secondary truncate">{form.tagline || "Your tagline"}</div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 text-xs text-ink-muted border-t border-line">Storefront preview</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={step === 0}
            className="btn-ghost inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            data-testid="onboarding-back-btn"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {step < 2 ? (
            <button onClick={goNext} className="btn-primary inline-flex items-center gap-2" data-testid="onboarding-next-btn">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={finish} disabled={busy} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60" data-testid="onboarding-finish-btn">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Publish store <ArrowRight className="h-4 w-4" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, required, className = "", children }) {
  return (
    <label className={`block ${className}`}>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs uppercase tracking-widest text-ink-muted">
          {label}
          {required && <span className="text-restaurant ml-1">*</span>}
        </span>
        {hint && <span className="text-xs text-ink-muted truncate max-w-[60%]">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
