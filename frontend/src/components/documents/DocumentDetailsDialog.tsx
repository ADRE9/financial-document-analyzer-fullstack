import { FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import type { DocumentAnalysisResponse } from "../../types/api";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import { getDocumentTypeLabel, formatDate } from "./DocumentTypeUtils";

interface DocumentDetailsDialogProps {
  document: DocumentAnalysisResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentDetailsDialog = ({
  document,
  isOpen,
  onClose,
}: DocumentDetailsDialogProps) => {
  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[98vw] w-[98vw] max-h-[95vh] overflow-y-auto"
        style={{ width: "98vw", maxWidth: "98vw" }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{document.filename}</span>
          </DialogTitle>
          <DialogDescription>
            Document analysis results and metadata
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">Document Type</h4>
              <Badge variant="outline">
                {getDocumentTypeLabel(document.document_type)}
              </Badge>
            </div>
            <div>
              <h4 className="font-medium mb-2">Status</h4>
              <DocumentStatusBadge status={document.status} />
            </div>
            <div>
              <h4 className="font-medium mb-2">Upload Date</h4>
              <p className="text-sm text-gray-600">
                {formatDate(document.processed_at)}
              </p>
            </div>
          </div>

          {/* Analysis Results */}
          {document.analysis_results &&
            Object.keys(document.analysis_results).length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Analysis Results</h4>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 [&_*]:!text-black dark:[&_*]:!text-white">
                  {/* Check if we have markdown content to render */}
                  {document.analysis_results.raw_output ? (
                    <div className="prose prose-sm max-w-none prose-headings:!text-black prose-p:!text-black prose-strong:!text-black prose-ul:!text-black prose-ol:!text-black prose-li:!text-black break-words">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Custom styling for headings
                          h1: ({ ...props }) => (
                            <h1
                              className="text-2xl font-bold text-blue-900 border-b-2 border-blue-200 pb-2 mb-4 break-words"
                              {...props}
                            />
                          ),
                          h2: ({ ...props }) => (
                            <h2
                              className="text-xl font-semibold !text-black mt-6 mb-3 break-words"
                              {...props}
                            />
                          ),
                          h3: ({ ...props }) => (
                            <h3
                              className="text-lg font-semibold !text-black mt-4 mb-2 break-words"
                              {...props}
                            />
                          ),
                          // Custom styling for paragraphs
                          p: ({ ...props }) => (
                            <p
                              className="!text-black leading-relaxed break-words mb-4"
                              {...props}
                            />
                          ),
                          // Custom styling for lists
                          ul: ({ ...props }) => (
                            <ul
                              className="space-y-2 my-4 break-words list-disc list-inside"
                              {...props}
                            />
                          ),
                          ol: ({ ...props }) => (
                            <ol
                              className="space-y-2 my-4 break-words list-decimal list-inside"
                              {...props}
                            />
                          ),
                          li: ({ ...props }) => (
                            <li
                              className="!text-black leading-relaxed break-words mb-2"
                              {...props}
                            />
                          ),
                          // Custom styling for strong/bold text
                          strong: ({ ...props }) => (
                            <strong
                              className="font-bold !text-black break-words"
                              {...props}
                            />
                          ),
                          // Custom styling for code blocks
                          code: ({ className, children, ...props }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code
                                className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono break-words"
                                {...props}
                              >
                                {children}
                              </code>
                            ) : (
                              <pre className="bg-gray-100 p-4 rounded-lg text-sm font-mono break-words whitespace-pre-wrap">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            );
                          },
                          // Custom styling for blockquotes
                          blockquote: ({ ...props }) => (
                            <blockquote
                              className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic break-words"
                              {...props}
                            />
                          ),
                          // Custom styling for tables
                          table: ({ ...props }) => (
                            <div className="overflow-x-auto max-w-full">
                              <table
                                className="w-full border-collapse border border-gray-300 table-auto"
                                {...props}
                              />
                            </div>
                          ),
                          th: ({ ...props }) => (
                            <th
                              className="border border-gray-300 px-2 py-2 bg-gray-100 font-semibold text-left break-words text-sm"
                              {...props}
                            />
                          ),
                          td: ({ ...props }) => (
                            <td
                              className="border border-gray-300 px-2 py-2 break-words text-sm"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {String(document.analysis_results.raw_output)}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    // Fallback to JSON display if no markdown content
                    <pre className="text-sm !text-black whitespace-pre-wrap break-words">
                      {JSON.stringify(document.analysis_results, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
