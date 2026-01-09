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
  UserGroupIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  FolderOpenIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

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
];

const userManagement = [
  {
    name: "All Users",
    href: "/admin/user-management/all-users",
    icon: UsersIcon,
    current: false,
  },
  {
    name: "Instructors",
    href: "/admin/user-management/instructor",
    icon: UserGroupIcon,
    current: false,
  },
  {
    name: "Trainees",
    href: "/admin/trainees",
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
];

const documentManagement = [
  {
    name: "Documents",
    href: "/admin/documents",
    icon: FolderOpenIcon,
    current: false,
  },
  {
    name: "Tutorials",
    href: "/admin/tutorials",
    icon: PlayCircleIcon,
    current: false,
  },
];

const systemManagement = [
  {
    name: "Assessment Logs",
    href: "/admin/assessment_logs",
    icon: ExclamationTriangleIcon,
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
  const updatedDocumentManagement = updateNavigation(documentManagement);

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div
        className={classNames(
          isOpen ? "fixed inset-0 z-40 lg:hidden" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
      </div>

      {/* Sidebar */}
      <div
        className={classNames(
          "fixed left-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed top-0 h-full",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header - only show on mobile */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 lg:hidden">
            <div className="flex items-center space-x-2">
              <Image
                src="/LMS_ICON.svg"
                alt="Logo"
                width={200}
                height={100}
                className=""
                priority
              />
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
            <div className="hidden lg:flex flex-col">
              <Image
                src="/LMS_ICON.svg"
                alt="Logo"
                width={200}
                height={100}
                className=""
                priority
              />
              {/* <h1 className="text-xl font-bold text-blue-600">NETI LMS</h1>
              <p className="text-xs text-gray-500 italic -mt-1">
                Learning Management System
              </p> */}
            </div>
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

              {/* Document Management */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Document Management
                </h3>
                <div className="space-y-1">
                  {updatedDocumentManagement.map((item) => (
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
