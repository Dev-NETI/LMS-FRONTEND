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
  CourseScheduleEvent,
} from "@/src/services/courseService";
import toast from "react-hot-toast";
import { ArrowLeftIcon, XCircleIcon } from "@heroicons/react/24/outline";
import CourseOverview from "@/src/components/admin/course/CourseOverview";
import CourseContent from "@/src/components/admin/course/CourseContent";
import CourseSchedule from "@/src/components/admin/course/CourseSchedule";
import {
  Course,
  Student,
  ScheduleEvent,
} from "@/src/components/admin/course/types";

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

const mockSchedule: ScheduleEvent[] = [
  {
    id: 1,
    title: "Course Introduction & Safety Overview",
    type: "Lecture",
    date: "2024-11-25",
    startTime: "09:00",
    endTime: "10:30",
    instructor: "Captain John Smith",
    location: "Training Room A",
    description:
      "Introduction to maritime safety principles and course objectives",
    status: "Scheduled",
    attendees: 45,
    maxAttendees: 50,
  },
  {
    id: 2,
    title: "Personal Protective Equipment Workshop",
    type: "Workshop",
    date: "2024-11-27",
    startTime: "14:00",
    endTime: "16:00",
    instructor: "Captain John Smith",
    location: "Workshop Bay 1",
    description:
      "Hands-on training with safety equipment and proper usage techniques",
    status: "Scheduled",
    attendees: 38,
    maxAttendees: 40,
  },
  {
    id: 3,
    title: "Safety Regulations Quiz",
    type: "Quiz",
    date: "2024-11-29",
    startTime: "10:00",
    endTime: "11:00",
    instructor: "Captain John Smith",
    location: "Online",
    description: "Assessment of basic safety regulation knowledge",
    status: "Scheduled",
    attendees: 0,
    maxAttendees: 100,
  },
  {
    id: 4,
    title: "Emergency Response Simulation",
    type: "Workshop",
    date: "2024-12-02",
    startTime: "09:00",
    endTime: "12:00",
    instructor: "Captain John Smith",
    location: "Simulation Deck",
    description: "Full-scale emergency response drill and simulation exercise",
    status: "Scheduled",
    attendees: 32,
    maxAttendees: 35,
  },
  {
    id: 5,
    title: "Fire Safety Training Completed",
    type: "Lecture",
    date: "2024-11-20",
    startTime: "13:00",
    endTime: "15:00",
    instructor: "Captain John Smith",
    location: "Training Room B",
    description: "Fire prevention and suppression techniques",
    status: "Completed",
    attendees: 48,
    maxAttendees: 50,
  },
  {
    id: 6,
    title: "Mid-term Assessment",
    type: "Exam",
    date: "2024-12-05",
    startTime: "09:00",
    endTime: "11:00",
    instructor: "Captain John Smith",
    location: "Examination Hall",
    description: "Comprehensive assessment covering weeks 1-4 material",
    status: "Scheduled",
    attendees: 0,
    maxAttendees: 60,
  },
  {
    id: 7,
    title: "Group Discussion: Case Studies",
    type: "Discussion",
    date: "2024-12-08",
    startTime: "15:00",
    endTime: "16:30",
    instructor: "Captain John Smith",
    location: "Conference Room C",
    description:
      "Analysis and discussion of real-world maritime safety incidents",
    status: "Scheduled",
    attendees: 25,
    maxAttendees: 30,
  },
];

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-800";
      case "Draft":
        return "bg-yellow-100 text-yellow-800";
      case "Archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-blue-100 text-blue-800";
      case "Intermediate":
        return "bg-purple-100 text-purple-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStudentStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Dropped":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  course.status
                )}`}
              >
                {course.status}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(
                  course.level
                )}`}
              >
                {course.level}
              </span>
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
                {
                  schedule.filter((event) => event.status === "Scheduled")
                    .length
                }
                )
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && <CourseOverview course={course} />}

          {activeTab === "content" && <CourseContent course={course} />}

          {activeTab === "schedule" && <CourseSchedule schedule={schedule} />}
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
