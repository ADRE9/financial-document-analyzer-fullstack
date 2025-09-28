import { useCallback } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "./useAuthContext";

export const useLogout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error("Logout failed");
    }
  }, [logout, navigate]);

  return handleLogout;
};
