"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AcademicCapIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuth();
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
      router.replace("/dashboard");
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
      await login(data);
      toast.success("Login successful! Welcome back.");
      // Use replace to avoid adding to history stack
      router.replace("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
      loginInProgress.current = false; // Reset in finally block
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="lg:hidden mx-auto w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <AcademicCapIcon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Trainee Login
            </h1>
            <p className="text-gray-600 text-sm">
              Access your learning dashboard
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <Input
                  {...register("email")}
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    className="w-full h-11 px-3 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs mt-6">
            Learning Management System
          </p>
        </div>
      </div>
    </div>
  );
}
