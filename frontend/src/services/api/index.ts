// Re-export all API functions and types from their respective modules
export * from "./auth";
export * from "./documents";
export * from "./crew";
export * from "./analytics";
export * from "./health";
export { apiClient } from "./client";

// Re-export types for convenience
export type {
  AnalyticsOverview,
  ProcessingTrends,
  PerformanceMetrics,
  DocumentTypeAnalytics,
} from "../../types/api";
