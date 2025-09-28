// React Query hooks for document operations

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/api";
import type { DocumentUploadRequest } from "../types/api";

// Query keys
export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...documentKeys.lists(), { filters }] as const,
  details: () => [...documentKeys.all, "detail"] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
};

// Get all documents
export const useDocuments = () => {
  return useQuery({
    queryKey: documentKeys.lists(),
    queryFn: () => apiClient.getDocuments(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single document
export const useDocument = (id: string) => {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => apiClient.getDocument(id),
    enabled: !!id,
  });
};

// Upload document mutation
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      uploadData,
    }: {
      file: File;
      uploadData: DocumentUploadRequest;
    }) => apiClient.uploadDocument(file, uploadData),
    onSuccess: () => {
      // Invalidate and refetch documents list
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
    onError: (error) => {
      console.error("Upload failed:", error);
    },
  });
};

// Delete document mutation
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteDocument(id),
    onSuccess: (_, deletedId) => {
      // Remove the document from cache
      queryClient.removeQueries({ queryKey: documentKeys.detail(deletedId) });
      // Invalidate and refetch documents list
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
    onError: (error) => {
      console.error("Delete failed:", error);
    },
  });
};
