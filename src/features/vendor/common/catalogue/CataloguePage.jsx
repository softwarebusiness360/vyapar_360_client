import React from "react";
import { useAuth } from "@/lib/auth";
import { getBusinessType } from "@/business-types/registry";

export default function CataloguePage() {
  const { vendor } = useAuth();
  const Experience = getBusinessType(vendor?.businessType)?.vendor?.catalogue;
  return Experience
    ? <Experience />
    : <div className="card-surface p-16 text-center">Catalogue is not available for this business type.</div>;
}
