import { FileText, Clock, Activity, Users } from "lucide-react";
import { useDocumentTypeAnalytics } from "../../hooks/useAnalytics";
import { Card } from "../ui/card";

export const DocumentTypeAnalytics = () => {
  const { data: analytics, isLoading } = useDocumentTypeAnalytics();

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
      {!isLoading &&
        analytics?.type_breakdown &&
        Object.entries(analytics.type_breakdown).map(([type, data]) => (
          <Card key={type} className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-medium text-gray-900 capitalize">
                {type}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Document Count */}
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Documents</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(data.count)}
                </div>
              </div>

              {/* Processing Time */}
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Avg Processing</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {formatTime(data.processing_time_avg_seconds)}
                </div>
              </div>

              {/* Confidence Score */}
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Confidence</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {formatPercentage(data.average_confidence)}
                </div>
              </div>

              {/* Common Vendors */}
              <div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Top Vendors</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {data.common_vendors.join(", ")}
                </div>
              </div>
            </div>
          </Card>
        ))}

      {/* Last Updated */}
      <div className="text-sm text-gray-500 text-right">
        Last updated:{" "}
        {isLoading
          ? "..."
          : analytics?.last_updated
          ? new Date(analytics.last_updated).toLocaleTimeString()
          : "No data available"}
      </div>
    </div>
  );
};
