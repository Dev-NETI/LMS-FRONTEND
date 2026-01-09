"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import InsturctorLayout from "@/src/components/instructor/InstructorLayout";
import AuthGuard from "@/src/components/auth/AuthGuard";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@mui/material";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ChartBarIcon,
  MegaphoneIcon,
  DocumentTextIcon,
  UsersIcon,
  ClockIcon,
  AcademicCapIcon,
  UserIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import AnnouncementFeed from "@/src/components/admin/schedule/AnnouncementFeed";
import ProgressMonitoring from "@/src/components/admin/schedule/ProgressMonitoring";
import TrainingMaterials from "@/src/components/admin/schedule/TrainingMaterials";
import EnrolledStudents from "@/src/components/admin/schedule/EnrolledStudents";
import AssessmentResults from "@/src/components/instructor/AssessmentResults";
import {
  CourseSchedule,
  getCourseScheduleById,
} from "@/src/services/scheduleService";
import CourseDetailsTable from "@/src/components/admin/course/CourseDetailsTable";
import Assessment from "@/src/components/instructor/Assessment";

export default function InstructorScheduleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [schedule, setSchedule] = useState<CourseSchedule | null>(null);
  const [activeTab, setActiveTab] = useState<
    | "announcements"
    | "progress"
    | "course_overview"
    | "materials"
    | "students"
    | "assessments"
    | "assessment_results"
  >("announcements");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);

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
        <InsturctorLayout>
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
        </InsturctorLayout>
      </AuthGuard>
    );
  }

  if (error || !schedule) {
    return (
      <AuthGuard>
        <InsturctorLayout>
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
                  onClick={() => router.push("/instructor/my-class")}
                  className="px-6"
                >
                  Back to My Classes
                </Button>
              </div>
            </div>
          </div>
        </InsturctorLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <InsturctorLayout>
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
                <div>
                  <Button
                    onClick={() => setIsPersonnelModalOpen(true)}
                    className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50"
                  >
                    <UserGroupIcon className="w-5 h-5" />
                    View Personnel
                  </Button>
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
                      Trainees
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Personnel Modal */}
          {isPersonnelModalOpen && (
            <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">
                      Training Personnel
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsPersonnelModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Instructor */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-blue-700 uppercase">
                          Instructor
                        </p>
                        <p className="font-semibold text-gray-900">
                          {schedule.instructor || "Not Assigned"}
                        </p>
                      </div>
                    </div>

                    {/* Alternative Instructor */}
                    <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <div className="p-2 bg-indigo-600 rounded-lg">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-indigo-700 uppercase">
                          Alternative Instructor
                        </p>
                        <p className="font-semibold text-gray-900">
                          {schedule.alternative_instructor || "Not Assigned"}
                        </p>
                      </div>
                    </div>

                    {/* Assessor */}
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="p-2 bg-green-600 rounded-lg">
                        <ClipboardDocumentCheckIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-green-700 uppercase">
                          Assessor
                        </p>
                        <p className="font-semibold text-gray-900">
                          {schedule.assessor || "Not Assigned"}
                        </p>
                      </div>
                    </div>

                    {/* Alternative Assessor */}
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="p-2 bg-emerald-600 rounded-lg">
                        <ClipboardDocumentCheckIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-emerald-700 uppercase">
                          Alternative Assessor
                        </p>
                        <p className="font-semibold text-gray-900">
                          {schedule.alternative_assessor || "Not Assigned"}
                        </p>
                      </div>
                    </div>

                    {/* Seat In */}
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="p-2 bg-emerald-600 rounded-lg">
                        <ClipboardDocumentCheckIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-emerald-700 uppercase">
                          Seat-in Instructor
                        </p>
                        <p className="font-semibold text-gray-900">
                          {schedule.seat_instructor || "Not Assigned"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                  <Button
                    onClick={() => setIsPersonnelModalOpen(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

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

              {/* Only show Progress Monitoring if mode of delivery is 4 (self-paced distance learning) */}
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
                <span className="hidden lg:inline">My Trainees</span>
                <span className="lg:hidden">Trainees</span>
                <span className="ml-1.5 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs font-bold">
                  {schedule.active_enrolled || 0}
                </span>
              </button>

              {/* Assessment tab - available for all modes */}
              <button
                onClick={() => setActiveTab("assessments")}
                className={`flex-1 py-4 px-4 text-center border-b-2 font-semibold text-sm flex items-center justify-center transition-all ${
                  activeTab === "assessments"
                    ? "border-blue-600 text-blue-700 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                <span className="hidden lg:inline">Assessment</span>
                <span className="lg:hidden">Assessment</span>
              </button>

              {/* Assessment Results tab - available for all modes */}
              <button
                onClick={() => setActiveTab("assessment_results")}
                className={`flex-1 py-4 px-4 text-center border-b-2 font-semibold text-sm flex items-center justify-center transition-all ${
                  activeTab === "assessment_results"
                    ? "border-blue-600 text-blue-700 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                <span className="hidden lg:inline">Assessment Results</span>
                <span className="lg:hidden">Assessments Results</span>
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

            {activeTab === "assessments" && (
              <div className="p-6">
                <Assessment
                  scheduleId={schedule.scheduleid}
                  courseId={schedule.courseid}
                />
              </div>
            )}

            {activeTab === "assessment_results" && (
              <div className="p-6">
                <AssessmentResults scheduleId={schedule.scheduleid} />
              </div>
            )}
          </div>
        </div>
      </InsturctorLayout>
    </AuthGuard>
  );
}
