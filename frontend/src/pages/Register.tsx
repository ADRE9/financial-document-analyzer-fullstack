import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useRegister } from "../hooks/useAuth";
import { useAuth } from "../hooks/useAuthContext";

// Validation schema
const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be less than 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name must be less than 50 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name must be less than 50 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Focus on username field on mount
  useEffect(() => {
    setFocus("username");
  }, [setFocus]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword: _, ...registerData } = data;
      await registerMutation.mutateAsync(registerData);
      toast.success(
        "Registration successful! Welcome to Financial Document Analyzer!"
      );
      navigate("/home", { replace: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      toast.error(errorMessage);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const password = watch("password");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="First name"
                  className={`mt-1 ${
                    errors.firstName
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Last name"
                  className={`mt-1 ${
                    errors.lastName
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="Choose a username"
                className={`mt-1 ${
                  errors.username
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                {...register("username")}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                className={`mt-1 ${
                  errors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  className={`pr-10 ${
                    errors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
              {password && !errors.password && (
                <p className="mt-1 text-sm text-green-600">
                  Password strength: Good
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm password
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  className={`pr-10 ${
                    errors.confirmPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={toggleConfirmPasswordVisibility}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isSubmitting || registerMutation.isPending}
              className="w-full flex justify-center items-center"
            >
              {isSubmitting || registerMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </div>

          {registerMutation.error && (
            <div className="text-center">
              <p className="text-sm text-red-600">
                {registerMutation.error.message ||
                  "An error occurred during registration"}
              </p>
            </div>
          )}
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
