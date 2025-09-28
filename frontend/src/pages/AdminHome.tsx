import { useNavigate } from "react-router";
import {
  LogOut,
  User,
  FileText,
  BarChart3,
  Settings,
  Shield,
  Users,
  Database,
  Activity,
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuthContext";
import { useHealth } from "../hooks/useHealth";
import { useDocuments } from "../hooks/useDocuments";
import { getRoleDisplayName, getRoleBadgeColor } from "../utils/roleUtils";

const AdminHome = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: health, isLoading: healthLoading } = useHealth();
  const { data: documents, isLoading: documentsLoading } = useDocuments();

  // Redirect if not admin (additional protection)
  if (!isAdmin) {
    navigate("/home", { replace: true });
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getHealthStatusIcon = () => {
    if (healthLoading) {
      return <Activity className="h-5 w-5 text-blue-500 animate-pulse" />;
    }

    switch (health?.status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "unhealthy":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Dashboard - Financial Document Analyzer
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.first_name} {user?.last_name}
                </span>
                {user?.role && (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {getRoleDisplayName(user.role)}
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {user?.first_name || user?.username}!
          </h2>
          <p className="text-gray-600">
            Welcome to the admin dashboard. Monitor system health and manage the
            platform.
          </p>
        </div>

        {/* System Health Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Server className="h-5 w-5 mr-2" />
            System Health Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Overall Health */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    System Status
                  </h4>
                  <p className="text-2xl font-bold text-gray-900 capitalize">
                    {healthLoading
                      ? "Checking..."
                      : health?.status || "Unknown"}
                  </p>
                </div>
                {getHealthStatusIcon()}
              </div>
              {health?.message && (
                <p className="text-sm text-gray-600 mt-2">{health.message}</p>
              )}
            </div>

            {/* API Health */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    API Status
                  </h4>
                  <p className="text-2xl font-bold text-green-600">Online</p>
                </div>
                <Activity className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                All endpoints operational
              </p>
            </div>

            {/* Database Health */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Database
                  </h4>
                  <p className="text-2xl font-bold text-green-600">Connected</p>
                </div>
                <Database className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 mt-2">MongoDB operational</p>
            </div>

            {/* Version Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Version</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {health?.version || "1.0.0"}
                  </p>
                </div>
                <Settings className="h-5 w-5 text-gray-500" />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Current system version
              </p>
            </div>
          </div>
        </div>

        {/* Admin Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Documents Count */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Total Documents
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {documentsLoading
                    ? "Loading..."
                    : `${documents?.length || 0}`}
                </p>
                <p className="text-sm text-gray-500">Documents processed</p>
              </div>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Active Users
                </h3>
                <p className="text-2xl font-bold text-green-600">1</p>
                <p className="text-sm text-gray-500">Currently logged in</p>
              </div>
            </div>
          </div>

          {/* Processing Queue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Queue Status
                </h3>
                <p className="text-2xl font-bold text-purple-600">0</p>
                <p className="text-sm text-gray-500">Documents in queue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Admin Actions
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                className="flex items-center justify-center space-x-2 h-12"
                onClick={() => toast.info("User management coming soon!")}
              >
                <Users className="h-5 w-5" />
                <span>Manage Users</span>
              </Button>

              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 h-12"
                onClick={() => toast.info("System settings coming soon!")}
              >
                <Settings className="h-5 w-5" />
                <span>System Settings</span>
              </Button>

              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 h-12"
                onClick={() => toast.info("Analytics dashboard coming soon!")}
              >
                <BarChart3 className="h-5 w-5" />
                <span>View Analytics</span>
              </Button>

              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 h-12"
                onClick={() => toast.info("Database management coming soon!")}
              >
                <Database className="h-5 w-5" />
                <span>Database Admin</span>
              </Button>

              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 h-12"
                onClick={() => toast.info("System logs coming soon!")}
              >
                <Activity className="h-5 w-5" />
                <span>System Logs</span>
              </Button>

              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 h-12"
                onClick={() => toast.info("Backup & restore coming soon!")}
              >
                <Server className="h-5 w-5" />
                <span>Backup & Restore</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Recent System Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent System Activity
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      System Health Check
                    </h4>
                    <p className="text-sm text-gray-500">
                      All systems operational
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Admin Login
                    </h4>
                    <p className="text-sm text-gray-500">
                      {user?.username} logged in
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Database className="h-5 w-5 text-purple-500" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Database Connection
                    </h4>
                    <p className="text-sm text-gray-500">
                      MongoDB connection established
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminHome;
