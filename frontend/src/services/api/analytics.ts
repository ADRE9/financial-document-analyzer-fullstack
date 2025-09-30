import { apiClient } from "./client";
import type {
  AnalyticsOverview,
  ProcessingTrends,
  PerformanceMetrics,
  DocumentTypeAnalytics,
} from "../../types/api";

export const getAnalyticsOverview = (): Promise<AnalyticsOverview> => {
  return apiClient.request<AnalyticsOverview>("/analytics/overview");
};

export const getProcessingTrends = (
  days: number = 30
): Promise<ProcessingTrends> => {
  return apiClient.request<ProcessingTrends>(`/analytics/trends?days=${days}`);
};

export const getPerformanceMetrics = (): Promise<PerformanceMetrics> => {
  return apiClient.request<PerformanceMetrics>("/analytics/performance");
};

export const getDocumentTypeAnalytics = (): Promise<DocumentTypeAnalytics> => {
  return apiClient.request<DocumentTypeAnalytics>("/analytics/document-types");
};
