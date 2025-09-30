import { useState } from "react";
import { useHealth } from "./hooks/useHealth";
import { useDocuments } from "./hooks/useDocuments";
import { Button } from "./components/ui/button";
import { Progress } from "./components/ui/progress";
import type { HealthResponse, DocumentAnalysisResponse } from "./types/api";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  // React Query hooks
  const {
    data: health,
    isLoading: healthLoading,
    error: healthError,
  } = useHealth() as {
    data: HealthResponse | undefined;
    isLoading: boolean;
    error: Error | null;
  };
  const {
    data: documents,
    isLoading: documentsLoading,
    error: documentsError,
  } = useDocuments() as {
    data: DocumentAnalysisResponse[] | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Financial Document Analyzer
          </h1>
          <p className="text-center text-gray-600 mb-8">
            AI-powered financial document analysis with React Query integration
          </p>

          {/* Counter for demo */}
          <div className="text-center">
            <Button
              onClick={() => setCount((count) => count + 1)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              count is {count}
            </Button>
          </div>
        </div>

        {/* Health Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            System Health
          </h2>
          {healthLoading && (
            <div className="flex items-center space-x-2">
              <Progress value={undefined} className="w-32" />
              <span className="text-gray-600">Checking health...</span>
            </div>
          )}
          {healthError && (
            <div className="text-red-600 bg-red-50 p-3 rounded-lg">
              <p className="font-medium">Health check failed</p>
              <p className="text-sm">{healthError.message}</p>
            </div>
          )}
          {health && (
            <div
              className={`p-4 rounded-lg ${
                health.status === "healthy"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Status: {health.status}</p>
                  <p className="text-sm">{health.message}</p>
                </div>
                <div className="text-right text-sm">
                  <p>Version: {health.version}</p>
                  <p>Time: {new Date(health.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Documents
          </h2>
          {documentsLoading && (
            <div className="flex items-center space-x-2">
              <Progress value={undefined} className="w-32" />
              <span className="text-gray-600">Loading documents...</span>
            </div>
          )}
          {documentsError && (
            <div className="text-red-600 bg-red-50 p-3 rounded-lg">
              <p className="font-medium">Failed to load documents</p>
              <p className="text-sm">{documentsError.message}</p>
            </div>
          )}
          {documents && (
            <div className="space-y-4">
              {documents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No documents found
                </p>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.document_id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {doc.filename}
                        </h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {doc.document_type}
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>{new Date(doc.processed_at).toLocaleDateString()}</p>
                        <p className="capitalize">{doc.status}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Document Manager Component */}
        <div className="mt-8"></div>

        {/* React Query DevTools Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>React Query DevTools are available in development mode</p>
          <p>Open the browser dev tools to see the React Query panel</p>
        </div>
      </div>
    </div>
  );
}

export default App;
