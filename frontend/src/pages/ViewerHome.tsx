import { useNavigate } from "react-router";
import { useEffect } from "react";
import { Eye } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";
import { AppHeader } from "../components/layout/AppHeader";
import { WelcomeSection } from "../components/dashboard/WelcomeSection";
import PDFUploadZone from "../components/PDFUploadZone";
import DocumentList from "../components/DocumentList";

const ViewerHome = () => {
  const { user, isViewer } = useAuth();
  const navigate = useNavigate();
  const handleLogout = useLogout();

  // Redirect if not viewer (additional protection) - moved to useEffect to avoid side effects during render
  useEffect(() => {
    if (!isViewer) {
      navigate("/home", { replace: true });
    }
  }, [isViewer, navigate]);

  // Early return if not viewer to prevent rendering
  if (!isViewer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title="Document Viewer - Financial Document Analyzer"
        icon={Eye}
        user={user}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <WelcomeSection
          userName={user?.first_name || user?.username}
          description="Welcome to your document viewer. Your access level allows you to view and analyze financial documents."
        />

        {/* PDF Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <PDFUploadZone
            onUploadSuccess={(document) => {
              toast.success(
                `Document "${
                  (document as any).filename
                }" uploaded successfully!`
              );
              // The document list will automatically refresh via React Query
            }}
            onUploadError={(error) => {
              toast.error(`Upload failed: ${error}`);
            }}
            maxSizeBytes={10 * 1024 * 1024} // 10MB limit for security
          />

          <DocumentList
            onDocumentSelect={(document) => {
              toast.info(`Viewing document: ${document.filename}`);
            }}
          />
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
