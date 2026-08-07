import React, { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { createBooking, getSlotsForDate } from "@/data/bookingRepository";

export default function SalonPOS({ storefront, employee, vendorId }) {
  const [service, setService] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState("");
  const [completed, setCompleted] = useState(null);
  const slots = useMemo(() => service ? getSlotsForDate(vendorId, date) : [], [service, date, vendorId]);

  const confirm = () => {
    if (!service) return toast.error("Pick a service");
    if (!slot) return toast.error("Pick a time slot");
    const booking = createBooking({
      vendorId,
      storefrontId: storefront.id,
      employeeId: employee?.id || null,
      customer: { name: "Walk-in", phone: "" },
      service: { id: service.id, name: service.name, price: service.price, duration: service.duration },
      date,
      slot,
      notes: "",
    });
    setCompleted(booking);
    toast.success(`Booking ${booking.code} confirmed`);
  };

  if (completed) return (
    <div className="card-surface p-8 text-center" data-testid="salon-pos-complete">
      <Check className="mx-auto text-emerald-400" />
      <h2 className="mt-4 font-display text-2xl">Booking confirmed</h2>
      <div className="font-mono text-salon">{completed.code}</div>
      <button className="btn-primary mt-6" onClick={() => setCompleted(null)}>Take another booking</button>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-3 gap-4" data-testid="salon-pos">
      <div className="lg:col-span-2 card-surface p-5 grid grid-cols-2 gap-2">
        {(storefront.services || []).filter(({ available }) => available).map((entry) => (
          <button key={entry.id} data-testid={`pos-service-${entry.id}`}
            className="card-surface p-3 text-left" onClick={() => setService(entry)}>
            {entry.name}
          </button>
        ))}
      </div>
      <div className="card-surface p-5">
        <h2 className="font-display text-lg">Appointment</h2>
        <input type="date" className="input-field mt-4" value={date}
          onChange={(event) => { setDate(event.target.value); setSlot(""); }} />
        <div className="grid grid-cols-3 gap-2 my-4">
          {slots.map((entry) => (
            <button key={entry.time} disabled={!entry.available} data-testid={`pos-slot-${entry.time}`}
              onClick={() => setSlot(entry.time)}>{entry.time}</button>
          ))}
        </div>
        <button className="btn-primary w-full" data-testid="pos-confirm-booking-btn" onClick={confirm}>Confirm booking</button>
      </div>
    </div>
  );
}
