import { apiClient } from "./client";
import type {
  DocumentAnalysisResponse,
  DocumentUploadRequest,
  SuccessResponse,
} from "../../types/api";

export const getDocuments = (): Promise<DocumentAnalysisResponse[]> => {
  return apiClient.request<DocumentAnalysisResponse[]>("/documents/");
};

export const getDocument = (id: string): Promise<DocumentAnalysisResponse> => {
  return apiClient.request<DocumentAnalysisResponse>(`/documents/${id}`);
};

export const uploadDocument = (
  file: File,
  uploadData: DocumentUploadRequest
): Promise<DocumentAnalysisResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("document_type", uploadData.document_type);
  if (uploadData.description) {
    formData.append("description", uploadData.description);
  }
  if (uploadData.password) {
    formData.append("password", uploadData.password);
  }
  if (uploadData.auto_analyze !== undefined) {
    formData.append("auto_analyze", uploadData.auto_analyze.toString());
  }
  if (uploadData.analysis_query) {
    formData.append("analysis_query", uploadData.analysis_query);
  }

  return apiClient.request<DocumentAnalysisResponse>("/documents/upload", {
    method: "POST",
    headers: {},
    body: formData,
  });
};

export const deleteDocument = (id: string): Promise<SuccessResponse> => {
  return apiClient.request<SuccessResponse>(`/documents/${id}`, {
    method: "DELETE",
  });
};

export const analyzeDocument = (
  id: string,
  query: string = "Provide a comprehensive financial analysis of this document"
): Promise<DocumentAnalysisResponse> => {
  return apiClient.request<DocumentAnalysisResponse>(
    `/documents/${id}/analyze?query=${encodeURIComponent(query)}`,
    {
      method: "POST",
    }
  );
};
