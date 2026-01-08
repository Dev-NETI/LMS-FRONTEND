"use client";

import React, { useState, useEffect } from "react";
import AuthGuard from "@/src/components/auth/AuthGuard";
import InsturctorLayout from "@/src/components/instructor/InstructorLayout";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  BookOpenIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  FolderIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import {
  getInstructorSchedules,
  type CourseSchedule,
  type PaginationMeta,
} from "@/src/services/scheduleService";

export default function MyClassPage() {
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "completed"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchSchedules();
  }, [currentPage, itemsPerPage, searchTerm]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getInstructorSchedules({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
      });

      if (response.success) {
        setSchedules(response.data);
        console.log(response.data);
        setPagination(response.pagination || null);
      } else {
        setError("Failed to fetch schedules");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load schedules");
      console.error("Error fetching schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  const getClassStatus = (schedule: CourseSchedule) => {
    const now = new Date();
    const endDate = new Date(schedule.enddateformat);
    return endDate < now ? "completed" : "active";
  };

  const filteredClasses = schedules.filter((schedule) => {
    const status = getClassStatus(schedule);
    const matchesFilter = filterStatus === "all" || status === filterStatus;
    return matchesFilter;
  });

  const formatScheduleDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (now < start) {
      const diffTime = start.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "Starts Today";
      if (diffDays === 1) return "Starts Tomorrow";
      return `Starts in ${diffDays} days`;
    } else if (now >= start && now <= end) {
      return "Ongoing";
    } else {
      return "Completed";
    }
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

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Loading classes...
                </h3>
                <p className="text-gray-600">
                  Please wait while we fetch your schedule data.
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Error loading classes
                </h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={fetchSchedules}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No classes found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filters."
                    : "No classes have been assigned to you yet."}
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredClasses.map((schedule) => {
                  const classStatus = getClassStatus(schedule);
                  const scheduleInfo = formatScheduleDate(
                    schedule.startdateformat,
                    schedule.enddateformat
                  );

                  return (
                    <div
                      key={schedule.scheduleid}
                      className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group cursor-pointer overflow-hidden ${
                        viewMode === "list" ? "flex" : ""
                      }`}
                    >
                      {/* Class Header/Cover */}
                      <div
                        className={`bg-gradient-to-br from-blue-500 to-blue-700 ${
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
                              Batch {schedule.batchno}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Class Content */}
                      <div className="p-6 flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {schedule.course?.coursename || "Course Name"}
                          </h3>
                          {classStatus === "completed" && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                              Completed
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
                            <span>
                              {schedule.modeofdelivery || "Not Specified"}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <ClockIcon className="w-4 h-4 mr-2" />
                            <span>{scheduleInfo}</span>
                          </div>
                        </div>

                        {/* Schedule */}
                        <div className="flex items-center text-sm text-gray-600 mb-4">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          <span>
                            {new Date(
                              schedule.startdateformat
                            ).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}{" "}
                            -{" "}
                            {new Date(
                              schedule.enddateformat
                            ).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">
                              Enrolled Trainees
                            </span>
                            <span className="font-medium text-gray-900">
                              {schedule.active_enrolled || 0} /{" "}
                              {schedule.course?.maximumtrainees || 0}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300 bg-blue-500"
                              style={{
                                width: `${
                                  schedule.course?.maximumtrainees
                                    ? ((schedule.active_enrolled || 0) /
                                        schedule.course.maximumtrainees) *
                                      100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              (window.location.href = `/instructor/my-class/schedule/${schedule.scheduleid}`)
                            }
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            View Class
                          </button>
                          <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                            Manage
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={!pagination.hasPreviousPage}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(
                        Math.min(pagination.totalPages, currentPage + 1)
                      )
                    }
                    disabled={!pagination.hasNextPage}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(pagination.currentPage - 1) *
                          pagination.itemsPerPage +
                          1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          pagination.currentPage * pagination.itemsPerPage,
                          pagination.totalItems
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {pagination.totalItems}
                      </span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={!pagination.hasPreviousPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {(() => {
                        const maxPageButtons = 5;
                        const totalPages = pagination.totalPages;
                        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
                        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

                        // Adjust start page if we're near the end
                        if (endPage - startPage < maxPageButtons - 1) {
                          startPage = Math.max(1, endPage - maxPageButtons + 1);
                        }

                        const pages = [];
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === i
                                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                        return pages;
                      })()}
                      <button
                        onClick={() =>
                          setCurrentPage(
                            Math.min(pagination.totalPages, currentPage + 1)
                          )
                        }
                        disabled={!pagination.hasNextPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </InsturctorLayout>
    </AuthGuard>
  );
}
