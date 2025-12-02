"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { authService } from "@/services/authService";
import { User, LoginCredentials, AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = Cookies.get("auth_token");
        const savedUser = Cookies.get("user");

        if (savedToken && savedUser) {
          try {
            setToken(savedToken);
            const userData = JSON.parse(savedUser);

            // Verify the token is still valid by calling /me endpoint
            const userType = userData.user_type;

            if (userType === "admin") {
              const response = await authService.getAdminUser();
              setUser({ ...userData, ...response.user });
            } else if (userType === "trainee") {
              const response = await authService.getTraineeUser();
              setUser({ ...userData, ...response.user });
            }
          } catch (verifyError) {
            console.log("Token validation failed, clearing stored data");
            Cookies.remove("auth_token");
            Cookies.remove("user");
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.loginTrainee(
        credentials.email,
        credentials.password
      );
      const { token: authToken, user: userData } = response;

      // Add user_type to distinguish trainee from admin
      const userWithType = { ...userData, user_type: "trainee" as const };

      setToken(authToken);
      setUser(userWithType);

      // Store user data (token already stored by authService)
      Cookies.set("user", JSON.stringify(userWithType), {
        expires: 7,
        secure: false,
        sameSite: "lax",
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const loginAdmin = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.loginAdmin(
        credentials.email,
        credentials.password
      );
      const { user: userData } = response;

      // Add user_type to distinguish admin from trainee
      const userWithType = { ...userData, user_type: "admin" as const };
      setUser(userWithType);

      // Store user data (session handled by Laravel)
      Cookies.set("user", JSON.stringify(userWithType), {
        expires: 7,
        secure: false,
        sameSite: "lax",
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const logout = async (userType?: "admin" | "trainee") => {
    try {
      // Use provided userType or detect from current user
      const effectiveUserType = userType || user?.user_type;

      // Call appropriate logout endpoint
      if (effectiveUserType === "admin") {
        await authService.logoutAdmin();
      } else if (effectiveUserType === "trainee") {
        await authService.logoutTrainee();
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setUser(null);
      setToken(null);
      Cookies.remove("user");

      // Redirect based on current path or user type
      const currentPath = window.location.pathname;
      const effectiveUserType = userType || user?.user_type;

      if (currentPath.startsWith("/admin") || effectiveUserType === "admin") {
        window.location.href = "/admin/auth/login";
      } else {
        window.location.href = "/login";
      }
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    loginAdmin,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
