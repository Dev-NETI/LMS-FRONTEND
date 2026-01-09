"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MinusCircleIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import {
  getScheduleAssessmentResults,
  TraineeAssessmentResult,
  getScoreBadgeColor,
} from "@/src/services/assessmentService";
import toast from "react-hot-toast";

interface AssessmentResultsProps {
  scheduleId: number;
}

export default function AssessmentResults({
  scheduleId,
}: AssessmentResultsProps) {
  const [results, setResults] = useState<TraineeAssessmentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedAssessment, setSelectedAssessment] = useState<number | null>(
    null
  );

  useEffect(() => {
    fetchAssessmentResults();
  }, [scheduleId]);

  const fetchAssessmentResults = async () => {
    setIsLoading(true);
    try {
      const response = await getScheduleAssessmentResults(scheduleId);
      if (response.success && response.data) {
        setResults(response.data.trainee_results || []);
      } else {
        toast.error("Failed to fetch assessment results");
      }
    } catch (error) {
      console.error("Error fetching assessment results:", error);
      toast.error("Error loading assessment results");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRow = (traineeId: number, assessmentId: number) => {
    const key = `${traineeId}-${assessmentId}`;
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadge = (
    status: "not_started" | "in_progress" | "completed" | "passed" | "failed"
  ) => {
    const badges = {
      not_started: {
        color: "bg-gray-100 text-gray-800",
        icon: MinusCircleIcon,
        text: "Not Started",
      },
      in_progress: {
        color: "bg-blue-100 text-blue-800",
        icon: ClockIcon,
        text: "In Progress",
      },
      completed: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircleIcon,
        text: "Completed",
      },
      passed: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircleIcon,
        text: "Passed",
      },
      failed: {
        color: "bg-red-100 text-red-800",
        icon: XCircleIcon,
        text: "Failed",
      },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.color}`}
      >
        <Icon className="w-4 h-4" />
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Group results by assessment
  const assessmentGroups = results.reduce((acc, result) => {
    if (!acc[result.assessment_id]) {
      acc[result.assessment_id] = {
        assessment_title: result.assessment_title,
        assessment_id: result.assessment_id,
        trainees: [],
      };
    }
    acc[result.assessment_id].trainees.push(result);
    return acc;
  }, {} as Record<number, { assessment_title: string; assessment_id: number; trainees: TraineeAssessmentResult[] }>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment results...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Assessment Results
        </h3>
        <p className="text-gray-600">
          No assessments have been completed by trainees yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assessment Filter */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Filter by Assessment
        </label>
        <select
          value={selectedAssessment || "all"}
          onChange={(e) =>
            setSelectedAssessment(
              e.target.value === "all" ? null : Number(e.target.value)
            )
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Assessments</option>
          {Object.values(assessmentGroups).map((group) => (
            <option key={group.assessment_id} value={group.assessment_id}>
              {group.assessment_title}
            </option>
          ))}
        </select>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Trainee
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Assessment
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Best Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Attempts
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Last Attempt
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results
                .filter(
                  (result) =>
                    !selectedAssessment ||
                    result.assessment_id === selectedAssessment
                )
                .map((result) => {
                  const rowKey = `${result.trainee_id}-${result.assessment_id}`;
                  const isExpanded = expandedRows.has(rowKey);

                  return (
                    <React.Fragment key={rowKey}>
                      <tr
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">
                              {result.rankacronym
                                ? `${result.rankacronym} `
                                : ""}
                              {result.trainee_name}
                            </div>
                            {result.trainee_email && (
                              <div className="text-sm text-gray-500">
                                {result.trainee_email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {result.assessment_title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(result.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {result.best_percentage !== undefined &&
                          result.best_percentage !== null ? (
                            <span
                              className={`text-sm font-semibold ${getScoreBadgeColor(
                                result.best_percentage
                              )}`}
                            >
                              {result.best_percentage.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {result.attempts_count}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {formatDate(result.last_attempt_date)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {result.attempts_count > 0 && (
                            <button
                              onClick={() =>
                                toggleRow(
                                  result.trainee_id,
                                  result.assessment_id
                                )
                              }
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUpIcon className="w-4 h-4" />
                                  Hide Attempts
                                </>
                              ) : (
                                <>
                                  <ChevronDownIcon className="w-4 h-4" />
                                  View Attempts
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Attempts Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-900 mb-3">
                                All Attempts
                              </h4>
                              {result.attempts.map((attempt, index) => (
                                <div
                                  key={attempt.id}
                                  className="bg-white border border-gray-200 rounded-lg p-4"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                        Attempt
                                      </p>
                                      <p className="text-sm font-semibold text-gray-900">
                                        #{attempt.attempt_number}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                        Score
                                      </p>
                                      <p
                                        className={`text-sm font-semibold ${
                                          attempt.percentage !== undefined &&
                                          attempt.percentage !== null
                                            ? getScoreBadgeColor(
                                                attempt.percentage
                                              )
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {attempt.percentage !== undefined &&
                                        attempt.percentage !== null
                                          ? `${attempt.percentage.toFixed(1)}%`
                                          : "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                        Status
                                      </p>
                                      <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                          attempt.status === "submitted"
                                            ? "bg-green-100 text-green-800"
                                            : attempt.status === "in_progress"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-red-100 text-red-800"
                                        }`}
                                      >
                                        {attempt.status === "submitted"
                                          ? "Submitted"
                                          : attempt.status === "in_progress"
                                          ? "In Progress"
                                          : "Expired"}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                        Started
                                      </p>
                                      <p className="text-sm text-gray-900">
                                        {formatDate(attempt.started_at)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                        Submitted
                                      </p>
                                      <p className="text-sm text-gray-900">
                                        {formatDate(attempt.submitted_at)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
