import React from "react";
import LandingPage from "@/features/marketing/LandingPage";
import LegalPage from "@/features/marketing/LegalPage";
import LoginPage from "@/features/vendor/auth/LoginPage";
import RegisterPage from "@/features/vendor/auth/RegisterPage";
import OnboardingPage from "@/features/vendor/auth/OnboardingPage";
import VendorDashboardLayout from "@/features/vendor/layout/VendorDashboardLayout";
import VendorProfilePage from "@/features/vendor/common/profile/VendorProfilePage";
import OverviewPage from "@/features/vendor/common/overview/OverviewPage";
import InsightsPage from "@/features/vendor/common/insights/InsightsPage";
import CataloguePage from "@/features/vendor/common/catalogue/CataloguePage";
import StoreSettingsPage from "@/features/vendor/common/storefronts/StoreSettingsPage";
import StorefrontsPage from "@/features/vendor/common/storefronts/StorefrontsPage";
import OrdersPage from "@/features/vendor/restaurant/orders/OrdersPage";
import POSPage from "@/features/vendor/common/pos/POSPage";
import LegacyPOSRoute from "@/features/vendor/common/pos/LegacyPOSRoute";
import BookingsPage from "@/features/vendor/salon/bookings/BookingsPage";
import TeamPage from "@/features/vendor/common/team/TeamPage";
import DiscoverPage from "@/features/customer/common/discovery/DiscoverPage";
import StorefrontPage from "@/features/customer/common/storefront/StorefrontPage";
import CustomerProfilePage from "@/features/customer/common/profile/CustomerProfilePage";
import CheckoutPage from "@/features/customer/restaurant/checkout/CheckoutPage";
import OrderConfirmationPage from "@/features/customer/restaurant/checkout/OrderConfirmationPage";
import BookingFlowPage from "@/features/customer/salon/booking/BookingFlowPage";
import BookingConfirmationPage from "@/features/customer/salon/booking/BookingConfirmationPage";
import AdminLoginPage from "@/features/admin/auth/AdminLoginPage";
import AdminLayout from "@/features/admin/layout/AdminLayout";
import AdminOverviewPage from "@/features/admin/overview/AdminOverviewPage";
import AdminBusinessesPage from "@/features/admin/businesses/AdminBusinessesPage";
import AdminBusinessDetailPage from "@/features/admin/businesses/AdminBusinessDetailPage";
import AdminOrdersPage from "@/features/admin/orders/AdminOrdersPage";
import AdminBookingsPage from "@/features/admin/bookings/AdminBookingsPage";
import AdminLandingCMSPage from "@/features/admin/landing/AdminLandingCMSPage";
import AdminPlansPage from "@/features/admin/plans/AdminPlansPage";
import AdminOnboardPage from "@/features/admin/onboarding/AdminOnboardPage";
import AdminPersonaMatrixPage from "@/features/admin/personas/AdminPersonaMatrixPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { RequireCapability, RequireOwner, RequirePermission } from "@/lib/rbac";
import { RedirectIfAdmin, RedirectIfAuthed, RequireAdmin, RequireAuth } from "./routeGuards";

