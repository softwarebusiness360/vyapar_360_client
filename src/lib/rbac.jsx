import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { evaluateRoute } from "../app/routes/routePolicy";

/**
 * Route guards that enforce role-based access at the URL level.
 * The dashboard sidebar already hides tabs based on permissions, but a
 * signed-in employee could still type a URL — these guards close that hole.
 */

/** Owner-only route (blocks employees, redirects to POS). */
export function RequireOwner({ children }) {
  const { vendor, loading, isOwner } = useAuth();
  if (loading) return null;
  const decision = evaluateRoute(
    { guard: "owner" },
    !vendor ? { kind: "anonymous" } : isOwner ? { kind: "vendor", onboarded: true } : { kind: "employee" }
  );
  return decision.outcome === "allow" ? children : <Navigate to={decision.to} replace />;
}

/**
 * Permission-gated route. Owners always pass. Employees must have the
 * given permission flag. Extra `feature` gates against the plan matrix
 * (e.g. features="multiStore" blocks the page if the vendor's plan
 * doesn't include multi-storefront).
 */
export function RequirePermission({ perm, feature, children, fallback = "/dashboard/pos" }) {
  const { vendor, employee, loading, isOwner } = useAuth();
  if (loading) return null;
  if (!vendor) return <Navigate to={evaluateRoute({ guard: perm }).to} replace />;
  if (feature && !vendor.features?.[feature]) return <Navigate to="/dashboard" replace />;
  if (isOwner) return children;
  const decision = evaluateRoute({ guard: perm }, { kind: "employee", permissions: employee?.permissions || {} });
  return decision.outcome === "allow" ? children : <Navigate to={fallback || decision.to} replace />;
}
