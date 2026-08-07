import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Calendar as CalendarIcon, Clock, Phone } from "lucide-react";
import * as repository from "@/data/bookingRepository";
import { formatINR, formatDate } from "../../../../lib/utils";
import StatusBadge from "@/shared/components/feedback/StatusBadge";
import Logo from "@/shared/components/branding/Logo";

export default function BookingConfirmationPage() {
  const { getBookings, getVendorBySlug, seedIfNeeded } = repository;
  const { slug, bookingId } = useParams();
  const [state, setState] = useState({ vendor: null, booking: null, loaded: false });

  useEffect(() => {
    seedIfNeeded();
    const v = getVendorBySlug(slug);
    const b = getBookings(v?.id).find((x) => x.id === bookingId) || null;
    setState({ vendor: v, booking: b, loaded: true });
  }, [slug, bookingId]);

  if (!state.loaded) return null;
  if (!state.vendor || !state.booking) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-display">Booking not found</h1>
          <Link to="/discover" className="btn-primary mt-4 inline-flex">Discover stores</Link>
        </div>
      </div>
    );
  }
  const { vendor, booking } = state;

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to={`/store/${vendor.slug}`} className="text-sm text-ink-secondary hover:text-ink-primary transition-colors" data-testid="confirm-back-store">
            Back to {vendor.name}
          </Link>
          <Logo size="sm" />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 18 }} className="mx-auto h-16 w-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 grid place-items-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </motion.div>
        <div className="mt-6 text-center">
          <div className="text-xs uppercase tracking-widest text-emerald-400">Booking confirmed</div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-display font-medium tracking-tighter" data-testid="booking-confirmation-title">
            You're on the calendar.
          </h1>
          <p className="mt-3 text-ink-secondary">
            {vendor.name} will be ready for your appointment.
          </p>
        </div>

        <div className="mt-10 card-surface overflow-hidden" data-testid={`confirmation-booking-${booking.id}`}>
          <div className="px-6 py-5 border-b border-line flex items-center justify-between">
            <div>
              <div className="text-xs text-ink-muted font-mono">{booking.code}</div>
              <div className="mt-0.5 text-sm text-ink-secondary">{formatDate(booking.createdAt)}</div>
            </div>
            <StatusBadge status={booking.status} />
          </div>
          <div className="p-6 grid sm:grid-cols-2 gap-5">
            <Info label="Service">
              <div>{booking.service.name}</div>
              <div className="text-ink-muted text-xs mt-0.5">{booking.service.duration} min · {formatINR(booking.service.price)}</div>
            </Info>
            <Info label="Booked by">
              <div>{booking.customer.name}</div>
              <div className="text-ink-muted text-xs mt-0.5 inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {booking.customer.phone}</div>
            </Info>
            <Info label="Date">
              <span className="inline-flex items-center gap-1.5"><CalendarIcon className="h-4 w-4 text-ink-muted" /> {formatDate(booking.date)}</span>
            </Info>
            <Info label="Time">
              <span className="inline-flex items-center gap-1.5 font-mono"><Clock className="h-4 w-4 text-ink-muted" /> {booking.slot}</span>
            </Info>
            {booking.notes && (
              <Info label="Notes" className="sm:col-span-2">
                <span className="text-ink-secondary">"{booking.notes}"</span>
              </Info>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={`/store/${vendor.slug}`} className="btn-primary inline-flex items-center gap-2" data-testid="booking-back-store">
            Book another service <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/discover" className="btn-ghost inline-flex items-center gap-2">Discover more stores</Link>
        </div>
      </div>
    </div>
  );
}

function Info({ label, children, className = "" }) {
  return (
    <div className={className}>
      <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-1">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}