export const routeDefinitions = [
  { id: "marketing-home", path: "/", guard: "public", element: <LandingPage /> },
  { id: "marketing-privacy", path: "/privacy", guard: "public", element: <LegalPage page="privacy" /> },
  { id: "marketing-terms", path: "/terms", guard: "public", element: <LegalPage page="terms" /> },
  { id: "customer-discover", path: "/discover", guard: "public", element: <DiscoverPage /> },
  { id: "vendor-login", path: "/login", guard: "redirect-if-vendor", element: <RedirectIfAuthed><LoginPage /></RedirectIfAuthed> },
  { id: "vendor-register", path: "/register", guard: "redirect-if-vendor", element: <RedirectIfAuthed><RegisterPage /></RedirectIfAuthed> },
  { id: "vendor-onboarding", path: "/onboarding", guard: "vendor-auth", element: <RequireAuth><OnboardingPage /></RequireAuth> },
  {
    id: "vendor-dashboard", path: "/dashboard", guard: "vendor-auth-onboarded",
    element: <RequireAuth requireOnboarded><VendorDashboardLayout /></RequireAuth>,
    children: [
      { id: "vendor-overview", index: true, guard: "owner", element: <RequireOwner><OverviewPage /></RequireOwner> },
      { id: "vendor-pos", path: "pos", guard: "vendor-auth", element: <LegacyPOSRoute /> },
      { id: "vendor-catalogue", path: "catalogue", guard: "editCatalogue", element: <RequirePermission perm="editCatalogue"><CataloguePage /></RequirePermission> },
      { id: "vendor-orders", path: "orders", guard: "takeOrders", element: <RequirePermission perm="takeOrders"><OrdersPage /></RequirePermission> },
      { id: "vendor-new-order", path: "orders/new", guard: "takeOrders", element: <RequirePermission perm="takeOrders"><POSPage /></RequirePermission> },
      { id: "vendor-bookings", path: "bookings", guard: "takeBookings", element: <RequirePermission perm="takeBookings"><BookingsPage /></RequirePermission> },
      { id: "vendor-insights", path: "insights", guard: "viewInsights", element: <RequireCapability capability="insights" permission="viewInsights"><InsightsPage /></RequireCapability> },
      { id: "vendor-storefronts", path: "storefronts", guard: "owner", element: <RequireCapability capability="stores" permission="editCatalogue"><StorefrontsPage /></RequireCapability> },
      { id: "vendor-storefront-detail", path: "storefronts/:sfId", guard: "owner", element: <RequireCapability capability="stores" permission="editCatalogue"><StorefrontsPage /></RequireCapability> },
      { id: "vendor-team", path: "team", guard: "owner", element: <RequireCapability capability="team" permission="editCatalogue"><TeamPage /></RequireCapability> },
      { id: "vendor-settings", path: "settings", guard: "owner", element: <RequireOwner><StoreSettingsPage /></RequireOwner> },
      { id: "vendor-profile", path: "profile", guard: "vendor-auth", element: <VendorProfilePage /> },
    ],
  },
  { id: "admin-login", path: "/admin/login", guard: "redirect-if-admin", element: <RedirectIfAdmin><AdminLoginPage /></RedirectIfAdmin> },
  {
    id: "admin-layout", path: "/admin", guard: "admin-auth", element: <RequireAdmin><AdminLayout /></RequireAdmin>,
    children: [
      { id: "admin-overview", index: true, guard: "admin-auth", element: <AdminOverviewPage /> },
      { id: "admin-businesses", path: "businesses", guard: "admin-auth", element: <AdminBusinessesPage /> },
      { id: "admin-business-detail", path: "businesses/:vendorId", guard: "admin-auth", element: <AdminBusinessDetailPage /> },
      { id: "admin-orders", path: "orders", guard: "admin-auth", element: <AdminOrdersPage /> },
      { id: "admin-bookings", path: "bookings", guard: "admin-auth", element: <AdminBookingsPage /> },
      { id: "admin-landing", path: "landing", guard: "admin-auth", element: <AdminLandingCMSPage /> },
      { id: "admin-plans", path: "plans", guard: "admin-auth", element: <AdminPlansPage /> },
      { id: "admin-personas", path: "personas", guard: "admin-auth", element: <AdminPersonaMatrixPage /> },
      { id: "admin-onboard", path: "onboard", guard: "admin-auth", element: <AdminOnboardPage /> },
    ],
  },
  { id: "customer-profile", path: "/me", guard: "public", element: <CustomerProfilePage /> },
  { id: "customer-storefront", path: "/store/:slug", guard: "public", element: <StorefrontPage /> },
  { id: "customer-checkout", path: "/store/:slug/checkout", guard: "restaurant", element: <CheckoutPage /> },
  { id: "customer-book", path: "/store/:slug/book/:serviceId", guard: "salon", element: <BookingFlowPage /> },
  { id: "customer-order-confirmation", path: "/store/:slug/order/:orderId", guard: "restaurant", element: <OrderConfirmationPage /> },
  { id: "customer-booking-confirmation", path: "/store/:slug/booking/:bookingId", guard: "salon", element: <BookingConfirmationPage /> },
  { id: "not-found", path: "*", guard: "public", element: <NotFoundPage /> },
];

const join = (parent, child) => child === "*" ? "*" : child.startsWith("/") ? child : `${parent.replace(/\/$/, "")}/${child}`;
export function flattenRoutes(definitions = routeDefinitions, parentPath = "") {
  return definitions.flatMap((route) => {
    const path = route.index ? parentPath : join(parentPath, route.path);
    const current = { id: route.id, path, guard: route.guard };
    return [current, ...flattenRoutes(route.children || [], path)];
  });
}
