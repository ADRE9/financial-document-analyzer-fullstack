import {
  FileText,
  Settings,
  BarChart3,
  Database,
  Activity,
  Server,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface AdminActionsPanelProps {
  onNavigateToDocuments: () => void;
}

export const AdminActionsPanel = ({
  onNavigateToDocuments,
}: AdminActionsPanelProps) => {
  const actions = [
    {
      icon: FileText,
      label: "Manage Documents",
      onClick: onNavigateToDocuments,
      variant: "default" as const,
    },
    {
      icon: Settings,
      label: "System Settings",
      onClick: () => toast.info("System settings coming soon!"),
      variant: "outline" as const,
    },
    {
      icon: BarChart3,
      label: "View Analytics",
      onClick: () => toast.info("Analytics dashboard coming soon!"),
      variant: "outline" as const,
    },
    {
      icon: Database,
      label: "Database Admin",
      onClick: () => toast.info("Database management coming soon!"),
      variant: "outline" as const,
    },
    {
      icon: Activity,
      label: "System Logs",
      onClick: () => toast.info("System logs coming soon!"),
      variant: "outline" as const,
    },
    {
      icon: Server,
      label: "Backup & Restore",
      onClick: () => toast.info("Backup & restore coming soon!"),
      variant: "outline" as const,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Admin Actions
        </h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="flex items-center justify-center space-x-2 h-12"
              onClick={action.onClick}
            >
              <action.icon className="h-5 w-5" />
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
