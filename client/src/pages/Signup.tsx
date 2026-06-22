import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const signupMutation = trpc.auth.signup.useMutation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (username.length > 64) {
      newErrors.username = "Username must be less than 64 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await signupMutation.mutateAsync({
        username,
        password,
      });

      toast.success("Account created successfully! Redirecting to login...");
      setTimeout(() => setLocation("/login"), 1500);
    } catch (error: any) {
      const message = error?.message || "Signup failed. Please try again.";
      toast.error(message);
      if (message.includes("already exists")) {
        setErrors({ username: "Username already taken" });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-lime-400" />
            <h1 className="text-3xl font-bold text-white">SpamShield</h1>
          </div>
          <p className="text-gray-400">Create your account</p>
        </div>

        {/* Signup Form */}
        <Card className="p-6 bg-slate-900 border-slate-700">
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <Input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) {
                    setErrors({ ...errors, username: "" });
                  }
                }}
                className="bg-slate-800 border-slate-600 text-white placeholder-gray-500"
                disabled={signupMutation.isPending}
              />
              {errors.username && (
                <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.username}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password (min 8 characters)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors({ ...errors, password: "" });
                    }
                  }}
                  className="bg-slate-800 border-slate-600 text-white placeholder-gray-500 pr-10"
                  disabled={signupMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: "" });
                    }
                  }}
                  className="bg-slate-800 border-slate-600 text-white placeholder-gray-500 pr-10"
                  disabled={signupMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {/* Signup Button */}
            <Button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full bg-lime-500 hover:bg-lime-600 text-black font-semibold mt-6"
            >
              {signupMutation.isPending ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-4">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <button
                onClick={() => setLocation("/login")}
                className="text-lime-400 hover:text-lime-300 font-medium"
              >
                Login
              </button>
            </p>
          </div>
        </Card>

        {/* Info */}
        <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-xs text-gray-400">
            ✓ Your data is encrypted and stored securely
          </p>
          <p className="text-xs text-gray-400 mt-1">
            ✓ Passwords are hashed with bcrypt
          </p>
        </div>
      </div>
    </div>
  );
}
