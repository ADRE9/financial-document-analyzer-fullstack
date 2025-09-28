import { LogOut, User } from "lucide-react";
import { Button } from "../ui/button";
import { getRoleDisplayName, getRoleBadgeColor } from "../../utils/roleUtils";

interface AppHeaderProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  user: {
    first_name?: string;
    last_name?: string;
    username?: string;
    role?: string;
  } | null;
  onLogout: () => void;
}

export const AppHeader = ({
  title,
  icon: Icon,
  user,
  onLogout,
}: AppHeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Icon className="h-8 w-8 text-red-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {user?.first_name} {user?.last_name}
              </span>
              {user?.role && (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {getRoleDisplayName(user.role)}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
