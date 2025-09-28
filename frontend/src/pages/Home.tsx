import { useNavigate } from "react-router";
import { LogOut, User, FileText, BarChart3, Settings } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuthContext";
import { useHealth } from "../hooks/useHealth";
import { useDocuments } from "../hooks/useDocuments";

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: health, isLoading: healthLoading } = useHealth();
  const { data: documents, isLoading: documentsLoading } = useDocuments();

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Financial Document Analyzer
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.first_name} {user?.last_name}
                </span>
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
            Welcome to your financial document analysis dashboard.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* System Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div
                  className={`w-3 h-3 rounded-full ${
                    health?.status === "healthy" ? "bg-green-400" : "bg-red-400"
                  }`}
                />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  System Status
                </h3>
                <p className="text-sm text-gray-500">
                  {healthLoading ? "Checking..." : health?.status || "Unknown"}
                </p>
              </div>
            </div>
          </div>

          {/* Documents Count */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                <p className="text-sm text-gray-500">
                  {documentsLoading
                    ? "Loading..."
                    : `${documents?.length || 0} processed`}
                </p>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Account</h3>
                <p className="text-sm text-gray-500">
                  {user?.is_verified ? "Verified" : "Pending verification"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                className="flex items-center justify-center space-x-2 h-12"
                onClick={() => toast.info("Document upload coming soon!")}
              >
                <FileText className="h-5 w-5" />
                <span>Upload Document</span>
              </Button>

              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 h-12"
                onClick={() => toast.info("Analytics coming soon!")}
              >
                <BarChart3 className="h-5 w-5" />
                <span>View Analytics</span>
              </Button>

              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 h-12"
                onClick={() => toast.info("Settings coming soon!")}
              >
                <Settings className="h-5 w-5" />
                <span>Account Settings</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Documents
            </h3>
          </div>
          <div className="p-6">
            {documentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading documents...</p>
              </div>
            ) : documents && documents.length > 0 ? (
              <div className="space-y-4">
                {documents.slice(0, 5).map((doc) => (
                  <div
                    key={doc.document_id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {doc.filename}
                        </h4>
                        <p className="text-sm text-gray-500 capitalize">
                          {doc.document_type} •{" "}
                          {new Date(doc.processed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          doc.status === "processed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {doc.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {(doc.confidence_score * 100).toFixed(1)}% confidence
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No documents yet
                </h4>
                <p className="text-gray-500 mb-4">
                  Upload your first financial document to get started with
                  analysis.
                </p>
                <Button
                  onClick={() => toast.info("Document upload coming soon!")}
                >
                  Upload Document
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
