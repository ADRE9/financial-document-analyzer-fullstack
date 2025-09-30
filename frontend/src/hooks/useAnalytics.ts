import { useQuery } from "@tanstack/react-query";
import {
  getAnalyticsOverview,
  getProcessingTrends,
  getPerformanceMetrics,
  getDocumentTypeAnalytics,
} from "../services/api";

export interface AnalyticsOverview {
  total_documents: number;
  documents_processed_today: number;
  documents_processed_this_week: number;
  documents_processed_this_month: number;
  average_processing_time_seconds: number;
  success_rate: number;
  document_types: {
    invoice: number;
    receipt: number;
    statement: number;
    contract: number;
    other: number;
  };
  confidence_scores: {
    average: number;
    high_confidence: number;
    medium_confidence: number;
    low_confidence: number;
  };
  last_updated: string;
}

export interface ProcessingTrends {
  period_days: number;
  daily_counts: Array<{
    date: string;
    count: number;
  }>;
  total_processed: number;
  average_daily: number;
  trend_direction: "increasing" | "decreasing" | "stable";
}

export interface PerformanceMetrics {
  response_times: {
    average_ms: number;
    p95_ms: number;
    p99_ms: number;
    max_ms: number;
  };
  error_rates: {
    total_requests: number;
    successful_requests: number;
    error_requests: number;
    error_rate_percentage: number;
  };
  throughput: {
    requests_per_minute: number;
    requests_per_hour: number;
    peak_requests_per_minute: number;
  };
  system_health: {
    cpu_usage_percentage: number;
    memory_usage_percentage: number;
    disk_usage_percentage: number;
  };
  last_updated: string;
}

export interface DocumentTypeAnalytics {
  type_breakdown: {
    [key: string]: {
      count: number;
      average_confidence: number;
      processing_time_avg_seconds: number;
      common_vendors: string[];
    };
  };
  last_updated: string;
}

export function useAnalyticsOverview() {
  return useQuery<AnalyticsOverview>({
    queryKey: ["analytics", "overview"],
    queryFn: getAnalyticsOverview,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useProcessingTrends(days: number = 30) {
  return useQuery<ProcessingTrends>({
    queryKey: ["analytics", "trends", days],
    queryFn: () => getProcessingTrends(days),
    refetchInterval: 60000, // Refetch every minute
  });
}

export function usePerformanceMetrics() {
  return useQuery<PerformanceMetrics>({
    queryKey: ["analytics", "performance"],
    queryFn: getPerformanceMetrics,
    refetchInterval: 15000, // Refetch every 15 seconds
  });
}

export function useDocumentTypeAnalytics() {
  return useQuery<DocumentTypeAnalytics>({
    queryKey: ["analytics", "document-types"],
    queryFn: getDocumentTypeAnalytics,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
