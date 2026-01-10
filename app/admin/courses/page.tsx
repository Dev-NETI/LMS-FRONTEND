"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/src/components/admin/AdminLayout";
import AuthGuard from "@/src/components/auth/AuthGuard";
import { Button } from "@/src/components/ui/button";
import {
  getAllCourses,
  AdminCourse,
  PaginationParams,
  PaginationMeta,
} from "@/src/services/courseService";
import {
  CourseGridSkeleton,
  StatsCardSkeleton,
} from "@/src/components/ui/course-skeleton";
import { Skeleton } from "@/src/components/ui/skeleton";
import { toast } from "react-toastify";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Handle manual search
  const handleSearch = () => {
    setIsSearching(true);
    setDebouncedSearchQuery(searchQuery);
    setCurrentPage(1);
  };

  // Handle Enter key press in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setCurrentPage(1);
  };

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params: PaginationParams = {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearchQuery || undefined,
        };

        const response = await getAllCourses(params);

        console.log(response);

        if (response.success) {
          setCourses(response.data);
          setPagination(response.pagination);
        } else {
          setError(response.message || "Failed to fetch courses");
          toast.error(response.message || "Failed to fetch courses");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An error occurred while fetching courses";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Error fetching courses:", err);
      } finally {
        setIsLoading(false);
        setIsSearching(false);
      }
    };

    fetchCourses();
  }, [currentPage, itemsPerPage, debouncedSearchQuery]);

  // Show loading state
  if (isLoading) {
    return (
      <AuthGuard>
        <AdminLayout>
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-96" />
              </div>
            </div>

            {/* Stats Cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCardSkeleton />
              <div className="hidden md:block">
                <StatsCardSkeleton />
              </div>
              <div className="hidden md:block">
                <StatsCardSkeleton />
              </div>
              <div className="hidden md:block">
                <StatsCardSkeleton />
              </div>
            </div>

            {/* Search and Filters skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1">
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="mt-4">
                <Skeleton className="h-4 w-64" />
              </div>
            </div>

            {/* Courses Grid skeleton */}
            <CourseGridSkeleton count={9} />

            {/* Pagination skeleton */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
              <div className="flex flex-1 justify-between sm:hidden">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-16" />
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <Skeleton className="h-4 w-48" />
                <div className="flex gap-1">
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  // Show error state
  if (error) {
    return (
      <AuthGuard>
        <AdminLayout>
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 text-red-500 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load courses
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Course Management
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage your courses, track performance, and organize
                content
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search */}
              <div className="flex-1 flex gap-3">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses, descriptions, and course types..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="w-4 h-4" />
                      Search
                    </>
                  )}
                </Button>
                {(searchQuery || debouncedSearchQuery) && (
                  <Button
                    onClick={clearSearch}
                    variant="outline"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-gray-600">
              {pagination ? (
                <>
                  Showing {courses.length} of {pagination.totalItems} courses
                  (Page {pagination.currentPage} of {pagination.totalPages})
                </>
              ) : (
                <>Loading...</>
              )}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.courseid}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <BookOpenIcon className="w-16 h-16 text-white opacity-80" />
                  </div>
                  <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium text-gray-800">
                      {course?.coursecode}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3
                      className="text-lg font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() =>
                        router.push(`/admin/courses/${course.courseid}`)
                      }
                    >
                      {course.coursename}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          router.push(`/admin/courses/${course.courseid}`)
                        }
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    Course Type: {""}
                    {course?.coursetype.coursetype ||
                      "No Course Type available"}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {course?.modeofdelivery?.modeofdelivery ||
                      "No description available"}
                  </p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {course.coursedescription || "No description available"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(pagination.currentPage - 1) * pagination.itemsPerPage +
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
                    <span className="font-medium">{pagination.totalItems}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPreviousPage}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Page numbers */}
                    {(() => {
                      const totalPages = pagination.totalPages;
                      const current = pagination.currentPage;
                      const pages = [];

                      let startPage = Math.max(1, current - 2);
                      let endPage = Math.min(totalPages, current + 2);

                      // Adjust range to show 5 pages when possible
                      if (endPage - startPage < 4) {
                        if (startPage === 1) {
                          endPage = Math.min(totalPages, startPage + 4);
                        } else {
                          startPage = Math.max(1, endPage - 4);
                        }
                      }

                      for (let i = startPage; i <= endPage; i++) {
                        const isActive = i === current;
                        pages.push(
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              isActive
                                ? "bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }

                      return pages;
                    })()}

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {courses.length === 0 && !isLoading && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Get started by creating your first course"}
              </p>
              {!searchQuery && (
                <p className="text-gray-500">
                  No courses available at the moment.
                </p>
              )}
            </div>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
