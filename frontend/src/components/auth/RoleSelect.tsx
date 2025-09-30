import { Label } from "../ui/label";
import {
  type UseFormRegister,
  type FieldErrors,
  type FieldValues,
} from "react-hook-form";
import { UserRole } from "../../types/api";

interface RoleSelectProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<FieldValues | any>;
  errors: FieldErrors;
}

export const RoleSelect = ({ register, errors }: RoleSelectProps) => {
  return (
    <div>
      <Label htmlFor="role" className="block text-sm font-medium text-gray-700">
        Account Type
      </Label>
      <select
        id="role"
        className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
          errors.role
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : ""
        }`}
        {...register("role")}
      >
        <option value="">Select account type (optional)</option>
        <option value={UserRole.VIEWER}>
          Viewer - View documents and analysis
        </option>
        <option value={UserRole.ADMIN}>
          Administrator - Full system access
        </option>
      </select>
      {errors.role && (
        <p className="mt-1 text-sm text-red-600">
          {errors.role?.message as string}
        </p>
      )}
      <p className="mt-1 text-xs text-gray-500">
        If not selected, your account will default to Viewer access.
      </p>
    </div>
  );
};
