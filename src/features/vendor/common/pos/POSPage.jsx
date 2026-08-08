import React, { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getBusinessType } from "@/business-types/registry";

export default function POSPage() {
  const { vendor, employee, role } = useAuth();
  const allowed = useMemo(() => {
    const storefronts = vendor?.storefronts || [];
    return role === "employee"
      ? storefronts.filter(({ id }) => employee.storefrontIds.includes(id))
      : storefronts;
  }, [vendor, employee, role]);
  const [activeId, setActiveId] = useState(allowed[0]?.id || "");
  const storefront = allowed.find(({ id }) => id === activeId) || allowed[0];

  if (!storefront) return <div className="card-surface p-16 text-center">No storefronts assigned</div>;
  const definition = getBusinessType(storefront.businessType);
  const Experience = definition?.vendor?.pos;
  if (!Experience) return <div className="card-surface p-16 text-center">POS is not available for this business type.</div>;

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-widest text-ink-muted">POS · Walk-in</div>
        <h1 className="text-3xl font-display" data-testid="pos-title">{definition.labels.posTitle}</h1>
        {allowed.length > 1 && (
          <select value={activeId} onChange={(event) => setActiveId(event.target.value)}>
            {allowed.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
          </select>
        )}
      </header>
      <Experience storefront={storefront} employee={employee} vendor={vendor} vendorId={vendor.id} />
    </div>
  );
}
