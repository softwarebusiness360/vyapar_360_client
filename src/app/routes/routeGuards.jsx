import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useAdminAuth } from "@/lib/adminAuth";
import { evaluateRoute } from "./routePolicy";

const vendorActor = (vendor, employee) => !vendor
  ? { kind: "anonymous" }
  : employee
    ? { kind: "employee", permissions: employee.permissions || {} }
    : { kind: "vendor", onboarded: Boolean(vendor.onboarded) };

export function RequireAuth({ children, requireOnboarded = false }) {
  const { vendor, employee, loading } = useAuth();
  if (loading) return null;
  const decision = evaluateRoute(
    { guard: requireOnboarded ? "vendor-auth-onboarded" : "vendor-auth" },
    vendorActor(vendor, employee)
  );
  return decision.outcome === "allow" ? children : <Navigate to={decision.to} replace />;
}

export function RedirectIfAuthed({ children }) {
  const { vendor, employee, loading } = useAuth();
  if (loading) return null;
  const decision = evaluateRoute({ guard: "redirect-if-vendor" }, vendorActor(vendor, employee));
  return decision.outcome === "allow" ? children : <Navigate to={decision.to} replace />;
}

export function RequireAdmin({ children }) {
  const { admin, loading } = useAdminAuth();
  if (loading) return null;
  const decision = evaluateRoute({ guard: "admin-auth" }, { kind: admin ? "admin" : "anonymous" });
  return decision.outcome === "allow" ? children : <Navigate to={decision.to} replace />;
}

export function RedirectIfAdmin({ children }) {
  const { admin, loading } = useAdminAuth();
  if (loading) return null;
  const decision = evaluateRoute({ guard: "redirect-if-admin" }, { kind: admin ? "admin" : "anonymous" });
  return decision.outcome === "allow" ? children : <Navigate to={decision.to} replace />;
}
