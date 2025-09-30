import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  type UseFormRegister,
  type FieldErrors,
  type FieldValues,
} from "react-hook-form";

interface TextFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  autoComplete?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<FieldValues | any>;
  errors: FieldErrors;
}

export const TextField = ({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  register,
  errors,
}: TextFieldProps) => {
  return (
    <div>
      <Label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`mt-1 ${
          errors[id]
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : ""
        }`}
        {...register(id)}
      />
      {errors[id] && (
        <p className="mt-1 text-sm text-red-600">
          {errors[id]?.message as string}
        </p>
      )}
    </div>
  );
};
