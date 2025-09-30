// React Query hooks for health check

import { useQuery } from "@tanstack/react-query";
import { getHealth } from "../services/api";

// Query keys
export const healthKeys = {
  all: ["health"] as const,
  status: () => [...healthKeys.all, "status"] as const,
};

// Get health status
export const useHealth = () => {
  return useQuery({
    queryKey: healthKeys.status(),
    queryFn: getHealth,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 3,
  });
};