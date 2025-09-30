import {
  FileText,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  Activity,
} from "lucide-react";
import { useAnalyticsOverview } from "../../hooks/useAnalytics";
import { Card } from "../ui/card";

export const AdminStatsGrid = () => {
  const { data: analytics, isLoading } = useAnalyticsOverview();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(Math.round(num));
  };

  const formatPercentage = (num: number) => {
    return `${(num * 100).toFixed(1)}%`;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
    return `${seconds.toFixed(1)}s`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
      {/* Total Documents */}
      <Card className="col-span-1 lg:col-span-2 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">
              Total Documents
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {isLoading
                ? "Loading..."
                : formatNumber(analytics?.total_documents || 0)}
            </p>
            <p className="text-sm text-gray-500">
              {isLoading
                ? "..."
                : `${formatNumber(
                    analytics?.documents_processed_today || 0
                  )} today`}
            </p>
          </div>
        </div>
      </Card>

      {/* Processing Time */}
      <Card className="col-span-1 lg:col-span-2 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Clock className="h-8 w-8 text-indigo-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">
              Processing Time
            </h3>
            <p className="text-2xl font-bold text-indigo-600">
              {isLoading
                ? "Loading..."
                : formatTime(analytics?.average_processing_time_seconds || 0)}
            </p>
            <p className="text-sm text-gray-500">Average per document</p>
          </div>
        </div>
      </Card>

      {/* Success Rate */}
      <Card className="col-span-1 lg:col-span-2 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">Success Rate</h3>
            <p className="text-2xl font-bold text-green-600">
              {isLoading
                ? "Loading..."
                : formatPercentage(analytics?.success_rate || 0)}
            </p>
            <p className="text-sm text-gray-500">Processing success rate</p>
          </div>
        </div>
      </Card>

      {/* Weekly Stats */}
      <Card className="col-span-1 lg:col-span-2 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">Weekly Stats</h3>
            <p className="text-2xl font-bold text-purple-600">
              {isLoading
                ? "Loading..."
                : formatNumber(analytics?.documents_processed_this_week || 0)}
            </p>
            <p className="text-sm text-gray-500">Documents this week</p>
          </div>
        </div>
      </Card>

      {/* Confidence Score */}
      <Card className="col-span-1 lg:col-span-2 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Activity className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">
              Confidence Score
            </h3>
            <p className="text-2xl font-bold text-yellow-600">
              {isLoading
                ? "Loading..."
                : formatPercentage(analytics?.confidence_scores.average || 0)}
            </p>
            <p className="text-sm text-gray-500">Average confidence</p>
          </div>
        </div>
      </Card>

      {/* Document Types */}
      <Card className="col-span-1 lg:col-span-2 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Users className="h-8 w-8 text-orange-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">
              Document Types
            </h3>
            <p className="text-2xl font-bold text-orange-600">
              {isLoading
                ? "Loading..."
                : Object.keys(analytics?.document_types || {}).length}
            </p>
            <p className="text-sm text-gray-500">Active categories</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
