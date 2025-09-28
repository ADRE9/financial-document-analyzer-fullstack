import { useNavigate } from "react-router";
import { LogOut, User, FileText, Eye } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuthContext";
import { getRoleDisplayName, getRoleBadgeColor } from "../utils/roleUtils";

const ViewerHome = () => {
  const { user, logout, isViewer } = useAuth();
  const navigate = useNavigate();

  // Redirect if not viewer (additional protection)
  if (!isViewer) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Document Viewer - Financial Document Analyzer
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
            Welcome to your document viewer. Your access level allows you to
            view and analyze financial documents.
          </p>
        </div>

        {/* Empty State for Viewer */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Document viewing and analysis features are being developed. You'll
              be able to view documents, analysis results, and reports here.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => toast.info("Document features coming soon!")}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Documents
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.info("Analysis features coming soon!")}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Analysis
              </Button>
            </div>
          </div>
        </div>

        {/* Role Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-900">
                Viewer Account
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                You have viewer access to the system. This allows you to view
                documents and analysis results, but not administrative
                functions. Contact an administrator if you need additional
                permissions.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewerHome;
