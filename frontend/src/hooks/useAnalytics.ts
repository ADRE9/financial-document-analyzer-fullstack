// React Query hooks for analytics operations

import { useQuery } from "@tanstack/react-query";
import {
  getAnalyticsOverview,
  getProcessingTrends,
  getPerformanceMetrics,
  getDocumentTypeAnalytics,
} from "../services/api";

// Query keys
export const analyticsKeys = {
  all: ["analytics"] as const,
  overview: () => [...analyticsKeys.all, "overview"] as const,
  trends: (days: number) => [...analyticsKeys.all, "trends", days] as const,
  performance: () => [...analyticsKeys.all, "performance"] as const,
  documentTypes: () => [...analyticsKeys.all, "documentTypes"] as const,
};

// Get analytics overview
export const useAnalyticsOverview = () => {
  return useQuery({
    queryKey: analyticsKeys.overview(),
    queryFn: getAnalyticsOverview,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get processing trends
export const useProcessingTrends = (days: number = 30) => {
  return useQuery({
    queryKey: analyticsKeys.trends(days),
    queryFn: () => getProcessingTrends(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get performance metrics
export const usePerformanceMetrics = () => {
  return useQuery({
    queryKey: analyticsKeys.performance(),
    queryFn: getPerformanceMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get document type analytics
export const useDocumentTypeAnalytics = () => {
  return useQuery({
    queryKey: analyticsKeys.documentTypes(),
    queryFn: getDocumentTypeAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};