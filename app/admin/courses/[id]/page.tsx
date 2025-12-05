"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/src/components/admin/AdminLayout";
import AuthGuard from "@/src/components/auth/AuthGuard";
import { Button } from "@/src/components/ui/button";
import { getCourseById, AdminCourse } from "@/src/services/courseService";
import toast from "react-hot-toast";
import { ArrowLeftIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Skeleton } from "@mui/material";
import { Course } from "@/src/components/admin/course/types";
import CourseSchedulePage from "@/src/components/admin/course/CourseSchedule";
import CourseContentPage from "@/src/components/admin/course/CourseContent";
import CourseTrainingMaterials from "@/src/components/admin/course/CourseTrainingMaterials";
import {
  CourseSchedule,
  getCourseSchedule,
} from "@/src/services/scheduleService";
import CourseDetailsTable from "@/src/components/admin/course/CourseDetailsTable";
import QuestionBank from "@/src/components/admin/course/QuestionBank";

// Transform backend course data to frontend format
const transformCourseData = (backendCourse: AdminCourse): Course => {
  return {
    ...backendCourse,
    id: backendCourse.courseid,
    title: backendCourse.coursename,
    description: backendCourse.coursedescription || "No description available",
    instructor: "TBD",
    duration: "TBD",
    level: "Beginner",
    category: backendCourse.coursecategory || "General",
    thumbnail: "/images/default-course.jpg",
    createdAt: backendCourse.coursecreationdate,
    updatedAt: backendCourse.courseupdateddate,
    status: "Published",
  };
};

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [schedule, setSchedule] = useState<CourseSchedule[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "content" | "schedule" | "materials" | "assessment"
  >("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!params.id) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch course details
        const courseResponse = await getCourseById(Number(params.id));

        if (courseResponse.success) {
          const transformedCourse = transformCourseData(courseResponse.data);
          setCourse(transformedCourse);
        } else {
          setError(courseResponse.message || "Failed to fetch course");
          toast.error(courseResponse.message || "Failed to fetch course");
        }

        // Fetch course schedule
        try {
          setIsScheduleLoading(true);
          const scheduleResponse = await getCourseSchedule(Number(params.id));
          if (scheduleResponse.success) {
            setSchedule(scheduleResponse.data);
          }
        } catch (scheduleError) {
          console.warn("Failed to fetch course schedule:", scheduleError);
          // Don't show error for schedule as it's optional
        } finally {
          setIsScheduleLoading(false);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An error occurred while fetching course";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Error fetching course:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [params.id]);

  if (isLoading) {
    return (
      <AuthGuard>
        <AdminLayout>
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton variant="circular" width={32} height={32} />
                <div>
                  <Skeleton
                    variant="text"
                    width={256}
                    height={32}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton variant="text" width={192} height={16} />
                </div>
              </div>
            </div>

            {/* Navigation Tabs skeleton */}
            <div className="bg-white border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <Skeleton variant="rectangular" width={96} height={48} />
                <Skeleton variant="rectangular" width={80} height={48} />
                <Skeleton variant="rectangular" width={112} height={48} />
              </nav>
            </div>

            {/* Content skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-6">
                {/* Overview content skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Skeleton variant="text" width={128} height={24} />
                    <div className="space-y-2">
                      <Skeleton variant="text" width="100%" height={16} />
                      <Skeleton variant="text" width="100%" height={16} />
                      <Skeleton variant="text" width="75%" height={16} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Skeleton variant="text" width={112} height={24} />
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Skeleton variant="text" width={80} height={16} />
                        <Skeleton variant="text" width={64} height={16} />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton variant="text" width={96} height={16} />
                        <Skeleton variant="text" width={80} height={16} />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton variant="text" width={64} height={16} />
                        <Skeleton variant="text" width={48} height={16} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center">
                        <Skeleton variant="rounded" width={32} height={32} />
                        <div className="ml-3 flex-1">
                          <Skeleton
                            variant="text"
                            width={64}
                            height={12}
                            sx={{ mb: 0.5 }}
                          />
                          <Skeleton variant="text" width={48} height={24} />
                        </div>
                      </div>
                    </div>
                  ))}
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
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load course
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/admin/courses")}
              >
                Back to Courses
              </Button>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  if (!course) {
    return (
      <AuthGuard>
        <AdminLayout>
          <div className="text-center py-12">
            <XCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Course not found
            </h2>
            <p className="text-gray-600 mb-4">
              The course you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.push("/admin/courses")}>
              Back to Courses
            </Button>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/courses")}
                className="flex items-center"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Courses
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {course.title}
                </h1>
                <p className="text-gray-600 mt-1">
                  Course Details and Management
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>

              <button
                onClick={() => setActiveTab("content")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "content"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Content & Syllabus
              </button>

              <button
                onClick={() => setActiveTab("materials")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "materials"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Training Materials
              </button>

              <button
                onClick={() => setActiveTab("assessment")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "assessment"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Question Bank
              </button>

              <button
                onClick={() => setActiveTab("schedule")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "schedule"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Schedule ({schedule.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <CourseDetailsTable courseId={course.id} />
          )}

          {activeTab === "content" && <CourseContentPage course={course} />}

          {activeTab === "materials" && (
            <CourseTrainingMaterials courseId={course.id} />
          )}

          {activeTab === "schedule" &&
            (isScheduleLoading ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <Skeleton
                    variant="text"
                    width={192}
                    height={24}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton variant="text" width={288} height={16} />
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <th key={index} className="px-6 py-3">
                            <Skeleton variant="text" width={80} height={16} />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.from({ length: 5 }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                          {Array.from({ length: 6 }).map((_, colIndex) => (
                            <td key={colIndex} className="px-6 py-4">
                              {colIndex === 0 ? (
                                <div className="flex items-center">
                                  <Skeleton
                                    variant="rounded"
                                    width={32}
                                    height={32}
                                    sx={{ mr: 2 }}
                                  />
                                  <Skeleton
                                    variant="text"
                                    width={96}
                                    height={16}
                                  />
                                </div>
                              ) : colIndex === 4 ? (
                                <div>
                                  <div className="flex items-center mb-1">
                                    <Skeleton
                                      variant="circular"
                                      width={16}
                                      height={16}
                                      sx={{ mr: 0.5 }}
                                    />
                                    <Skeleton
                                      variant="text"
                                      width={32}
                                      height={16}
                                    />
                                    <Skeleton
                                      variant="text"
                                      width={32}
                                      height={16}
                                      sx={{ ml: 1 }}
                                    />
                                  </div>
                                  <Skeleton
                                    variant="text"
                                    width={128}
                                    height={12}
                                  />
                                </div>
                              ) : (
                                <div>
                                  <Skeleton
                                    variant="text"
                                    width={80}
                                    height={16}
                                    sx={{ mb: 0.5 }}
                                  />
                                  <Skeleton
                                    variant="text"
                                    width={64}
                                    height={12}
                                  />
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <CourseSchedulePage schedule={schedule} />
            ))}

          {activeTab === "assessment" && <QuestionBank courseId={course.id} />}
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
