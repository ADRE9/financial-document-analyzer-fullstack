import { Activity, CheckCircle, User, Database } from "lucide-react";

interface RecentActivityPanelProps {
  username?: string;
}

export const RecentActivityPanel = ({ username }: RecentActivityPanelProps) => {
  const currentTime = new Date().toLocaleTimeString();

  const activities = [
    {
      icon: CheckCircle,
      iconColor: "text-green-500",
      title: "System Health Check",
      description: "All systems operational",
      time: currentTime,
    },
    {
      icon: User,
      iconColor: "text-blue-500",
      title: "Admin Login",
      description: `${username} logged in`,
      time: currentTime,
    },
    {
      icon: Database,
      iconColor: "text-purple-500",
      title: "Database Connection",
      description: "MongoDB connection established",
      time: currentTime,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Recent System Activity
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <activity.icon className={`h-5 w-5 ${activity.iconColor}`} />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {activity.description}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
