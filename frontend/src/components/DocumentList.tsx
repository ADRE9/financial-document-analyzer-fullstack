import { useState, useCallback } from "react";
import { FileText, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useDocuments, useDeleteDocument } from "../hooks/useDocuments";
import { useAnalyzeDocument } from "../hooks/useCrewAnalysis";
import type { DocumentAnalysisResponse } from "../types/api";
import { DocumentItem } from "./documents/DocumentItem";
import { DocumentDetailsDialog } from "./documents/DocumentDetailsDialog";
import { DeleteConfirmDialog } from "./documents/DeleteConfirmDialog";

interface DocumentListProps {
  onDocumentSelect?: (document: DocumentAnalysisResponse) => void;
  className?: string;
}

export const DocumentList = ({
  onDocumentSelect,
  className = "",
}: DocumentListProps) => {
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentAnalysisResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] =
    useState<DocumentAnalysisResponse | null>(null);

  const { data: documents, isLoading, error, refetch } = useDocuments();
  const deleteMutation = useDeleteDocument();
  const analyzeMutation = useAnalyzeDocument();

  const handleDeleteDocument = useCallback(async () => {
    if (!documentToDelete) return;

    try {
      await deleteMutation.mutateAsync(documentToDelete.document_id);
      toast.success(
        `Document "${documentToDelete.filename}" deleted successfully`
      );
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      refetch();
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || "Delete failed";
      toast.error(errorMessage);
    }
  }, [documentToDelete, deleteMutation, refetch]);

  const openDeleteDialog = useCallback((document: DocumentAnalysisResponse) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  }, []);

  const handleViewDocument = useCallback(
    (document: DocumentAnalysisResponse) => {
      setSelectedDocument(document);
      onDocumentSelect?.(document);
    },
    [onDocumentSelect]
  );

  const handleAnalyzeDocument = useCallback(
    async (document: DocumentAnalysisResponse) => {
      try {
        toast.loading(`Analyzing ${document.filename}...`, {
          id: `analyze-${document.document_id}`,
        });

        await analyzeMutation.mutateAsync({
          documentId: document.document_id,
          query: "Provide a comprehensive financial analysis of this document",
        });

        toast.success(`Analysis completed for ${document.filename}`, {
          id: `analyze-${document.document_id}`,
        });

        // Refresh the document list to show updated status
        refetch();
      } catch (error: unknown) {
        const errorMessage = (error as Error)?.message || "Analysis failed";
        toast.error(errorMessage, {
          id: `analyze-${document.document_id}`,
        });
      }
    },
    [analyzeMutation, refetch]
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Documents
            </h3>
            <p className="text-gray-500 mb-4">
              Failed to load your documents. Please try again.
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Documents Yet
            </h3>
            <p className="text-gray-500">
              Upload your first financial document to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Documents ({documents.length})</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((document) => (
              <DocumentItem
                key={document.document_id}
                document={document}
                onView={handleViewDocument}
                onDelete={openDeleteDialog}
                onAnalyze={handleAnalyzeDocument}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Details Dialog */}
      <DocumentDetailsDialog
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        document={documentToDelete}
        isOpen={deleteDialogOpen}
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteDocument}
      />
    </div>
  );
};

export default DocumentList;
