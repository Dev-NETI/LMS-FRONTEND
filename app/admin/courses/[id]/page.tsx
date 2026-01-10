"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/src/components/admin/AdminLayout";
import AuthGuard from "@/src/components/auth/AuthGuard";
import { Button } from "@/src/components/ui/button";
import { getCourseById, AdminCourse } from "@/src/services/courseService";
import { toast } from "react-toastify";
import {
  ArrowLeftIcon,
  XCircleIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  FolderIcon,
  CalendarIcon,
  QuestionMarkCircleIcon,
  ClipboardDocumentCheckIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { Skeleton } from "@mui/material";
import CourseSchedulePage from "@/src/components/admin/course/CourseSchedule";
import CourseContentPage from "@/src/components/admin/course/CourseContent";
import CourseTrainingMaterials from "@/src/components/admin/course/CourseTrainingMaterials";
import CourseDetailsTable from "@/src/components/admin/course/CourseDetailsTable";
import QuestionBank from "@/src/components/admin/course/QuestionBank";
import AssessmentManagement from "@/src/components/admin/course/AssessmentManagement";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<AdminCourse | null>(null);
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "content"
    | "schedule"
    | "materials"
    | "questions"
    | "assessments"
  >("overview");
  const [isLoading, setIsLoading] = useState(true);
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
          setCourse(courseResponse.data);
        } else {
          setError(courseResponse.message || "Failed to fetch course");
          toast.error(courseResponse.message || "Failed to fetch course");
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
                  {course.coursename}
                </h1>
                <p className="text-gray-600 mt-1">
                  Course Details and Management
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <nav className="flex flex-wrap gap-2 p-3">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === "overview"
                    ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <AcademicCapIcon className="w-4 h-4" />
                Overview
              </button>

              <button
                onClick={() => setActiveTab("content")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === "content"
                    ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <DocumentTextIcon className="w-4 h-4" />
                Content & Syllabus
              </button>

              <button
                onClick={() => setActiveTab("materials")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === "materials"
                    ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <FolderIcon className="w-4 h-4" />
                Training Materials
              </button>

              <button
                onClick={() => setActiveTab("questions")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === "questions"
                    ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <QuestionMarkCircleIcon className="w-4 h-4" />
                Question Bank
              </button>

              <button
                onClick={() => setActiveTab("assessments")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === "assessments"
                    ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <ClipboardDocumentCheckIcon className="w-4 h-4" />
                Assessments
              </button>

              <button
                onClick={() => setActiveTab("schedule")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === "schedule"
                    ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                Schedule
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <CourseDetailsTable courseId={course.courseid} />
          )}

          {activeTab === "content" && <CourseContentPage course={course} />}

          {activeTab === "materials" && (
            <CourseTrainingMaterials courseId={course.courseid} />
          )}

          {activeTab === "schedule" && (
            <CourseSchedulePage courseId={course.courseid} />
          )}

          {activeTab === "questions" && (
            <QuestionBank courseId={course.courseid} />
          )}

          {activeTab === "assessments" && (
            <AssessmentManagement courseId={course.courseid} />
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
