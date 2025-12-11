"use client";

import React, { useState, useEffect } from "react";
import {
  Assessment,
  AssessmentAttempt,
  getTraineeAssessments,
  getScheduleAssessments,
  getAssessmentStats,
  AssessmentStats,
  formatTimeLimit,
  getStatusColor,
  getStatusText,
  getScoreBadgeColor,
} from "@/src/services/assessmentService";
import {
  ClockIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  EyeIcon,
  ChartBarIcon,
  BookOpenIcon,
  TrophyIcon,
  ArrowRightIcon,
  FunnelIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  SparklesIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

interface AssessmentListProps {
  scheduleId?: number;
}

export default function AssessmentList({ scheduleId }: AssessmentListProps) {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [stats, setStats] = useState<AssessmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState<
    "title" | "dueDate" | "status" | "score"
  >("title");

  useEffect(() => {
    fetchData();
  }, [scheduleId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const assessmentsPromise = scheduleId
        ? getScheduleAssessments(scheduleId)
        : getTraineeAssessments();

      const [assessmentsResponse, statsResponse] = await Promise.all([
        assessmentsPromise,
        getAssessmentStats(),
      ]);

      if (assessmentsResponse.success) {
        setAssessments(assessmentsResponse.data);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load assessments");
      console.error("Error fetching assessments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = (assessment: Assessment) => {
    // If there's an active attempt, resume it; otherwise start new
    if (assessment.has_active_attempt && assessment.active_attempt_id) {
      router.push(
        `/assessments/${assessment.id}?attemptId=${assessment.active_attempt_id}`
      );
    } else {
      router.push(`/assessments/${assessment.id}`);
    }
  };

  const handleViewResults = (assessmentId: number, attemptId: number) => {
    router.push(`/assessments/${assessmentId}/results/${attemptId}`);
  };

  const filteredAndSortedAssessments = (() => {
    let filtered = assessments.filter((assessment) => {
      if (filter === "pending") {
        return !assessment.attempts?.some(
          (attempt) => attempt.status === "submitted"
        );
      }
      if (filter === "completed") {
        return assessment.attempts?.some(
          (attempt) => attempt.status === "submitted"
        );
      }
      return true; // 'all'
    });

    // Sort assessments
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "status":
          const aStatus = getAssessmentStatus(a).status;
          const bStatus = getAssessmentStatus(b).status;
          return aStatus.localeCompare(bStatus);
        case "score":
          const aScore = a.last_attempt?.percentage || 0;
          const bScore = b.last_attempt?.percentage || 0;
          return bScore - aScore; // Descending order
        default:
          return 0;
      }
    });
  })();

  const getAssessmentStatus = (assessment: Assessment) => {
    if (assessment.has_active_attempt) {
      return {
        status: "in_progress",
        color: "bg-blue-100 text-blue-800",
        text: "In Progress",
      };
    }

    if (assessment.last_attempt) {
      const passed = assessment.last_attempt.is_passed;
      return {
        status: "completed",
        color: passed
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800",
        text: passed ? "Passed" : "Failed",
      };
    }

    return {
      status: "not_started",
      color: "bg-gray-100 text-gray-800",
      text: "Not Started",
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="group bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-3 flex items-center">
                  <BookOpenIcon className="w-4 h-4 mr-2" />
                  Total Assessments
                </p>
                <p className="text-3xl font-bold text-blue-700 mb-1">
                  {stats.total_assessments}
                </p>
                <p className="text-xs text-blue-600/70">Available to take</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-200 to-blue-300 rounded-2xl group-hover:from-blue-300 group-hover:to-blue-400 transition-all duration-300">
                <BookOpenIcon className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-600 mb-3 flex items-center">
                  <CheckCircleIconSolid className="w-4 h-4 mr-2" />
                  Completed
                </p>
                <p className="text-3xl font-bold text-emerald-700 mb-1">
                  {stats.completed_assessments}
                </p>
                <p className="text-xs text-emerald-600/70">
                  {stats.total_assessments > 0
                    ? Math.round(
                        (stats.completed_assessments /
                          stats.total_assessments) *
                          100
                      )
                    : 0}
                  % completion rate
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-2xl group-hover:from-emerald-300 group-hover:to-emerald-400 transition-all duration-300">
                <CheckCircleIconSolid className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 rounded-2xl p-6 border border-amber-200/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-600 mb-3 flex items-center">
                  <TrophyIcon className="w-4 h-4 mr-2" />
                  Passed
                </p>
                <p className="text-3xl font-bold text-amber-700 mb-1">
                  {stats.passed_assessments}
                </p>
                <p className="text-xs text-amber-600/70">
                  {stats.completed_assessments > 0
                    ? Math.round(
                        (stats.passed_assessments /
                          stats.completed_assessments) *
                          100
                      )
                    : 0}
                  % pass rate
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-200 to-orange-300 rounded-2xl group-hover:from-amber-300 group-hover:to-orange-400 transition-all duration-300">
                <TrophyIcon className="w-7 h-7 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 rounded-2xl p-6 border border-violet-200/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-violet-600 mb-3 flex items-center">
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  Average Score
                </p>
                <p className="text-3xl font-bold text-violet-700 mb-1">
                  {stats.average_score}%
                </p>
                <p className="text-xs text-violet-600/70">
                  {stats.average_score >= 80
                    ? "Excellent"
                    : stats.average_score >= 70
                    ? "Good"
                    : stats.average_score >= 60
                    ? "Fair"
                    : "Needs improvement"}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-violet-200 to-indigo-300 rounded-2xl group-hover:from-violet-300 group-hover:to-indigo-400 transition-all duration-300">
                <ChartBarIcon className="w-7 h-7 text-violet-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header and Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                My Assessments
              </h1>
            </div>
            <p className="text-gray-600 ml-11">
              Complete assessments to test your knowledge and track your
              progress
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filter Tabs */}
            <div className="flex bg-gray-50 rounded-xl p-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === "all"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All ({assessments.length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === "pending"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Pending (
                {
                  assessments.filter(
                    (a) =>
                      !a.attempts?.some((att) => att.status === "submitted")
                  ).length
                }
                )
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === "completed"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Completed (
                {
                  assessments.filter((a) =>
                    a.attempts?.some((att) => att.status === "submitted")
                  ).length
                }
                )
              </button>
            </div>

            {/* Sort and View Controls */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="title">Sort by Title</option>
                <option value="status">Sort by Status</option>
                <option value="score">Sort by Score</option>
              </select>

              <div className="flex bg-gray-50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <DocumentTextIcon className="w-4 h-4" />
                </button>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchData}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assessments List */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            : "space-y-4"
        }
      >
        {filteredAndSortedAssessments.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === "pending"
                ? "No pending assessments"
                : filter === "completed"
                ? "No completed assessments"
                : "No assessments available"}
            </h3>
            <p className="text-gray-600">
              {filter === "all"
                ? "Assessments will appear here when they're assigned to your courses."
                : "Switch filters to see other assessments."}
            </p>
          </div>
        ) : (
          filteredAndSortedAssessments.map((assessment) => {
            const status = getAssessmentStatus(assessment);
            const latestAttempt = assessment.last_attempt;
            const isGridView = viewMode === "grid";

            return (
              <div
                key={assessment.id}
                className={`group bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-[1.01] ${
                  isGridView ? "p-6" : "p-6"
                }`}
              >
                {isGridView ? (
                  // Grid View Layout
                  <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {status.status === "completed" &&
                            latestAttempt?.is_passed && (
                              <div className="p-1 bg-green-100 rounded-lg">
                                <CheckCircleIconSolid className="w-4 h-4 text-green-600" />
                              </div>
                            )}
                          {status.status === "in_progress" && (
                            <div className="p-1 bg-blue-100 rounded-lg">
                              <SparklesIcon className="w-4 h-4 text-blue-600" />
                            </div>
                          )}
                          {status.status === "not_started" && (
                            <div className="p-1 bg-gray-100 rounded-lg">
                              <PlayIcon className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                          {assessment.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {assessment.course?.coursename}
                        </p>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${status.color}`}
                      >
                        {status.text}
                      </span>
                    </div>

                    {/* Description */}
                    {assessment.description && (
                      <p
                        className="text-sm text-gray-700 mb-4"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {assessment.description}
                      </p>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center text-xs text-gray-600 mb-1">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          Time Limit
                        </div>
                        <p className="font-semibold text-gray-900">
                          {formatTimeLimit(assessment.time_limit)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center text-xs text-gray-600 mb-1">
                          <AcademicCapIcon className="w-3 h-3 mr-1" />
                          Questions
                        </div>
                        <p className="font-semibold text-gray-900">
                          {assessment.questions_count}
                        </p>
                      </div>
                    </div>

                    {/* Latest Attempt */}
                    {latestAttempt && (
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">
                              Latest Score
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(
                                latestAttempt.submitted_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-lg font-bold ${getScoreBadgeColor(
                                latestAttempt.percentage
                              )}`}
                            >
                              {latestAttempt.percentage}%
                            </span>
                            <div
                              className={`text-xs px-2 py-1 rounded-full mt-1 ${
                                latestAttempt.is_passed
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {latestAttempt.is_passed ? "Passed" : "Failed"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-auto space-y-2">
                      {assessment.has_active_attempt ? (
                        <button
                          onClick={() => handleStartAssessment(assessment)}
                          className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg shadow-blue-500/25"
                        >
                          <PlayIcon className="w-4 h-4 mr-2" />
                          Resume Assessment
                        </button>
                      ) : assessment.can_attempt ? (
                        <button
                          onClick={() => handleStartAssessment(assessment)}
                          className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-lg shadow-green-500/25"
                        >
                          <PlayIcon className="w-4 h-4 mr-2" />
                          {assessment.attempts_count &&
                          assessment.attempts_count > 0
                            ? "Retake Assessment"
                            : "Start Assessment"}
                        </button>
                      ) : (
                        <div className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl cursor-not-allowed font-medium">
                          No attempts left
                        </div>
                      )}

                      {latestAttempt && (
                        <button
                          onClick={() =>
                            handleViewResults(assessment.id, latestAttempt.id)
                          }
                          className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          View Results
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  // List View Layout
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {status.status === "completed" &&
                            latestAttempt?.is_passed ? (
                              <div className="p-2 bg-green-100 rounded-xl">
                                <CheckCircleIconSolid className="w-5 h-5 text-green-600" />
                              </div>
                            ) : status.status === "in_progress" ? (
                              <div className="p-2 bg-blue-100 rounded-xl">
                                <SparklesIcon className="w-5 h-5 text-blue-600" />
                              </div>
                            ) : status.status === "completed" &&
                              !latestAttempt?.is_passed ? (
                              <div className="p-2 bg-red-100 rounded-xl">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                              </div>
                            ) : (
                              <div className="p-2 bg-gray-100 rounded-xl">
                                <PlayIcon className="w-5 h-5 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                              {assessment.title}
                            </h3>
                            <p className="text-gray-600 mb-3 flex items-center">
                              <BookOpenIcon className="w-4 h-4 mr-2" />
                              {assessment.course?.coursename}
                            </p>
                            {assessment.description && (
                              <p className="text-gray-700 mb-4">
                                {assessment.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-full ${status.color}`}
                        >
                          {status.text}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <ClockIcon className="w-4 h-4 mr-2" />
                            Time Limit
                          </div>
                          <span className="font-semibold text-gray-900">
                            {formatTimeLimit(assessment.time_limit)}
                          </span>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <AcademicCapIcon className="w-4 h-4 mr-2" />
                            Questions
                          </div>
                          <span className="font-semibold text-gray-900">
                            {assessment.questions_count}
                          </span>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <TrophyIcon className="w-4 h-4 mr-2" />
                            Pass Score
                          </div>
                          <span className="font-semibold text-gray-900">
                            {assessment.passing_score}%
                          </span>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-sm text-gray-600 mb-1">
                            Attempts
                          </div>
                          <span className="font-semibold text-gray-900">
                            {assessment.attempts?.length || 0}/
                            {assessment.max_attempts}
                          </span>
                        </div>
                      </div>

                      {/* Latest Attempt Info */}
                      {latestAttempt && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-1">
                                Latest Attempt
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  latestAttempt.submitted_at
                                ).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`text-xl font-bold ${getScoreBadgeColor(
                                  latestAttempt.percentage
                                )}`}
                              >
                                {latestAttempt.percentage}%
                              </span>
                              <div
                                className={`text-xs px-3 py-1 rounded-full mt-1 ${
                                  latestAttempt.is_passed
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {latestAttempt.is_passed ? "Passed" : "Failed"}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="ml-6 flex flex-col space-y-3">
                      {assessment.has_active_attempt ? (
                        <button
                          onClick={() => handleStartAssessment(assessment)}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg shadow-blue-500/25"
                        >
                          <PlayIcon className="w-4 h-4 mr-2" />
                          Resume
                        </button>
                      ) : assessment.can_attempt ? (
                        <button
                          onClick={() => handleStartAssessment(assessment)}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-lg shadow-green-500/25"
                        >
                          <PlayIcon className="w-4 h-4 mr-2" />
                          {assessment.attempts_count &&
                          assessment.attempts_count > 0
                            ? "Retake"
                            : "Start"}
                        </button>
                      ) : (
                        <div className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-500 rounded-xl cursor-not-allowed font-medium">
                          No attempts left
                        </div>
                      )}

                      {latestAttempt && (
                        <button
                          onClick={() =>
                            handleViewResults(assessment.id, latestAttempt.id)
                          }
                          className="inline-flex items-center px-6 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          View Results
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
