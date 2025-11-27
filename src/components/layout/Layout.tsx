'use client';

import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
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
      <Header onToggleSidebar={toggleSidebar} />
      
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      {/* Main content area */}
      <main className="lg:ml-64 pt-16 transition-all duration-300 ease-in-out">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="min-h-[calc(100vh-10rem)]">
              {children}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="lg:ml-64 bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8 transition-all duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-sm text-gray-500">
            © 2025 LMS Portal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}