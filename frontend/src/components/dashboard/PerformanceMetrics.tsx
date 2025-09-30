import { Gauge, AlertCircle, Activity } from "lucide-react";
import { usePerformanceMetrics } from "../../hooks/useAnalytics";
import { Card } from "../ui/card";
import type { PerformanceMetrics as PerformanceMetricsType } from "../../types/api";

export const PerformanceMetrics = () => {
  const { data: metrics, isLoading } = usePerformanceMetrics() as {
    data: PerformanceMetricsType | undefined;
    isLoading: boolean;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(Math.round(num));
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          Loading performance metrics...
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Response Times */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-medium text-gray-900">Response Times</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500">Average</div>
            <div className="text-xl font-bold text-gray-900">
              {isLoading
                ? "..."
                : formatTime((metrics?.response_times.average || 0) * 1000)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">P95</div>
            <div className="text-xl font-bold text-gray-900">
              {isLoading
                ? "..."
                : formatTime((metrics?.response_times.p95 || 0) * 1000)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Min</div>
            <div className="text-xl font-bold text-gray-900">
              {isLoading
                ? "..."
                : formatTime((metrics?.response_times.min || 0) * 1000)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Max</div>
            <div className="text-xl font-bold text-gray-900">
              {isLoading
                ? "..."
                : formatTime((metrics?.response_times.max || 0) * 1000)}
            </div>
          </div>
        </div>
      </Card>

      {/* Error Rates */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900">Error Rates</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500">Total Errors</div>
            <div className="text-xl font-bold text-gray-900">
              {isLoading
                ? "..."
                : formatNumber(metrics?.error_rates.total_errors || 0)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Error Rate</div>
            <div className="text-xl font-bold text-red-500">
              {isLoading
                ? "..."
                : ((metrics?.error_rates.error_rate || 0) * 100).toFixed(1)}
              %
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Most Common</div>
            <div className="text-sm font-medium text-gray-900">
              {isLoading
                ? "..."
                : Object.keys(metrics?.error_rates.errors_by_type || {})[0] ||
                  "None"}
            </div>
          </div>
        </div>
      </Card>

      {/* Throughput */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-indigo-500" />
          <h3 className="text-lg font-medium text-gray-900">Throughput</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-500">Requests/Minute</div>
            <div className="text-xl font-bold text-gray-900">
              {isLoading
                ? "..."
                : formatNumber(metrics?.throughput.requests_per_minute || 0)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Documents/Hour</div>
            <div className="text-xl font-bold text-gray-900">
              {isLoading
                ? "..."
                : formatNumber(metrics?.throughput.documents_per_hour || 0)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
