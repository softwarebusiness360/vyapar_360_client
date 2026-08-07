import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./lib/auth";
import { AdminAuthProvider } from "./lib/adminAuth";
import "./App.css";

import { CustomerAuthProvider } from "./lib/customerAuth";
import { ThemeProvider, useTheme } from "./lib/theme";
import { routeDefinitions } from "./app/routes";

const renderRouteDefinitions = (definitions) => definitions.map(({ id, children, guard, ...route }) => (
  <Route key={id} {...route}>
    {children ? renderRouteDefinitions(children) : null}
  </Route>
));

function ThemedToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      position="top-right"
      toastOptions={{
        style: {
          background: "hsl(var(--bg-surface))",
          border: "1px solid hsl(var(--line))",
          color: "hsl(var(--ink-primary))",
        },
      }}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <AdminAuthProvider>
        <CustomerAuthProvider>
        <BrowserRouter>
          <ThemedToaster />
          <Routes>{renderRouteDefinitions(routeDefinitions)}</Routes>
        </BrowserRouter>
        </CustomerAuthProvider>
      </AdminAuthProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}
