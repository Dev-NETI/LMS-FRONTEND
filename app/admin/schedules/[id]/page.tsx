"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/src/components/admin/AdminLayout";
import AuthGuard from "@/src/components/auth/AuthGuard";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@mui/material";
import { toast } from "react-toastify";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ChartBarIcon,
  MegaphoneIcon,
  DocumentTextIcon,
  UsersIcon,
  ClockIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import AnnouncementFeed from "@/src/components/admin/schedule/AnnouncementFeed";
import ProgressMonitoring from "@/src/components/admin/schedule/ProgressMonitoring";
import TrainingMaterials from "@/src/components/admin/schedule/TrainingMaterials";
import EnrolledStudents from "@/src/components/admin/schedule/EnrolledStudents";
import {
  CourseSchedule,
  getCourseScheduleById,
} from "@/src/services/scheduleService";
import CourseDetailsTable from "@/src/components/admin/course/CourseDetailsTable";

export default function ScheduleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [schedule, setSchedule] = useState<CourseSchedule | null>(null);
  const [activeTab, setActiveTab] = useState<
    "announcements" | "progress" | "course_overview" | "materials" | "students"
  >("announcements");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScheduleDetails = async () => {
      if (!params.id) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch course schedule by ID
        const scheduleResponse = await getCourseScheduleById(Number(params.id));
        if (scheduleResponse.success && scheduleResponse.data) {
          // Handle both single object and array responses
          const scheduleData = Array.isArray(scheduleResponse.data)
            ? scheduleResponse.data[0]
            : scheduleResponse.data;
          setSchedule(scheduleData);

          console.log("Schedule Data:", scheduleData);

          // Set default active tab based on mode of delivery
          // For self-paced distance learning (mode 4), only announcements are available
          if (scheduleData.modeofdeliveryid === 4) {
            setActiveTab("announcements");
          }
        } else {
          setError(
            scheduleResponse.message || "Failed to fetch schedule details"
          );
          toast.error(
            scheduleResponse.message || "Failed to fetch schedule details"
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch schedule details";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Error fetching schedule:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheduleDetails();
  }, [params.id]);

  const getDurationInDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <AdminLayout>
          <div className="space-y-6 p-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton
                  variant="rectangular"
                  width={120}
                  height={40}
                  className="rounded-md"
                />
                <div>
                  <Skeleton variant="text" width={300} height={36} />
                  <Skeleton variant="text" width={200} height={24} />
                </div>
              </div>
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <Skeleton
                      variant="rounded"
                      width={48}
                      height={48}
                      className="rounded-lg"
                    />
                    <div className="ml-4 flex-1">
                      <Skeleton variant="text" width={80} height={16} />
                      <Skeleton variant="text" width={60} height={28} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Content skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <Skeleton variant="text" width={200} height={28} />
              <div className="mt-6 space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index}>
                    <Skeleton variant="text" width="100%" height={20} />
                    <Skeleton variant="text" width="80%" height={20} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  if (error || !schedule) {
    return (
      <AuthGuard>
        <AdminLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <CalendarIcon className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {error ? "Failed to Load Schedule" : "Schedule Not Found"}
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {error ||
                  "The schedule you're looking for doesn't exist or has been removed."}
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  className="px-6"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin/courses")}
                  className="px-6"
                >
                  Back to Courses
                </Button>
              </div>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center hover:bg-gray-100 transition-colors mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                      {schedule.batchno}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">
                    <i>#{schedule.scheduleid} -</i>{" "}
                    {schedule.course?.coursename}
                  </h1>
                  <p className="text-blue-100 flex items-center gap-2">
                    <AcademicCapIcon className="w-5 h-5" />
                    Schedule Details and Training Management
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-blue-300">
              <div className="flex items-start">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Start Date
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {schedule.startdateformat
                      ? new Date(schedule.startdateformat).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-green-300">
              <div className="flex items-start">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    End Date
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {schedule.enddateformat
                      ? new Date(schedule.enddateformat).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-purple-300">
              <div className="flex items-start">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm">
                  <ClockIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Duration
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {schedule.startdateformat && schedule.enddateformat
                      ? getDurationInDays(
                          schedule.startdateformat,
                          schedule.enddateformat
                        )
                      : "0"}{" "}
                    <span className="text-sm font-normal text-gray-600">
                      days
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-orange-300">
              <div className="flex items-start">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm">
                  <UsersIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Total Enrolled
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {schedule.active_enrolled || 0}
                    <span className="text-sm font-normal text-gray-600 ml-1">
                      students
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <nav className="flex flex-wrap md:flex-nowrap">
              <button
                onClick={() => setActiveTab("announcements")}
                className={`flex-1 py-4 px-4 text-center border-b-2 font-semibold text-sm flex items-center justify-center transition-all ${
                  activeTab === "announcements"
                    ? "border-blue-600 text-blue-700 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <MegaphoneIcon className="w-5 h-5 mr-2" />
                Announcements
              </button>

              <button
                onClick={() => setActiveTab("course_overview")}
                className={`flex-1 py-4 px-4 text-center border-b-2 font-semibold text-sm flex items-center justify-center transition-all ${
                  activeTab === "course_overview"
                    ? "border-blue-600 text-blue-700 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <AcademicCapIcon className="w-5 h-5 mr-2" />
                Course Overview
              </button>

              {/* Only show Progress Monitoring if mode of delivery is NOT 4 (self-paced distance learning) */}
              {schedule.course?.modeofdeliveryid === 4 && (
                <button
                  onClick={() => setActiveTab("progress")}
                  className={`flex-1 py-4 px-4 text-center border-b-2 font-semibold text-sm flex items-center justify-center transition-all ${
                    activeTab === "progress"
                      ? "border-blue-600 text-blue-700 bg-blue-50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <ChartBarIcon className="w-5 h-5 mr-2" />
                  Progress
                </button>
              )}

              {/* Training Materials tab - available for all modes */}
              <button
                onClick={() => setActiveTab("materials")}
                className={`flex-1 py-4 px-4 text-center border-b-2 font-semibold text-sm flex items-center justify-center transition-all ${
                  activeTab === "materials"
                    ? "border-blue-600 text-blue-700 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Materials
              </button>

              {/* Enrolled Students tab - available for all modes */}
              <button
                onClick={() => setActiveTab("students")}
                className={`flex-1 py-4 px-4 text-center border-b-2 font-semibold text-sm flex items-center justify-center transition-all ${
                  activeTab === "students"
                    ? "border-blue-600 text-blue-700 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <UsersIcon className="w-5 h-5 mr-2" />
                <span className="hidden lg:inline">Enrolled Trainees</span>
                <span className="lg:hidden">Trainees</span>
                <span className="ml-1.5 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs font-bold">
                  {schedule.active_enrolled || 0}
                </span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {activeTab === "announcements" && (
              <div className="p-6">
                <AnnouncementFeed scheduleId={schedule.scheduleid} />
              </div>
            )}

            {activeTab === "course_overview" && (
              <div className="p-6">
                <CourseDetailsTable courseId={schedule.courseid} />
              </div>
            )}

            {activeTab === "progress" &&
              schedule.course?.modeofdeliveryid === 4 && (
                <div className="p-6">
                  <ProgressMonitoring scheduleId={schedule.scheduleid} />
                </div>
              )}

            {activeTab === "materials" && (
              <div className="p-6">
                <TrainingMaterials courseId={schedule.courseid} />
              </div>
            )}

            {activeTab === "students" && (
              <div className="p-6">
                <EnrolledStudents
                  students={schedule.enrolled_students || []}
                  isLoading={false}
                />
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
