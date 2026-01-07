"use client";

import React, { useState } from "react";
import AuthGuard from "@/src/components/auth/AuthGuard";
import InsturctorLayout from "@/src/components/instructor/InstructorLayout";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  UsersIcon,
  BookOpenIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  FolderIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

// ===== SAMPLE DATA - REPLACE WITH API CALLS =====
const SAMPLE_CLASSES = [
  {
    id: 1,
    title: "Web Development Fundamentals",
    description:
      "Learn HTML, CSS, JavaScript and modern web development practices",
    studentCount: 28,
    lessonsCount: 12,
    schedule: "Mon, Wed, Fri - 9:00 AM",
    color: "bg-blue-500",
    coverImage: "/api/placeholder/400/200",
    progress: 75,
    nextClass: "2024-01-15T09:00:00",
    status: "active",
  },
  {
    id: 2,
    title: "React & Modern JavaScript",
    description:
      "Advanced React concepts, hooks, state management, and component architecture",
    studentCount: 22,
    lessonsCount: 16,
    schedule: "Tue, Thu - 2:00 PM",
    color: "bg-green-500",
    coverImage: "/api/placeholder/400/200",
    progress: 60,
    nextClass: "2024-01-16T14:00:00",
    status: "active",
  },
  {
    id: 3,
    title: "Database Design & SQL",
    description:
      "Relational database concepts, SQL queries, and database optimization",
    studentCount: 19,
    lessonsCount: 10,
    schedule: "Wed - 10:00 AM",
    color: "bg-purple-500",
    coverImage: "/api/placeholder/400/200",
    progress: 40,
    nextClass: "2024-01-17T10:00:00",
    status: "active",
  },
  {
    id: 4,
    title: "Python for Beginners",
    description:
      "Introduction to Python programming language and basic programming concepts",
    studentCount: 35,
    lessonsCount: 8,
    schedule: "Mon, Wed - 3:00 PM",
    color: "bg-orange-500",
    coverImage: "/api/placeholder/400/200",
    progress: 90,
    nextClass: "2024-01-15T15:00:00",
    status: "completed",
  },
];

export default function MyClassPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "completed"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredClasses = SAMPLE_CLASSES.filter((classItem) => {
    const matchesSearch =
      classItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || classItem.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const formatNextClass = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 1) return `In ${diffDays} days`;
    return "Past due";
  };

  return (
    <AuthGuard>
      <InsturctorLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    My Classes
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage your courses and track student progress
                  </p>
                </div>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create Class
                </button>
              </div>

              {/* Search and Filters */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search classes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setFilterStatus("all")}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        filterStatus === "all"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterStatus("active")}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        filterStatus === "active"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setFilterStatus("completed")}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        filterStatus === "completed"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Completed
                    </button>
                  </div>

                  {/* View Toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === "grid"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                      </div>
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === "list"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <div className="w-4 h-4 flex flex-col gap-1">
                        <div className="h-0.5 bg-current rounded"></div>
                        <div className="h-0.5 bg-current rounded"></div>
                        <div className="h-0.5 bg-current rounded"></div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Classes Grid/List */}
            {filteredClasses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No classes found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filters."
                    : "Get started by creating your first class."}
                </p>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create Your First Class
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group cursor-pointer overflow-hidden ${
                      viewMode === "list" ? "flex" : ""
                    }`}
                  >
                    {/* Class Header/Cover */}
                    <div
                      className={`${classItem.color} ${
                        viewMode === "grid" ? "h-32" : "w-48"
                      } relative flex-shrink-0`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/30"></div>
                      <div className="absolute top-4 right-4">
                        <button className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                          <EllipsisVerticalIcon className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center gap-2">
                          <FolderIcon className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            {classItem.lessonsCount} lessons
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Class Content */}
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {classItem.title}
                        </h3>
                        {classItem.status === "completed" && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                            Completed
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {classItem.description}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <UsersIcon className="w-4 h-4 mr-2" />
                          <span>{classItem.studentCount} students</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <ClockIcon className="w-4 h-4 mr-2" />
                          <span>{formatNextClass(classItem.nextClass)}</span>
                        </div>
                      </div>

                      {/* Schedule */}
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        <span>{classItem.schedule}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium text-gray-900">
                            {classItem.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              classItem.progress >= 80
                                ? "bg-green-500"
                                : classItem.progress >= 50
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${classItem.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                          View Class
                        </button>
                        <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </InsturctorLayout>
    </AuthGuard>
  );
}
