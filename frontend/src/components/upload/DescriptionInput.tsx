import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const DescriptionInput = ({
  value,
  onChange,
  disabled = false,
}: DescriptionInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">Description (Optional)</Label>
      <Input
        id="description"
        placeholder="Brief description..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
};
