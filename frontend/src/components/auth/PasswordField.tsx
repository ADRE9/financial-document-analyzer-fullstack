import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  type UseFormRegister,
  type FieldErrors,
  type FieldValues,
} from "react-hook-form";

interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<FieldValues | any>;
  errors: FieldErrors;
  showStrength?: boolean;
  password?: string;
}

export const PasswordField = ({
  id,
  label,
  placeholder,
  autoComplete,
  register,
  errors,
  showStrength = false,
  password,
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <Label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </Label>
      <div className="mt-1 relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`pr-10 ${
            errors[id]
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : ""
          }`}
          {...register(id)}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      </div>
      {errors[id] && (
        <p className="mt-1 text-sm text-red-600">
          {errors[id]?.message as string}
        </p>
      )}
      {showStrength && password && !errors[id] && (
        <p className="mt-1 text-sm text-green-600">Password strength: Good</p>
      )}
    </div>
  );
};
