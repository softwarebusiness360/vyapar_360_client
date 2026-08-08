import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import POSPage from "./POSPage";

export default function LegacyPOSRoute() {
  const { vendor } = useAuth();
  return vendor?.businessType === "restaurant" ? <Navigate to="/dashboard/orders/new" replace /> : <POSPage />;
}
