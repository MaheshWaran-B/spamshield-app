import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loginMutation = trpc.auth.login.useMutation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await loginMutation.mutateAsync({
        username,
        password,
      });

      toast.success("Login successful! Redirecting...");
      setTimeout(() => setLocation("/"), 1000);
    } catch (error: any) {
      const message = error?.message || "Login failed. Please check your credentials.";
      toast.error(message);
      setErrors({ password: message });
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
          <p className="text-gray-400">AI-Powered Spam Detection</p>
        </div>

        {/* Login Form */}
        <Card className="p-6 bg-slate-900 border-slate-700">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) {
                    setErrors({ ...errors, username: "" });
                  }
                }}
                className="bg-slate-800 border-slate-600 text-white placeholder-gray-500"
                disabled={loginMutation.isPending}
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors({ ...errors, password: "" });
                    }
                  }}
                  className="bg-slate-800 border-slate-600 text-white placeholder-gray-500 pr-10"
                  disabled={loginMutation.isPending}
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

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-lime-500 hover:bg-lime-600 text-black font-semibold mt-6"
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Signup Link */}
          <div className="text-center mt-4">
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => setLocation("/signup")}
                className="text-lime-400 hover:text-lime-300 font-medium"
              >
                Sign Up
              </button>
            </p>
          </div>
        </Card>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-xs text-gray-400 font-semibold mb-2">Demo Account:</p>
          <p className="text-xs text-gray-400">Username: <span className="text-lime-400">demo</span></p>
          <p className="text-xs text-gray-400">Password: <span className="text-lime-400">demo1234</span></p>
        </div>

        {/* Security Info */}
        <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-xs text-gray-400">
            ✓ Passwords are encrypted with bcrypt
          </p>
          <p className="text-xs text-gray-400 mt-1">
            ✓ All data is transmitted over HTTPS
          </p>
        </div>
      </div>
    </div>
  );
}
