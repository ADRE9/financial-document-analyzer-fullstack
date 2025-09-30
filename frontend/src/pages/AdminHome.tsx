import { useNavigate } from "react-router";
import { useEffect, useCallback } from "react";
import { Shield } from "lucide-react";

import { useAuth } from "../hooks/useAuthContext";
import { useHealth } from "../hooks/useHealth";
import { useLogout } from "../hooks/useLogout";
import { AppHeader } from "../components/layout/AppHeader";
import { WelcomeSection } from "../components/dashboard/WelcomeSection";
import { SystemHealthCard } from "../components/dashboard/SystemHealthCard";
import { AdminStatsGrid } from "../components/dashboard/AdminStatsGrid";
import { AdminActionsPanel } from "../components/dashboard/AdminActionsPanel";
import { RecentActivityPanel } from "../components/dashboard/RecentActivityPanel";

const AdminHome = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: health, isLoading: healthLoading } = useHealth();
  const handleLogout = useLogout();

  // Redirect if not admin (additional protection) - moved to useEffect to avoid side effects during render
  useEffect(() => {
    if (!isAdmin) {
      navigate("/home", { replace: true });
    }
  }, [isAdmin, navigate]);

  // Define all hooks before any conditional returns
  const handleNavigateToDocuments = useCallback(() => {
    navigate("/admin/documents");
  }, [navigate]);

  // Early return if not admin to prevent rendering
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title="Admin Dashboard - Financial Document Analyzer"
        icon={Shield}
        user={user}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <WelcomeSection
          userName={user?.first_name || user?.username}
          description="Welcome to the admin dashboard. Monitor system health and manage the platform."
        />

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            System Health Status
          </h3>
          <SystemHealthCard health={health} isLoading={healthLoading} />
        </div>

        <AdminStatsGrid />

        <AdminActionsPanel onNavigateToDocuments={handleNavigateToDocuments} />

        <RecentActivityPanel username={user?.username} />
      </main>
    </div>
  );
};

export default AdminHome;
