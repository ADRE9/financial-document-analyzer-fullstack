import { FileText, Clock, CheckCircle, Activity } from "lucide-react";
import { useAnalyticsOverview } from "../../hooks/useAnalytics";
import { Card } from "../ui/card";

export const AnalyticsOverview = () => {
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
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <Card className="p-4">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">
                Total Documents
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading
                  ? "..."
                  : formatNumber(analytics?.total_documents || 0)}
              </p>
            </div>
          </div>
        </Card>

        {/* Processing Time */}
        <Card className="p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">
                Avg Processing Time
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading
                  ? "..."
                  : formatTime(analytics?.average_processing_time_seconds || 0)}
              </p>
            </div>
          </div>
        </Card>

        {/* Success Rate */}
        <Card className="p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">
                Success Rate
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading
                  ? "..."
                  : formatPercentage(analytics?.success_rate || 0)}
              </p>
            </div>
          </div>
        </Card>

        {/* Confidence Score */}
        <Card className="p-4">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">
                Avg Confidence
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading
                  ? "..."
                  : formatPercentage(analytics?.confidence_scores.average || 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Processing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Today</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {isLoading
              ? "..."
              : formatNumber(analytics?.documents_processed_today || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Documents processed</p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">This Week</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {isLoading
              ? "..."
              : formatNumber(analytics?.documents_processed_this_week || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Documents processed</p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">This Month</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {isLoading
              ? "..."
              : formatNumber(analytics?.documents_processed_this_month || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Documents processed</p>
        </Card>
      </div>

      {/* Document Types */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Document Types
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {!isLoading &&
            analytics?.document_types &&
            Object.entries(analytics.document_types).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(count)}
                </div>
                <div className="text-sm text-gray-500 capitalize">{type}</div>
              </div>
            ))}
        </div>
      </Card>

      {/* Confidence Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Confidence Scores
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {!isLoading &&
            analytics?.confidence_scores &&
            Object.entries(analytics.confidence_scores)
              .filter(([key]) => key !== "average")
              .map(([level, score]) => (
                <div key={level} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPercentage(score)}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {level.replace("_", " ")}
                  </div>
                </div>
              ))}
        </div>
      </Card>

      {/* Last Updated */}
      <div className="text-sm text-gray-500 text-right">
        Last updated:{" "}
        {isLoading
          ? "..."
          : new Date(analytics?.last_updated || "").toLocaleTimeString()}
      </div>
    </div>
  );
};
