import { apiClient } from "./client";
import type {
  CrewAnalysisRequest,
  CrewAnalysisResponse,
  DocumentValidationResponse,
  CrewHealthResponse,
} from "../../types/api";

export const runCrewAnalysis = (
  requestData: CrewAnalysisRequest
): Promise<CrewAnalysisResponse> => {
  return apiClient.request<CrewAnalysisResponse>("/crew/analyze", {
    method: "POST",
    body: JSON.stringify(requestData),
  });
};

export const getCrewHealth = (): Promise<CrewHealthResponse> => {
  return apiClient.request<CrewHealthResponse>("/crew/health");
};

export const validateDocument = (
  requestData: CrewAnalysisRequest
): Promise<DocumentValidationResponse> => {
  return apiClient.request<DocumentValidationResponse>(
    "/crew/validate-document",
    {
      method: "POST",
      body: JSON.stringify(requestData),
    }
  );
};
