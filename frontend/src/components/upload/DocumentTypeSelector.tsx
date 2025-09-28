import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DocumentType } from "../../types/api";

interface DocumentTypeSelectorProps {
  value: DocumentType;
  onChange: (value: DocumentType) => void;
  disabled?: boolean;
}

export const DocumentTypeSelector = ({
  value,
  onChange,
  disabled = false,
}: DocumentTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="document-type">Document Type</Label>
      <Select
        value={value}
        onValueChange={(value) => onChange(value as DocumentType)}
        disabled={disabled}
      >
        <SelectTrigger id="document-type">
          <SelectValue placeholder="Select document type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={DocumentType.INVOICE}>Invoice</SelectItem>
          <SelectItem value={DocumentType.RECEIPT}>Receipt</SelectItem>
          <SelectItem value={DocumentType.STATEMENT}>Statement</SelectItem>
          <SelectItem value={DocumentType.CONTRACT}>Contract</SelectItem>
          <SelectItem value={DocumentType.OTHER}>Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
