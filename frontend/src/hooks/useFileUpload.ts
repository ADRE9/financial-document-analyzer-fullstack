import { useState, useCallback } from "react";
import { toast } from "sonner";

export const useFileValidation = (maxSizeBytes: number) => {
  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type - only PDF allowed
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
      if (fileExtension !== ".pdf") {
        return "Only PDF files are allowed for security reasons";
      }

      // Check file size - strict limit
      if (file.size > maxSizeBytes) {
        const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
        return `File size exceeds ${maxSizeMB}MB limit. Please compress your PDF or split it into smaller files.`;
      }

      // Check minimum file size
      if (file.size < 100) {
        return "File is too small to be a valid PDF";
      }

      // Additional filename validation
      if (file.name.length > 255) {
        return "Filename is too long (maximum 255 characters)";
      }

      // Check for suspicious characters in filename
      // eslint-disable-next-line no-control-regex
      const suspiciousChars = /[<>:"|?*\x00-\x1f]/;
      if (suspiciousChars.test(file.name)) {
        return "Filename contains invalid characters";
      }

      return null;
    },
    [maxSizeBytes]
  );

  return { validateFile };
};

export const useFileDragAndDrop = (onFileSelect: (file: File) => void) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 1) {
        toast.error("Please select only one file at a time");
        return;
      }

      if (files.length === 1) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  return {
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};
