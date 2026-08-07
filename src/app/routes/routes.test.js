import React from "react";
import { matchRoutes } from "react-router-dom";
import { appRoutes, vendorRoutes, customerRoutes, adminRoutes, routeDefinitions } from ".";
import { evaluateRoute } from "./routePolicy";

test("preserves all 37 route declarations", () => {
  expect(appRoutes).toHaveLength(37);
  expect(new Set(appRoutes.map(({ id }) => id)).size).toBe(37);
});

test("assigns routes to the three product experiences", () => {
  expect(vendorRoutes).toHaveLength(15);
  expect(customerRoutes).toHaveLength(7);
  expect(adminRoutes).toHaveLength(11);
});

test("keeps restaurant and salon customer journeys distinct", () => {
  expect(customerRoutes.find(({ id }) => id === "customer-checkout").guard).toBe("restaurant");
  expect(customerRoutes.find(({ id }) => id === "customer-book").guard).toBe("salon");
});

test("keeps inherited vendor and admin guards explicit", () => {
  expect(vendorRoutes.find(({ id }) => id === "vendor-team").guard).toBe("owner");
  expect(adminRoutes.find(({ id }) => id === "admin-orders").guard).toBe("admin-auth");
});

test.each(appRoutes)("$id has executable anonymous and authenticated outcomes", (route) => {
  const anonymous = evaluateRoute(route);
  const owner = evaluateRoute(route, { kind: "vendor", onboarded: true });
  const employee = evaluateRoute(route, {
    kind: "employee",
    permissions: { editCatalogue: true, takeOrders: true, takeBookings: true, viewInsights: true },
  });
  const admin = evaluateRoute(route, { kind: "admin" });
  const customer = evaluateRoute(route, { kind: "customer" });

  const allow = { outcome: "allow" };
  const expectedByGuard = {
    public: [allow, allow, allow, allow, allow],
    restaurant: [allow, allow, allow, allow, allow],
    salon: [allow, allow, allow, allow, allow],
    "redirect-if-vendor": [allow, { outcome: "redirect", to: "/dashboard" }, { outcome: "redirect", to: "/dashboard/pos" }, allow, allow],
    "vendor-auth": [{ outcome: "redirect", to: "/login" }, allow, allow, { outcome: "redirect", to: "/login" }, { outcome: "redirect", to: "/login" }],
    "vendor-auth-onboarded": [{ outcome: "redirect", to: "/login" }, allow, allow, { outcome: "redirect", to: "/login" }, { outcome: "redirect", to: "/login" }],
    owner: [{ outcome: "redirect", to: "/login" }, allow, { outcome: "redirect", to: "/dashboard/pos" }, { outcome: "redirect", to: "/login" }, { outcome: "redirect", to: "/login" }],
    editCatalogue: [{ outcome: "redirect", to: "/login" }, allow, allow, { outcome: "redirect", to: "/login" }, { outcome: "redirect", to: "/login" }],
    takeOrders: [{ outcome: "redirect", to: "/login" }, allow, allow, { outcome: "redirect", to: "/login" }, { outcome: "redirect", to: "/login" }],
    takeBookings: [{ outcome: "redirect", to: "/login" }, allow, allow, { outcome: "redirect", to: "/login" }, { outcome: "redirect", to: "/login" }],
    viewInsights: [{ outcome: "redirect", to: "/login" }, allow, allow, { outcome: "redirect", to: "/login" }, { outcome: "redirect", to: "/login" }],
    "redirect-if-admin": [allow, allow, allow, { outcome: "redirect", to: "/admin" }, allow],
    "admin-auth": [{ outcome: "redirect", to: "/admin/login" }, { outcome: "redirect", to: "/admin/login" }, { outcome: "redirect", to: "/admin/login" }, allow, { outcome: "redirect", to: "/admin/login" }],
  };
  expect([anonymous, owner, employee, admin, customer]).toEqual(expectedByGuard[route.guard]);
  if (route.guard === "admin-auth") {
    expect(admin).toEqual({ outcome: "allow" });
    expect(anonymous).toEqual({ outcome: "redirect", to: "/admin/login" });
  }
  if (route.guard === "owner") {
    expect(owner).toEqual({ outcome: "allow" });
    expect(employee).toEqual({ outcome: "redirect", to: "/dashboard/pos" });
  }
});

test("the authoritative rendered route tree covers parameters and wildcard", () => {
  const concretePaths = appRoutes.map(({ path }) =>
    path.replace(":sfId", "sf-1").replace(":vendorId", "vendor-1")
      .replace(":slug", "pizza-hub").replace(":serviceId", "svc-1")
      .replace(":orderId", "ord-1").replace(":bookingId", "bkg-1")
  );
  for (const path of concretePaths.filter((path) => path !== "*")) {
    expect(matchRoutes(routeDefinitions, path)).not.toBeNull();
  }
  expect(matchRoutes(routeDefinitions, "/does-not-exist").at(-1).route.id).toBe("not-found");
  expect(routeDefinitions.every(({ element }) => React.isValidElement(element))).toBe(true);
});

test("models inherited onboarding and employee permission outcomes", () => {
  const dashboard = vendorRoutes.find(({ id }) => id === "vendor-dashboard");
  const orders = vendorRoutes.find(({ id }) => id === "vendor-orders");
  expect(evaluateRoute(dashboard, { kind: "vendor", onboarded: false })).toEqual({
    outcome: "redirect", to: "/onboarding",
  });
  expect(evaluateRoute(dashboard, { kind: "employee" })).toEqual({ outcome: "allow" });
  expect(evaluateRoute(orders, { kind: "vendor", onboarded: false })).toEqual({
    outcome: "redirect", to: "/onboarding",
  });
  expect(evaluateRoute(orders, { kind: "employee", permissions: {} })).toEqual({
    outcome: "redirect", to: "/dashboard/pos",
  });
});
