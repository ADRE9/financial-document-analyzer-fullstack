import { apiClient } from "./client";
import type { HealthResponse } from "../../types/api";

export const getHealth = (): Promise<HealthResponse> => {
  return apiClient.request<HealthResponse>("/health");
};
