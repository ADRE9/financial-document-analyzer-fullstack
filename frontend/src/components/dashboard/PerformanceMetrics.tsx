import { Gauge, AlertCircle, Activity, Server } from "lucide-react";
import { usePerformanceMetrics } from "../../hooks/useAnalytics";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";

export const PerformanceMetrics = () => {
  const { data: metrics, isLoading } = usePerformanceMetrics();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(Math.round(num));
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getHealthColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 75) return "text-yellow-500";
    return "text-green-500";
  };

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
                : formatTime(metrics?.response_times.average_ms || 0)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">P95</div>
            <div className="text-xl font-bold text-gray-900">
              {isLoading
                ? "..."
                : formatTime(metrics?.response_times.p95_ms || 0)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">P99</div>
            <div className="text-xl font-bold text-gray-900">
              {isLoading
                ? "..."
                : formatTime(metrics?.response_times.p99_ms || 0)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Max</div>
            <div className="text-xl font-bold text-gray-900">
              {isLoading
                ? "..."
                : formatTime(metrics?.response_times.max_ms || 0)}
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
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Total Requests</div>
              <div className="text-xl font-bold text-gray-900">
                {isLoading
                  ? "..."
                  : formatNumber(metrics?.error_rates.total_requests || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Successful</div>
              <div className="text-xl font-bold text-green-600">
                {isLoading
                  ? "..."
                  : formatNumber(metrics?.error_rates.successful_requests || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Errors</div>
              <div className="text-xl font-bold text-red-600">
                {isLoading
                  ? "..."
                  : formatNumber(metrics?.error_rates.error_requests || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Error Rate</div>
              <div className="text-xl font-bold text-gray-900">
                {isLoading
                  ? "..."
                  : `${metrics?.error_rates.error_rate_percentage.toFixed(2)}%`}
              </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-500">Per Minute</div>
            <div className="text-xl font-bold text-gray-900">
              {isLoading
                ? "..."
                : formatNumber(metrics?.throughput.requests_per_minute || 0)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Per Hour</div>
            <div className="text-xl font-bold text-gray-900">
              {isLoading
                ? "..."
                : formatNumber(metrics?.throughput.requests_per_hour || 0)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Peak RPM</div>
            <div className="text-xl font-bold text-gray-900">
              {isLoading
                ? "..."
                : formatNumber(
                    metrics?.throughput.peak_requests_per_minute || 0
                  )}
            </div>
          </div>
        </div>
      </Card>

      {/* System Health */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Server className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-medium text-gray-900">System Health</h3>
        </div>
        <div className="space-y-4">
          {!isLoading && metrics?.system_health && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">CPU Usage</span>
                  <span
                    className={`text-sm font-medium ${getHealthColor(
                      metrics.system_health.cpu_usage_percentage
                    )}`}
                  >
                    {metrics.system_health.cpu_usage_percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={metrics.system_health.cpu_usage_percentage}
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Memory Usage</span>
                  <span
                    className={`text-sm font-medium ${getHealthColor(
                      metrics.system_health.memory_usage_percentage
                    )}`}
                  >
                    {metrics.system_health.memory_usage_percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={metrics.system_health.memory_usage_percentage}
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Disk Usage</span>
                  <span
                    className={`text-sm font-medium ${getHealthColor(
                      metrics.system_health.disk_usage_percentage
                    )}`}
                  >
                    {metrics.system_health.disk_usage_percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={metrics.system_health.disk_usage_percentage}
                  className="h-2"
                />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Last Updated */}
      <div className="text-sm text-gray-500 text-right">
        Last updated:{" "}
        {isLoading
          ? "..."
          : metrics?.last_updated
          ? new Date(metrics.last_updated).toLocaleTimeString()
          : "No data available"}
      </div>
    </div>
  );
};
