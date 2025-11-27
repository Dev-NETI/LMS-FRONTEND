"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/src/components/admin/AdminLayout";
import AuthGuard from "@/src/components/auth/AuthGuard";
import { Button } from "@/src/components/ui/button";
import {
  getCourseById,
  getCourseSchedule,
  AdminCourse,
  CourseSchedule,
} from "@/src/services/courseService";
import toast from "react-hot-toast";
import { ArrowLeftIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Course, Student } from "@/src/components/admin/course/types";
import CourseSchedulePage from "@/src/components/admin/course/CourseSchedule";
import CourseOverviewPage from "@/src/components/admin/course/CourseOverview";
import CourseContentPage from "@/src/components/admin/course/CourseContent";

// Transform backend course data to frontend format
const transformCourseData = (backendCourse: AdminCourse): Course => {
  return {
    ...backendCourse,
    id: backendCourse.courseid,
    title: backendCourse.coursename,
    description: backendCourse.coursedescription || "No description available",
    instructor: "TBD", // TODO: Add instructor field to backend
    duration: "TBD", // TODO: Add duration field to backend
    level: "Beginner", // TODO: Add level field to backend
    category: backendCourse.coursecategory || "General",
    thumbnail: "/images/default-course.jpg",
    createdAt: backendCourse.coursecreationdate,
    updatedAt: backendCourse.courseupdateddate,
    status: "Published", // TODO: Add status field to backend
    price: 0, // TODO: Add price field to backend
    tags: [], // TODO: Add tags field to backend
    syllabus: [
      "Course Introduction",
      "Module 1: Fundamentals",
      "Module 2: Practical Applications",
      "Module 3: Advanced Topics",
      "Final Assessment",
    ], // TODO: Add syllabus from backend
    requirements: [
      "Basic knowledge of the subject",
      "Access to course materials",
    ], // TODO: Add requirements from backend
    objectives: [
      "Master the core concepts",
      "Apply knowledge in practical scenarios",
      "Complete all assessments successfully",
    ], // TODO: Add objectives from backend
  };
};

const mockStudents: Student[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@maritime.com",
    enrolledAt: "2024-09-01T10:00:00Z",
    progress: 85,
    status: "Active",
    lastActivity: "2024-11-17T14:30:00Z",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@shipping.com",
    enrolledAt: "2024-09-15T09:15:00Z",
    progress: 100,
    status: "Completed",
    lastActivity: "2024-11-10T16:45:00Z",
  },
  {
    id: 3,
    name: "Mike Wilson",
    email: "m.wilson@oceanline.com",
    enrolledAt: "2024-10-01T11:30:00Z",
    progress: 45,
    status: "Active",
    lastActivity: "2024-11-18T08:20:00Z",
  },
  {
    id: 4,
    name: "Emma Davis",
    email: "emma.davis@coastal.com",
    enrolledAt: "2024-08-20T13:45:00Z",
    progress: 25,
    status: "Dropped",
    lastActivity: "2024-10-15T12:10:00Z",
  },
];

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [schedule, setSchedule] = useState<CourseSchedule[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "content" | "schedule"
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
          const transformedCourse = transformCourseData(courseResponse.data);
          setCourse(transformedCourse);
        } else {
          setError(courseResponse.message || "Failed to fetch course");
          toast.error(courseResponse.message || "Failed to fetch course");
        }

        // Fetch course schedule
        try {
          const scheduleResponse = await getCourseSchedule(Number(params.id));
          if (scheduleResponse.success) {
            setSchedule(scheduleResponse.data);
          }
        } catch (scheduleError) {
          console.warn("Failed to fetch course schedule:", scheduleError);
          // Don't show error for schedule as it's optional
        }

        // TODO: Fetch enrolled students when backend provides this endpoint
        setStudents(mockStudents);
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
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading course details...</p>
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
                onClick={() => setActiveTab("schedule")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "schedule"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Schedule (
                {schedule.filter((s) => s.courseid === s.courseid).length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && <CourseOverviewPage course={course} />}

          {activeTab === "content" && <CourseContentPage course={course} />}

          {activeTab === "schedule" && (
            <CourseSchedulePage schedule={schedule} />
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
