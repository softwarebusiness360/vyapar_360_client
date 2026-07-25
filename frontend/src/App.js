import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./lib/auth";
import { AdminAuthProvider, useAdminAuth } from "./lib/adminAuth";
import "./App.css";

import LandingPage from "./pages/marketing/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import OnboardingPage from "./pages/vendor/OnboardingPage";
import VendorDashboardLayout from "./pages/vendor/VendorDashboardLayout";
import OverviewPage from "./pages/vendor/OverviewPage";
import CataloguePage from "./pages/vendor/CataloguePage";
import OrdersPage from "./pages/vendor/OrdersPage";
import BookingsPage from "./pages/vendor/BookingsPage";
import StoreSettingsPage from "./pages/vendor/StoreSettingsPage";
import InsightsPage from "./pages/vendor/InsightsPage";
import TeamPage from "./pages/vendor/TeamPage";
import StorefrontsPage from "./pages/vendor/StorefrontsPage";
import POSPage from "./pages/vendor/POSPage";
import DiscoverPage from "./pages/customer/DiscoverPage";
import StorefrontPage from "./pages/customer/StorefrontPage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import BookingFlowPage from "./pages/customer/BookingFlowPage";
import OrderConfirmationPage from "./pages/customer/OrderConfirmationPage";
import BookingConfirmationPage from "./pages/customer/BookingConfirmationPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminBusinessesPage from "./pages/admin/AdminBusinessesPage";
import AdminBusinessDetailPage from "./pages/admin/AdminBusinessDetailPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminLandingCMSPage from "./pages/admin/AdminLandingCMSPage";
import AdminPlansPage from "./pages/admin/AdminPlansPage";
import AdminOnboardPage from "./pages/admin/AdminOnboardPage";
import AdminPersonaMatrixPage from "./pages/admin/AdminPersonaMatrixPage";
import VendorProfilePage from "./pages/vendor/VendorProfilePage";
import CustomerProfilePage from "./pages/customer/CustomerProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import { RequireOwner, RequirePermission } from "./lib/rbac";
import { CustomerAuthProvider } from "./lib/customerAuth";
import ChatSupport from "./components/ChatSupport";
import { useLocation } from "react-router-dom";

function ChatSupportGlobal() {
  const { pathname } = useLocation();
  // Show only on customer-facing pages (landing, discover, storefront, customer profile)
  const isCustomerRoute = pathname === "/"
    || pathname === "/me"
    || pathname === "/discover"
    || pathname.startsWith("/store/");
  if (!isCustomerRoute) return null;
  return <ChatSupport />;
}

function RequireAuth({ children, requireOnboarded = false }) {
  const { vendor, employee, loading } = useAuth();
  if (loading) return null;
  if (!vendor) return <Navigate to="/login" replace />;
  // Employees skip onboarding gate (their owner has already onboarded the workspace)
  if (requireOnboarded && !vendor.onboarded && !employee) return <Navigate to="/onboarding" replace />;
  return children;
}

function RedirectIfAuthed({ children }) {
  const { vendor, employee, loading } = useAuth();
  if (loading) return null;
  if (vendor && employee) return <Navigate to="/dashboard/pos" replace />;
  if (vendor && vendor.onboarded) return <Navigate to="/dashboard" replace />;
  if (vendor && !vendor.onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { admin, loading } = useAdminAuth();
  if (loading) return null;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}

function RedirectIfAdmin({ children }) {
  const { admin, loading } = useAdminAuth();
  if (loading) return null;
  if (admin) return <Navigate to="/admin" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <CustomerAuthProvider>
        <BrowserRouter>
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: "#141417",
                border: "1px solid #27272a",
                color: "#f3f4f6",
              },
            }}
          />
          <Routes>
            {/* Marketing */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/discover" element={<DiscoverPage />} />

            {/* Vendor auth */}
            <Route path="/login" element={<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>} />
            <Route path="/register" element={<RedirectIfAuthed><RegisterPage /></RedirectIfAuthed>} />

            {/* Vendor onboarding */}
            <Route
              path="/onboarding"
              element={
                <RequireAuth>
                  <OnboardingPage />
                </RequireAuth>
              }
            />

            {/* Vendor dashboard */}
            <Route
              path="/dashboard"
              element={
                <RequireAuth requireOnboarded>
                  <VendorDashboardLayout />
                </RequireAuth>
              }
            >
              <Route index element={<RequireOwner><OverviewPage /></RequireOwner>} />
              <Route path="pos" element={<POSPage />} />
              <Route path="catalogue" element={<RequirePermission perm="editCatalogue"><CataloguePage /></RequirePermission>} />
              <Route path="orders" element={<RequirePermission perm="takeOrders"><OrdersPage /></RequirePermission>} />
              <Route path="bookings" element={<RequirePermission perm="takeBookings"><BookingsPage /></RequirePermission>} />
              <Route path="insights" element={<RequirePermission perm="viewInsights"><InsightsPage /></RequirePermission>} />
              <Route path="storefronts" element={<RequireOwner><StorefrontsPage /></RequireOwner>} />
              <Route path="storefronts/:sfId" element={<RequireOwner><StorefrontsPage /></RequireOwner>} />
              <Route path="team" element={<RequireOwner><TeamPage /></RequireOwner>} />
              <Route path="settings" element={<RequireOwner><StoreSettingsPage /></RequireOwner>} />
              <Route path="profile" element={<VendorProfilePage />} />
            </Route>

            {/* Admin */}
            <Route path="/admin/login" element={<RedirectIfAdmin><AdminLoginPage /></RedirectIfAdmin>} />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            >
              <Route index element={<AdminOverviewPage />} />
              <Route path="businesses" element={<AdminBusinessesPage />} />
              <Route path="businesses/:vendorId" element={<AdminBusinessDetailPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="landing" element={<AdminLandingCMSPage />} />
              <Route path="plans" element={<AdminPlansPage />} />
              <Route path="personas" element={<AdminPersonaMatrixPage />} />
              <Route path="onboard" element={<AdminOnboardPage />} />
            </Route>

            {/* Customer profile */}
            <Route path="/me" element={<CustomerProfilePage />} />

            {/* Customer storefront */}
            <Route path="/store/:slug" element={<StorefrontPage />} />
            <Route path="/store/:slug/checkout" element={<CheckoutPage />} />
            <Route path="/store/:slug/book/:serviceId" element={<BookingFlowPage />} />
            <Route path="/store/:slug/order/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/store/:slug/booking/:bookingId" element={<BookingConfirmationPage />} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <ChatSupportGlobal />
        </BrowserRouter>
        </CustomerAuthProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}
