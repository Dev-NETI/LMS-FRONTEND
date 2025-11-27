"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  XMarkIcon,
  ChartBarIcon,
  UsersIcon,
  BookOpenIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CogIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  TrophyIcon,
  ChartPieIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: ChartBarIcon,
    current: false,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: ChartPieIcon,
    current: false,
  },
];

const userManagement = [
  {
    name: "All Users",
    href: "/admin/users",
    icon: UsersIcon,
    current: false,
  },
  {
    name: "Instructors",
    href: "/admin/instructors",
    icon: UserGroupIcon,
    current: false,
  },
  {
    name: "Students",
    href: "/admin/students",
    icon: AcademicCapIcon,
    current: false,
  },
  {
    name: "User Roles",
    href: "/admin/roles",
    icon: BuildingOfficeIcon,
    current: false,
  },
];

const courseManagement = [
  {
    name: "All Courses",
    href: "/admin/courses",
    icon: BookOpenIcon,
    current: false,
  },
  {
    name: "Course Categories",
    href: "/admin/categories",
    icon: ClipboardDocumentListIcon,
    current: false,
  },
  {
    name: "Assignments",
    href: "/admin/assignments",
    icon: DocumentTextIcon,
    current: false,
  },
  {
    name: "Certificates",
    href: "/admin/certificates",
    icon: TrophyIcon,
    current: false,
  },
];

const systemManagement = [
  {
    name: "Announcements",
    href: "/admin/announcements",
    icon: BellIcon,
    current: false,
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: DocumentDuplicateIcon,
    current: false,
  },
  {
    name: "Schedule",
    href: "/admin/schedule",
    icon: CalendarIcon,
    current: false,
  },
  {
    name: "System Logs",
    href: "/admin/logs",
    icon: ExclamationTriangleIcon,
    current: false,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: CogIcon,
    current: false,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  // Update current state based on pathname
  const updateNavigation = (navItems: typeof navigation) =>
    navItems.map((item) => ({
      ...item,
      current: pathname === item.href,
    }));

  const updatedNavigation = updateNavigation(navigation);
  const updatedUserManagement = updateNavigation(userManagement);
  const updatedCourseManagement = updateNavigation(courseManagement);
  const updatedSystemManagement = updateNavigation(systemManagement);

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div
        className={classNames(
          isOpen ? "fixed inset-0 z-40 lg:hidden" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={onClose}
        />
      </div>

      {/* Sidebar */}
      <div
        className={classNames(
          "fixed left-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:z-40 top-0 h-full lg:top-16 lg:h-[calc(100%-4rem)]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header - only show on mobile */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 lg:hidden">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Admin</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto lg:py-4">
            <div className="space-y-8">
              {/* Main Navigation */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Overview
                </h3>
                <div className="space-y-1">
                  {updatedNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={classNames(
                        item.current
                          ? "bg-blue-50 border-blue-500 text-blue-700 border-r-2"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors"
                      )}
                    >
                      <item.icon
                        className={classNames(
                          item.current
                            ? "text-blue-500"
                            : "text-gray-400 group-hover:text-gray-500",
                          "mr-3 h-5 w-5"
                        )}
                      />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* User Management */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  User Management
                </h3>
                <div className="space-y-1">
                  {updatedUserManagement.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={classNames(
                        item.current
                          ? "bg-blue-50 border-blue-500 text-blue-700 border-r-2"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors"
                      )}
                    >
                      <item.icon
                        className={classNames(
                          item.current
                            ? "text-blue-500"
                            : "text-gray-400 group-hover:text-gray-500",
                          "mr-3 h-5 w-5"
                        )}
                      />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Course Management */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Course Management
                </h3>
                <div className="space-y-1">
                  {updatedCourseManagement.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={classNames(
                        item.current
                          ? "bg-blue-50 border-blue-500 text-blue-700 border-r-2"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors"
                      )}
                    >
                      <item.icon
                        className={classNames(
                          item.current
                            ? "text-blue-500"
                            : "text-gray-400 group-hover:text-gray-500",
                          "mr-3 h-5 w-5"
                        )}
                      />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* System Management */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  System Management
                </h3>
                <div className="space-y-1">
                  {updatedSystemManagement.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={classNames(
                        item.current
                          ? "bg-blue-50 border-blue-500 text-blue-700 border-r-2"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors"
                      )}
                    >
                      <item.icon
                        className={classNames(
                          item.current
                            ? "text-blue-500"
                            : "text-gray-400 group-hover:text-gray-500",
                          "mr-3 h-5 w-5"
                        )}
                      />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              Admin Portal v2.1.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
