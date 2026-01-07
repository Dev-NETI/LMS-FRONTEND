"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  CogIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface InstructorHeaderProps {
  onToggleSidebar: () => void;
}

export default function InstructorHeader({
  onToggleSidebar,
}: InstructorHeaderProps) {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout("instructor");
      toast.success("Logged out successfully");
      // No need to manually redirect as logout function handles it
    } catch (error) {
      toast.error("Logout failed");
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-blue-900 shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-30 lg:left-64">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Sidebar Toggle */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            onClick={onToggleSidebar}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-500">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 bg-red-400 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-400 hover:text-gray-500">
            <CogIcon className="h-6 w-6" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white">
                  {user?.name ||
                    `${user?.f_name || ""} ${user?.l_name || ""}`.trim()}
                </p>
                <p className="text-xs text-gray-400">Instructor</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100"
                >
                  <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <ChevronDownIcon className="hidden sm:block h-4 w-4 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="text-sm font-medium text-gray-900">
                          {user?.name ||
                            `${user?.f_name || ""} ${
                              user?.l_name || ""
                            }`.trim()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user?.email}
                        </div>
                      </div>
                      <div className="py-1">
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <UserIcon className="h-4 w-4 mr-3" />
                          Profile
                        </a>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <CogIcon className="h-4 w-4 mr-3" />
                          Settings
                        </a>
                        <div className="border-t border-gray-200 mt-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
