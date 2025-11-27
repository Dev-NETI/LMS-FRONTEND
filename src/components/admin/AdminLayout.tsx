"use client";

import React, { useState } from "react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <AdminHeader onToggleSidebar={toggleSidebar} />

      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main content area */}
      <main className="lg:ml-64 pt-16 transition-all duration-300 ease-in-out">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="min-h-[calc(100vh-10rem)]">{children}</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="lg:ml-64 bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8 transition-all duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>© 2025 LMS Admin Portal. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
              <a href="#" className="hover:text-gray-700 transition-colors">
                Support
              </a>
              <a href="#" className="hover:text-gray-700 transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-gray-700 transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
