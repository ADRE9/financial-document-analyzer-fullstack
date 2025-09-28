import { DocumentType } from "../../types/api";

export const getDocumentTypeLabel = (type: DocumentType): string => {
  switch (type) {
    case DocumentType.INVOICE:
      return "Invoice";
    case DocumentType.RECEIPT:
      return "Receipt";
    case DocumentType.STATEMENT:
      return "Statement";
    case DocumentType.CONTRACT:
      return "Contract";
    case DocumentType.OTHER:
      return "Other";
    default:
      return "Unknown";
  }
};

export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid date";
  }
};
