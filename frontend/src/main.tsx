import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { RouterProvider } from "react-router/dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import SmartHome from "./pages/SmartHome";
import AdminHome from "./pages/AdminHome";
import AdminDocuments from "./pages/AdminDocuments";
import ViewerHome from "./pages/ViewerHome";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { AdminRoute, ViewerRoute } from "./components/RoleBasedRoute";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Create a wrapper component for the router content
const AppContent = () => (
  <AuthProvider>
    <Outlet />
    <Toaster position="top-right" richColors />
    <ReactQueryDevtools initialIsOpen={false} />
  </AuthProvider>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppContent />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: "login",
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: "register",
        element: (
          <PublicRoute>
            <Register />
          </PublicRoute>
        ),
      },
      {
        path: "home",
        element: (
          <ProtectedRoute>
            <SmartHome />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <AdminRoute>
            <AdminHome />
          </AdminRoute>
        ),
      },
      {
        path: "admin/documents",
        element: (
          <AdminRoute>
            <AdminDocuments />
          </AdminRoute>
        ),
      },
      {
        path: "viewer",
        element: (
          <ViewerRoute>
            <ViewerHome />
          </ViewerRoute>
        ),
      },
      {
        path: "unauthorized",
        element: (
          <ProtectedRoute>
            <Unauthorized />
          </ProtectedRoute>
        ),
      },
      // Legacy home route for backward compatibility
      {
        path: "legacy-home",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      // Catch all route - redirect to home
      {
        path: "*",
        element: <Navigate to="/home" replace />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
