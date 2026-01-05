"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowRightEndOnRectangleIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
} from "@heroicons/react/20/solid";
import NotificationBell from "@/src/components/trainee/NotificationBell";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <div className="hidden lg:flex flex-col">
            <h1 className="text-xl font-bold text-blue-600">NETI LMS</h1>
            <p className="text-xs text-gray-500 italic -mt-1">
              Learning Management System
            </p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Notifications - Only show for trainees */}
          {user?.user_type === "trainee" && <NotificationBell />}

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${user?.f_name}+${user?.l_name}&background=3B82F6&color=fff&size=32`}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">
                  {user?.f_name} {user?.l_name}
                </div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            </button>

            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.f_name} {user?.l_name}
                    </div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                  </div>

                  <div className="py-1">
                    <a
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <UserIcon className="w-4 h-4 mr-3 text-gray-400" />
                      Profile Settings
                    </a>
                    <a
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Cog6ToothIcon className="w-4 h-4 mr-3 text-gray-400" />
                      Preferences
                    </a>
                  </div>

                  <div className="border-t border-gray-200 py-1">
                    <button
                      onClick={logout}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <ArrowRightEndOnRectangleIcon className="w-4 h-4 mr-3 text-gray-400" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
