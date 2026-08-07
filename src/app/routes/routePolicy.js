const permissionGuards = new Set(["editCatalogue", "takeOrders", "takeBookings", "viewInsights"]);

export function evaluateRoute(route, actor = { kind: "anonymous" }) {
  const { guard } = route;
  const isVendor = actor.kind === "vendor" || actor.kind === "employee";
  if (guard === "public" || guard === "restaurant" || guard === "salon") return { outcome: "allow" };
  if (guard === "redirect-if-vendor") {
    if (!isVendor) return { outcome: "allow" };
    if (actor.kind === "employee") return { outcome: "redirect", to: "/dashboard/pos" };
    return { outcome: "redirect", to: actor.onboarded ? "/dashboard" : "/onboarding" };
  }
  if (guard === "redirect-if-admin") {
    return actor.kind === "admin" ? { outcome: "redirect", to: "/admin" } : { outcome: "allow" };
  }
  if (guard === "admin-auth") {
    return actor.kind === "admin" ? { outcome: "allow" } : { outcome: "redirect", to: "/admin/login" };
  }
  if (!isVendor) return { outcome: "redirect", to: "/login" };
  // Dashboard children inherit the parent RequireAuth(requireOnboarded) layout.
  if (route.path?.startsWith("/dashboard") && actor.kind === "vendor" && !actor.onboarded) {
    return { outcome: "redirect", to: "/onboarding" };
  }
  if (guard === "vendor-auth-onboarded" && actor.kind === "vendor" && !actor.onboarded) {
    return { outcome: "redirect", to: "/onboarding" };
  }
  if (guard === "owner") {
    return actor.kind === "vendor" ? { outcome: "allow" } : { outcome: "redirect", to: "/dashboard/pos" };
  }
  if (permissionGuards.has(guard) && actor.kind === "employee" && !actor.permissions?.[guard]) {
    return { outcome: "redirect", to: "/dashboard/pos" };
  }
  return { outcome: "allow" };
}
