"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTraineeProfile, TraineeProfile } from "@/src/services/userService";
import {
  UserIcon,
  ArrowLeftIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import AuthGuard from "@/src/components/auth/AuthGuard";
import AdminLayout from "@/src/components/admin/AdminLayout";

export default function TraineeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const traineeId = params.id as string;

  const [profile, setProfile] = useState<TraineeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "courses" | "assessments" | "security"
  >("courses");

  useEffect(() => {
    if (traineeId) {
      fetchProfile();
    }
  }, [traineeId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getTraineeProfile(Number(traineeId));

      console.log(response);

      if (response.success) {
        setProfile(response.data);
      } else {
        setError("Failed to fetch trainee profile");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load trainee profile");
      console.error("Error fetching trainee profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFullName = () => {
    if (!profile) return "N/A";
    const parts = [
      profile.trainee.f_name,
      profile.trainee.m_name,
      profile.trainee.l_name,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "N/A";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout>
          <div className="space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  if (error || !profile) {
    return (
      <AuthGuard>
        <AdminLayout>
          <div className="space-y-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back
            </button>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Error Loading Profile
              </h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchProfile}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
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
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Trainees
            </button>
          </div>

          {/* Profile Header */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {getFullName().toUpperCase()}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Email:</span>
                    {profile.trainee.email || "N/A"}
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Username:</span>
                    {profile.trainee.username || "N/A"}
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        profile.trainee.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {profile.trainee.is_active ? (
                        <>
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {profile.statistics.total_courses}
                    </div>
                    <div className="text-sm text-blue-800">Total Courses</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {profile.statistics.passed_assessments}
                    </div>
                    <div className="text-sm text-green-800">
                      Passed Assessments
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {profile.statistics.average_score !== null &&
                      profile.statistics.average_score !== undefined
                        ? Number(profile.statistics.average_score).toFixed(1)
                        : "0"}
                      %
                    </div>
                    <div className="text-sm text-purple-800">Average Score</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {profile.statistics.security_violations}
                    </div>
                    <div className="text-sm text-red-800">
                      Security Violations
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("courses")}
                  className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                    activeTab === "courses"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <AcademicCapIcon className="w-5 h-5 inline-block mr-2" />
                  Enrolled Courses ({profile.enrolled_courses.length})
                </button>
                <button
                  onClick={() => setActiveTab("assessments")}
                  className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                    activeTab === "assessments"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <DocumentTextIcon className="w-5 h-5 inline-block mr-2" />
                  Assessment Attempts ({profile.assessment_attempts.length})
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                    activeTab === "security"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <ShieldExclamationIcon className="w-5 h-5 inline-block mr-2" />
                  Security Logs ({profile.security_logs.length})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "courses" && (
                <div className="space-y-4">
                  {profile.enrolled_courses.length === 0 ? (
                    <div className="text-center py-12">
                      <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No enrolled courses found</p>
                    </div>
                  ) : (
                    profile.enrolled_courses.map((course) => (
                      <div
                        key={course.enrollment_id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {course.course_name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Code: {course.course_code}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-1" />
                                Training Schedule:{" "}
                                {formatDate(
                                  course.schedule_data.startdateformat
                                )}{" "}
                                to{" "}
                                {formatDate(course.schedule_data.enddateformat)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "assessments" && (
                <div className="space-y-4">
                  {profile.assessment_attempts.length === 0 ? (
                    <div className="text-center py-12">
                      <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        No assessment attempts found
                      </p>
                    </div>
                  ) : (
                    profile.assessment_attempts.map((attempt) => (
                      <div
                        key={attempt.attempt_id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {attempt.assessment_title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Attempt #{attempt.attempt_number}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {attempt.status === "submitted" &&
                              attempt.is_passed !== null && (
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    attempt.is_passed
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {attempt.is_passed ? "Passed" : "Failed"}
                                </span>
                              )}
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                attempt.status === "submitted"
                                  ? "bg-blue-100 text-blue-800"
                                  : attempt.status === "in_progress"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {attempt.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Score:</span>
                            <div className="font-semibold text-gray-900">
                              {attempt.percentage !== null &&
                              attempt.percentage !== undefined
                                ? Number(attempt.percentage).toFixed(1)
                                : "0"}
                              %
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Started:</span>
                            <div className="font-semibold text-gray-900">
                              {formatDate(attempt.started_at)}
                            </div>
                          </div>
                          {attempt.submitted_at && (
                            <div>
                              <span className="text-gray-600">Submitted:</span>
                              <div className="font-semibold text-gray-900">
                                {formatDate(attempt.submitted_at)}
                              </div>
                            </div>
                          )}
                          {attempt.time_remaining !== null &&
                            attempt.time_remaining !== undefined && (
                              <div>
                                <span className="text-gray-600">
                                  Time Remaining:
                                </span>
                                <div className="font-semibold text-gray-900">
                                  {Math.floor(attempt.time_remaining / 60)}m{" "}
                                  {attempt.time_remaining % 60}s
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-4">
                  {profile.security_logs.length === 0 ? (
                    <div className="text-center py-12">
                      <ShieldExclamationIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No security logs found</p>
                    </div>
                  ) : (
                    profile.security_logs.map((log) => (
                      <div
                        key={log.log_id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {log.activity}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                                  log.severity
                                )}`}
                              >
                                {log.severity.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {log.assessment_title}
                            </p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div className="flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              {formatDate(log.event_timestamp)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mt-3 pt-3 border-t border-gray-100">
                          <div>
                            <span className="font-medium">Event Type:</span>{" "}
                            {log.event_type.replace(/_/g, " ")}
                          </div>
                          <div>
                            <span className="font-medium">IP Address:</span>{" "}
                            {log.ip_address}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
