import { useNavigate } from "react-router";
import {
  LogOut,
  User,
  FileText,
  Shield,
  Upload,
  BarChart3,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useAuth } from "../hooks/useAuthContext";
import { useDocuments } from "../hooks/useDocuments";
import { getRoleDisplayName, getRoleBadgeColor } from "../utils/roleUtils";
import DocumentAnalysisWorkflow from "../components/DocumentAnalysisWorkflow";
import DocumentList from "../components/DocumentList";
import type { DocumentAnalysisResponse } from "../types/api";

const AdminDocuments = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: documents, isLoading } = useDocuments() as {
    data: DocumentAnalysisResponse[] | undefined;
    isLoading: boolean;
  };

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

  const getDocumentStats = () => {
    if (!documents) return { total: 0, processing: 0, completed: 0, failed: 0 };

    return {
      total: documents.length,
      processing: documents.filter(
        (doc) => doc.status === "processing" || doc.status === "uploaded"
      ).length,
      completed: documents.filter((doc) => doc.status === "completed").length,
      failed: documents.filter((doc) => doc.status === "failed").length,
    };
  };

  const stats = getDocumentStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Shield className="h-8 w-8 text-red-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Document Management - Admin
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
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Document Management
          </h2>
          <p className="text-gray-600">
            Upload, manage, and analyze financial documents. As an
            administrator, you have full access to all document operations.
          </p>
        </div>

        {/* Document Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Total Documents
                  </h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {isLoading ? "..." : stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Upload className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Processing
                  </h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    {isLoading ? "..." : stats.processing}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Completed
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    {isLoading ? "..." : stats.completed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Settings className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Failed</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {isLoading ? "..." : stats.failed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Analysis Workflow */}
        <div className="mb-8">
          <DocumentAnalysisWorkflow
            onWorkflowComplete={(analysisResult) => {
              toast.success("Document analysis completed successfully!");
              console.log("Analysis completed:", analysisResult);
            }}
          />
        </div>

        {/* Admin Features and Document Management */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Admin Features */}
          <div className="xl:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Admin Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => toast.info("Bulk upload coming soon!")}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Upload Documents
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => toast.info("Export coming soon!")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Export Analysis Results
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => toast.info("Settings coming soon!")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Document Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Document List */}
          <div className="xl:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              All Documents
            </h3>
            <DocumentList
              onDocumentSelect={(document) => {
                toast.info(`Viewing document: ${document.filename}`);
              }}
            />
          </div>
        </div>

        {/* Admin Information */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-red-600 mt-0.5" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-900">
                Administrator Access
              </h4>
              <p className="text-sm text-red-700 mt-1">
                You have full administrative access to the document management
                system. This includes the ability to view, manage, and delete
                all documents across all users. Use this access responsibly and
                in accordance with your organization's data privacy policies.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDocuments;
