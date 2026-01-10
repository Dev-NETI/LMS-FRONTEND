"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { toast } from "react-toastify";
import Image from "next/image";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loginAdmin, isAuthenticated } = useAuth();
  const router = useRouter();
  const loginInProgress = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Only redirect on initial load if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: LoginFormData) => {
    if (loginInProgress.current) {
      console.log("Login already in progress, ignoring duplicate submission");
      return;
    }

    loginInProgress.current = true;
    setIsLoading(true);

    try {
      await loginAdmin(data);
      toast.success("Login successful! Welcome back.");
      // Use replace to avoid adding to history stack
      router.replace("/admin/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
      loginInProgress.current = false; // Reset in finally block
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Enhanced Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08),transparent_50%)]"></div>

        {/* Image with Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent">
          <Image
            src="/LMS.svg"
            alt="Login Background"
            fill
            className="object-cover opacity-90"
            priority
          />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-gray-50 to-gray-100/50">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="lg:hidden mx-auto w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Administrator Login
            </h1>
            <p className="text-gray-600">
              Secure access to the administrative dashboard
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200/50 backdrop-blur-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Email Address
                </label>
                <Input
                  {...register("email")}
                  type="email"
                  id="email"
                  placeholder="admin@example.com"
                  className="w-full h-12 px-4 text-base transition-all"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm font-medium flex items-center gap-1 animate-in slide-in-from-top-1">
                    <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                    onClick={() =>
                      toast.error("Password reset not implemented yet")
                    }
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    className="w-full h-12 px-4 pr-12 text-base transition-all"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm font-medium flex items-center gap-1 animate-in slide-in-from-top-1">
                    <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Learning Management System @ 2026
          </p>
        </div>
      </div>
    </div>
  );
}
