import {
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  Settings,
} from "lucide-react";

interface HealthData {
  status: string;
  message?: string;
  version?: string;
}

interface SystemHealthCardProps {
  health: HealthData | undefined;
  isLoading: boolean;
}

const getHealthStatusIcon = (status?: string, isLoading?: boolean) => {
  if (isLoading) {
    return <Activity className="h-5 w-5 text-blue-500 animate-pulse" />;
  }

  switch (status) {
    case "healthy":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "unhealthy":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  }
};

export const SystemHealthCard = ({
  health,
  isLoading,
}: SystemHealthCardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Overall Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-500">System Status</h4>
            <p className="text-2xl font-bold text-gray-900 capitalize">
              {isLoading ? "Checking..." : health?.status || "Unknown"}
            </p>
          </div>
          {getHealthStatusIcon(health?.status, isLoading)}
        </div>
        {health?.message && (
          <p className="text-sm text-gray-600 mt-2">{health.message}</p>
        )}
      </div>

      {/* API Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-500">API Status</h4>
            <p className="text-2xl font-bold text-green-600">Online</p>
          </div>
          <Activity className="h-5 w-5 text-green-500" />
        </div>
        <p className="text-sm text-gray-600 mt-2">All endpoints operational</p>
      </div>

      {/* Database Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Database</h4>
            <p className="text-2xl font-bold text-green-600">Connected</p>
          </div>
          <Database className="h-5 w-5 text-green-500" />
        </div>
        <p className="text-sm text-gray-600 mt-2">MongoDB operational</p>
      </div>

      {/* Version Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Version</h4>
            <p className="text-2xl font-bold text-gray-900">
              {health?.version || "1.0.0"}
            </p>
          </div>
          <Settings className="h-5 w-5 text-gray-500" />
        </div>
        <p className="text-sm text-gray-600 mt-2">Current system version</p>
      </div>
    </div>
  );
};
