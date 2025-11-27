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
    const initAuth = () => {
      const savedToken = Cookies.get("auth_token");
      const savedUser = Cookies.get("user");

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Error parsing saved user:", error);
          Cookies.remove("auth_token");
          Cookies.remove("user");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      // Get CSRF token for login only
      await initializeCSRF();

      const response = await api.post("/api/trainee/login", credentials);
      const { token: authToken, user: userData } = response.data;

      setToken(authToken);
      setUser(userData);

      // Store in cookies
      Cookies.set("auth_token", authToken, {
        expires: 7,
        secure: false,
        sameSite: "lax",
      });
      Cookies.set("user", JSON.stringify(userData), {
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
      // Get CSRF token for login only
      await initializeCSRF();

      const response = await api.post("/api/admin/login", credentials);
      const { token: authToken, user: userData } = response.data;

      setToken(authToken);
      setUser(userData);

      // Store in cookies
      Cookies.set("auth_token", authToken, {
        expires: 7,
        secure: false,
        sameSite: "lax",
      });
      Cookies.set("user", JSON.stringify(userData), {
        expires: 7,
        secure: false,
        sameSite: "lax",
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    Cookies.remove("auth_token");
    Cookies.remove("user");
    window.location.href = "/login";
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
