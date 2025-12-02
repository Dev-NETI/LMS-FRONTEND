"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/src/context/AuthContext";

interface CourseProgress {
  id: number;
  coursename: string;
  batchno: string;
  startdate: string;
  enddate: string;
  instructor: string;
  status: string;
  datecompleted: string | null;
}

interface TimelineItem {
  id: number;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  type: "lesson" | "assignment" | "exam";
}

interface InstructorPost {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  type: "announcement" | "material" | "assignment";
}

export default function CourseProgressPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(
    null
  );
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [instructorPosts, setInstructorPosts] = useState<InstructorPost[]>([]);

  useEffect(() => {
    const fetchCourseProgress = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await getCourseProgress(params.courseId);

        // Mock data for now
        setCourseProgress({
          id: Number(params.courseId),
          coursename: "Maritime Safety Training",
          batchno: "MST-2024-01",
          startdate: "2024-01-15",
          enddate: "2024-02-15",
          instructor: "Capt. Johnson",
          status: "in-progress",
          datecompleted: null,
        });

        setTimeline([
          {
            id: 1,
            title: "Introduction to Maritime Safety",
            description: "Basic concepts and principles",
            date: "2024-01-15",
            completed: true,
            type: "lesson",
          },
          {
            id: 2,
            title: "Safety Equipment Overview",
            description: "Personal protective equipment and safety gear",
            date: "2024-01-18",
            completed: true,
            type: "lesson",
          },
          {
            id: 3,
            title: "Assignment: Safety Checklist",
            description: "Create a comprehensive safety checklist",
            date: "2024-01-22",
            completed: false,
            type: "assignment",
          },
          {
            id: 4,
            title: "Emergency Procedures",
            description: "Response protocols for various emergencies",
            date: "2024-01-25",
            completed: false,
            type: "lesson",
          },
          {
            id: 5,
            title: "Final Assessment",
            description: "Comprehensive safety knowledge test",
            date: "2024-02-10",
            completed: false,
            type: "exam",
          },
        ]);

        setInstructorPosts([
          {
            id: 1,
            title: "Welcome to Maritime Safety Training",
            content:
              "Welcome everyone! This course will cover essential maritime safety practices. Please review the course materials and don't hesitate to ask questions.",
            author: "Capt. Johnson",
            date: "2024-01-14",
            type: "announcement",
          },
          {
            id: 2,
            title: "Updated Safety Regulations",
            content:
              "Please note that there have been recent updates to international maritime safety regulations. I've uploaded the new documentation to the course materials.",
            author: "Capt. Johnson",
            date: "2024-01-20",
            type: "material",
          },
          {
            id: 3,
            title: "Assignment Reminder",
            content:
              "Don't forget that your safety checklist assignment is due this Friday. Make sure to include all the items we discussed in class.",
            author: "Capt. Johnson",
            date: "2024-01-22",
            type: "assignment",
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch course progress:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && params.courseId) {
      fetchCourseProgress();
    }
  }, [user, params.courseId]);

  const getTimelineItemIcon = (type: string, completed: boolean) => {
    if (completed) {
      return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
    }

    switch (type) {
      case "lesson":
        return <ClockIcon className="w-6 h-6 text-gray-400" />;
      case "assignment":
        return <ChatBubbleLeftIcon className="w-6 h-6 text-blue-400" />;
      case "exam":
        return <CheckCircleIcon className="w-6 h-6 text-orange-400" />;
      default:
        return <ClockIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const getPostIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return <ChatBubbleLeftIcon className="w-5 h-5 text-blue-500" />;
      case "material":
        return <CalendarDaysIcon className="w-5 h-5 text-green-500" />;
      case "assignment":
        return <CheckCircleIcon className="w-5 h-5 text-orange-500" />;
      default:
        return <ChatBubbleLeftIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">
              Loading course progress...
            </span>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  if (!courseProgress) {
    return (
      <AuthGuard>
        <Layout>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Course not found
            </h3>
            <p className="text-gray-600">
              The requested course could not be loaded.
            </p>
            <button
              onClick={() => router.push("/courses")}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Courses
            </button>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/courses")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {courseProgress.coursename}
              </h1>
              <p className="text-gray-600 mt-1">
                Batch: {courseProgress.batchno} | Instructor:{" "}
                {courseProgress.instructor}
              </p>
            </div>
          </div>

          {/* Course Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Training Period
                </h3>
                <p className="text-sm text-gray-600">
                  {new Date(courseProgress.startdate).toLocaleDateString()} -{" "}
                  {new Date(courseProgress.enddate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                <p className="text-sm text-gray-600 capitalize">
                  {courseProgress.status}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Completion</h3>
                <p className="text-sm text-gray-600">
                  {courseProgress.datecompleted
                    ? new Date(
                        courseProgress.datecompleted
                      ).toLocaleDateString()
                    : "In Progress"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Course Timeline
              </h2>
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={item.id} className="flex space-x-4">
                    <div className="flex flex-col items-center">
                      <div className="flex-shrink-0">
                        {getTimelineItemIcon(item.type, item.completed)}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="w-px h-8 bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() =>
                            router.push(
                              `/courses/${params.courseId}/topic/${item.id}`
                            )
                          }
                          className={`font-medium text-left hover:text-blue-600 transition-colors ${
                            item.completed ? "text-gray-900" : "text-gray-600"
                          }`}
                        >
                          {item.title}
                        </button>
                        <span className="text-xs text-gray-500">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            item.type === "lesson"
                              ? "bg-blue-100 text-blue-800"
                              : item.type === "assignment"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {item.type.charAt(0).toUpperCase() +
                            item.type.slice(1)}
                        </span>
                        {item.type === "lesson" && (
                          <button
                            onClick={() =>
                              router.push(
                                `/courses/${params.courseId}/topic/${item.id}`
                              )
                            }
                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            View Details →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor Posts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Instructor Updates
              </h2>
              <div className="space-y-4">
                {instructorPosts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <UserCircleIcon className="w-8 h-8 text-gray-400 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {post.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {getPostIcon(post.type)}
                            <span className="text-xs text-gray-500">
                              {new Date(post.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            By {post.author}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              post.type === "announcement"
                                ? "bg-blue-100 text-blue-800"
                                : post.type === "material"
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {post.type.charAt(0).toUpperCase() +
                              post.type.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
