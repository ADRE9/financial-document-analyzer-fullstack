import { useNavigate } from "react-router";
import { Shield, ArrowLeft, Home } from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuthContext";
import { getRoleDisplayName } from "../utils/roleUtils";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isViewer } = useAuth();

  const handleGoHome = () => {
    if (isAdmin) {
      navigate("/admin", { replace: true });
    } else if (isViewer) {
      navigate("/viewer", { replace: true });
    } else {
      navigate("/home", { replace: true });
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this resource.
            </p>

            {user && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm">
                  <p className="text-gray-500">Current user:</p>
                  <p className="font-medium text-gray-900">{user.username}</p>
                  <p className="text-gray-500">Role:</p>
                  <p className="font-medium text-gray-900">
                    {getRoleDisplayName(user.role)}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleGoHome}
                className="w-full flex items-center justify-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Go to Home</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleGoBack}
                className="w-full flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Go Back</span>
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              If you believe this is an error, please contact your
              administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
