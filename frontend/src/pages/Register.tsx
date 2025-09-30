import { Link } from "react-router";
import { Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { TextField } from "../components/auth/TextField";
import { PasswordField } from "../components/auth/PasswordField";
import { RoleSelect } from "../components/auth/RoleSelect";
import { useRegistrationForm } from "../hooks/useRegistrationForm";

const Register = () => {
  const { form, onSubmit, isSubmitting } = useRegistrationForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = form;

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
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <TextField
                id="firstName"
                label="First name"
                placeholder="First name"
                autoComplete="given-name"
                register={register}
                errors={errors}
              />
              <TextField
                id="lastName"
                label="Last name"
                placeholder="Last name"
                autoComplete="family-name"
                register={register}
                errors={errors}
              />
            </div>

            {/* Username */}
            <TextField
              id="username"
              label="Username"
              placeholder="Choose a username"
              autoComplete="username"
              register={register}
              errors={errors}
            />

            {/* Email */}
            <TextField
              id="email"
              label="Email address"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              register={register}
              errors={errors}
            />

            {/* Password */}
            <PasswordField
              id="password"
              label="Password"
              placeholder="Create a password"
              autoComplete="new-password"
              register={register}
              errors={errors}
              showStrength
              password={password}
            />

            {/* Confirm Password */}
            <PasswordField
              id="confirmPassword"
              label="Confirm password"
              placeholder="Confirm your password"
              autoComplete="new-password"
              register={register}
              errors={errors}
            />

            {/* Role Selection */}
            <RoleSelect register={register} errors={errors} />
          </div>

          <div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </div>
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