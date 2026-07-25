import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

/**
 * Route guards that enforce role-based access at the URL level.
 * The dashboard sidebar already hides tabs based on permissions, but a
 * signed-in employee could still type a URL — these guards close that hole.
 */

/** Owner-only route (blocks employees, redirects to POS). */
export function RequireOwner({ children }) {
  const { vendor, loading, isOwner } = useAuth();
  if (loading) return null;
  if (!vendor) return <Navigate to="/login" replace />;
  if (!isOwner) return <Navigate to="/dashboard/pos" replace />;
  return children;
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
  if (!vendor) return <Navigate to="/login" replace />;
  if (feature && !vendor.features?.[feature]) return <Navigate to="/dashboard" replace />;
  if (isOwner) return children;
  if (perm && !employee?.permissions?.[perm]) return <Navigate to={fallback} replace />;
  return children;
}
