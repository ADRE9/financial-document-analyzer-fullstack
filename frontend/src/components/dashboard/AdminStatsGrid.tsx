import { FileText, Users, BarChart3 } from "lucide-react";

interface AdminStatsGridProps {
  documentsCount: number;
  isDocumentsLoading: boolean;
}

export const AdminStatsGrid = ({
  documentsCount,
  isDocumentsLoading,
}: AdminStatsGridProps) => {
  return (
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
              {isDocumentsLoading ? "Loading..." : `${documentsCount}`}
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
            <h3 className="text-lg font-medium text-gray-900">Active Users</h3>
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
            <h3 className="text-lg font-medium text-gray-900">Queue Status</h3>
            <p className="text-2xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-500">Documents in queue</p>
          </div>
        </div>
      </div>
    </div>
  );
};
