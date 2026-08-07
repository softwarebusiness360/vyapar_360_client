import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Calendar as CalendarIcon, Clock, Loader2, Check } from "lucide-react";
import * as repository from "@/data/bookingRepository";
import { formatINR, formatDate } from "../../../../lib/utils";
import Logo from "@/shared/components/branding/Logo";
import { isValidPhone, sanitizePhoneInput } from "@/shared/validation/phone";

export default function BookingFlowPage() {
  const { getVendorBySlug, getSlotsForDate, createBooking, seedIfNeeded, DEFAULT_BOOKING_FIELDS } = repository;
  const { slug, serviceId } = useParams();
  const nav = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [service, setService] = useState(null);

  useEffect(() => {
    seedIfNeeded();
    const v = getVendorBySlug(slug);
    setVendor(v);
    setService(v?.services?.find((s) => s.id === serviceId) || null);
  }, [slug, serviceId]);

  const [step, setStep] = useState(0); // 0: date+time, 1: details, 2: confirmed (nav)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState("");
  const cfg = (vendor?.bookingFields) || DEFAULT_BOOKING_FIELDS;
  const enabledKeys = useMemo(() => Object.keys(cfg).filter((k) => cfg[k]?.enabled), [cfg]);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  const slots = useMemo(() => (vendor ? getSlotsForDate(vendor.id, date) : []), [vendor, date]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setPhone = (e) => setForm({ ...form, phone: sanitizePhoneInput(e.target.value) });

  // Build next 7 days
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return {
        iso: d.toISOString().slice(0, 10),
        weekday: d.toLocaleDateString("en-IN", { weekday: "short" }),
        day: d.getDate(),
        month: d.toLocaleDateString("en-IN", { month: "short" }),
      };
    });
  }, []);

  if (!vendor) return null;
  if (!service) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="text-center">
          <p className="text-ink-secondary">Service not found.</p>
          <Link to={`/store/${slug}`} className="btn-primary mt-4 inline-flex">Back to store</Link>
        </div>
      </div>
    );
  }

  const goNext = () => {
    if (!slot) return toast.error("Pick a time slot to continue");
    setStep(1);
  };
  const confirm = () => {
    for (const k of enabledKeys) {
      const field = cfg[k];
      if (field.required && !String(form[k] || "").trim()) {
        return toast.error(`${field.label} is required`);
      }
    }
    if (form.phone && !isValidPhone(form.phone)) {
      return toast.error("Enter a valid phone number");
    }
    setBusy(true);
    setTimeout(() => {
      const bk = createBooking({
        vendorId: vendor.id,
        customer: {
          name: (form.name || "").trim(),
          phone: (form.phone || "").trim(),
        },
        service: { id: service.id, name: service.name, price: service.price, duration: service.duration },
        date,
        slot,
        notes: (form.notes || "").trim(),
      });
      nav(`/store/${vendor.slug}/booking/${bk.id}`);
    }, 500);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to={`/store/${vendor.slug}`} className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-ink-primary transition-colors" data-testid="booking-back-btn">
            <ArrowLeft className="h-4 w-4" /> Back to {vendor.name}
          </Link>
          <Logo size="sm" />
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[0, 1].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-salon" : "bg-line"}`} />
          ))}
        </div>

        {/* Service info */}
        <div className="card-surface p-5 mb-8 flex items-start gap-4">
          {service.image && (
            <div className="h-16 w-16 rounded-lg overflow-hidden bg-bg-elevated flex-shrink-0">
              <img src={service.image} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-widest text-salon">Service</div>
            <div className="font-display text-xl font-medium truncate">{service.name}</div>
            <div className="mt-1 text-sm text-ink-secondary inline-flex items-center gap-3">
              <span className="font-mono">{formatINR(service.price)}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {service.duration} min</span>
            </div>
          </div>
        </div>

        {step === 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-xs uppercase tracking-widest text-ink-muted">Step 1</div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-display font-medium tracking-tight" data-testid="booking-step-title">
              Pick a date & time
            </h1>

            <div className="mt-6">
              <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-3 inline-flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5" /> Select date</div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {days.map((d) => (
                  <button
                    key={d.iso}
                    onClick={() => {
                      setDate(d.iso);
                      setSlot("");
                    }}
                    data-testid={`date-${d.iso}`}
                    className={`p-3 rounded-xl border text-center transition-colors ${
                      date === d.iso
                        ? "bg-salon/15 border-salon/50 text-ink-primary"
                        : "bg-bg-surface border-line text-ink-secondary hover:text-ink-primary hover:border-white/20"
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-widest text-ink-muted">{d.weekday}</div>
                    <div className="mt-1 font-display text-xl font-medium">{d.day}</div>
                    <div className="text-[10px] text-ink-muted">{d.month}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-3 inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Available slots · {formatDate(date)}</div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    disabled={!s.available}
                    onClick={() => setSlot(s.time)}
                    data-testid={`slot-${s.time}`}
                    className={`py-2.5 rounded-lg border font-mono text-sm transition-colors ${
                      !s.available
                        ? "border-line/50 bg-bg-elevated/40 text-ink-muted line-through cursor-not-allowed"
                        : slot === s.time
                        ? "bg-salon/15 border-salon/50 text-ink-primary"
                        : "bg-bg-surface border-line text-ink-secondary hover:text-ink-primary hover:border-white/20"
                    }`}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button onClick={goNext} className="btn-primary inline-flex items-center gap-2" data-testid="booking-next-btn">
                Continue to details
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-xs uppercase tracking-widest text-ink-muted">Step 2</div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-display font-medium tracking-tight" data-testid="booking-step-title">
              Your details
            </h1>

            <div className="mt-6 card-surface p-5">
              <div className="grid sm:grid-cols-2 gap-4">
                {enabledKeys.length === 0 && (
                  <div className="sm:col-span-2 text-sm text-ink-muted text-center py-6">
                    This salon doesn't request any details.
                  </div>
                )}
                {enabledKeys.map((k) => {
                  const field = cfg[k];
                  const colSpan = k === "notes" ? "sm:col-span-2" : "";
                  return (
                    <Field key={k} label={field.label} required={field.required} className={colSpan}>
                      <input
                        className="input-field"
                        value={form[k] || ""}
                        onChange={k === "phone" ? setPhone : set(k)}
                        inputMode={k === "phone" ? "tel" : undefined}
                        placeholder={field.placeholder}
                        data-testid={`booking-${k}-input`}
                      />
                    </Field>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 card-surface p-5">
              <div className="text-[11px] uppercase tracking-widest text-ink-muted">Appointment</div>
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-ink-muted text-xs">Date</div>
                  <div className="mt-1">{formatDate(date)}</div>
                </div>
                <div>
                  <div className="text-ink-muted text-xs">Time</div>
                  <div className="mt-1 font-mono">{slot}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-ink-muted text-xs">Service</div>
                  <div className="mt-1">{service.name} · <span className="font-mono">{formatINR(service.price)}</span></div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <button onClick={() => setStep(0)} className="btn-ghost inline-flex items-center gap-2" data-testid="booking-back-step-btn">
                <ArrowLeft className="h-4 w-4" /> Change time
              </button>
              <button onClick={confirm} disabled={busy} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60" data-testid="confirm-booking-btn">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" /> Confirm booking</>}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, className = "", children }) {
  return (
    <label className={`block ${className}`}>
      <div className="text-xs uppercase tracking-widest text-ink-muted mb-2">
        {label}
        {required && <span className="text-salon ml-1">*</span>}
        {!required && <span className="text-ink-muted ml-1 normal-case tracking-normal text-[10px]">(optional)</span>}
      </div>
      {children}
    </label>
  );
}
