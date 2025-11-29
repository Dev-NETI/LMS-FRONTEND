"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import api, { initializeCSRF } from "@/lib/api";
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
            const meEndpoint =
              userType === "admin" ? "/api/admin/me" : "/api/trainee/me";

            const response = await api.get(meEndpoint);
            // Update user data with response to ensure it's fresh
            setUser({ ...userData, ...response.data.user });
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
      const response = await api.post("/api/trainee/login", credentials);
      const { token: authToken, user: userData } = response.data;

      // Add user_type to distinguish trainee from admin
      const userWithType = { ...userData, user_type: "trainee" as const };

      setToken(authToken);
      setUser(userWithType);

      // Store token and user in cookies
      Cookies.set("auth_token", authToken, {
        expires: 7,
        secure: false,
        sameSite: "lax",
      });
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
      const response = await api.post("/api/admin/login", credentials);
      const { token: authToken, user: userData } = response.data;

      // Add user_type to distinguish admin from trainee
      const userWithType = { ...userData, user_type: "admin" as const };

      setToken(authToken);
      setUser(userWithType);

      // Store token and user in cookies
      Cookies.set("auth_token", authToken, {
        expires: 7,
        secure: false,
        sameSite: "lax",
      });
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

      // Determine logout endpoint based on user type
      if (effectiveUserType === "admin") {
        await api.post("/api/admin/logout");
      } else if (effectiveUserType === "trainee") {
        await api.post("/api/trainee/logout");
      } else {
        // Fallback: try both endpoints if user type is unknown
        try {
          await api.post("/api/admin/logout");
        } catch (adminError) {
          try {
            await api.post("/api/trainee/logout");
          } catch (traineeError) {
            console.log(
              "Logout from both endpoints failed, proceeding with client-side cleanup"
            );
          }
        }
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setUser(null);
      setToken(null);
      Cookies.remove("auth_token");
      Cookies.remove("user");

      // Redirect based on current path, provided userType, or detected user type
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
    isAuthenticated: !!user && !!token,
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
