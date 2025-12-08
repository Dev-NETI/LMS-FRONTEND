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
} from "@heroicons/react/24/outline";
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
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

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
      router.push(`/assessments/${assessment.id}?attemptId=${assessment.active_attempt_id}`);
    } else {
      router.push(`/assessments/${assessment.id}`);
    }
  };

  const handleViewResults = (assessmentId: number, attemptId: number) => {
    router.push(`/assessments/${assessmentId}/results/${attemptId}`);
  };

  const filteredAssessments = assessments.filter((assessment) => {
    if (filter === 'pending') {
      return !assessment.attempts?.some(attempt => attempt.status === 'submitted');
    }
    if (filter === 'completed') {
      return assessment.attempts?.some(attempt => attempt.status === 'submitted');
    }
    return true; // 'all'
  });

  const getAssessmentStatus = (assessment: Assessment) => {
    if (assessment.has_active_attempt) {
      return { status: 'in_progress', color: 'bg-blue-100 text-blue-800', text: 'In Progress' };
    }
    
    if (assessment.last_attempt) {
      const passed = assessment.last_attempt.is_passed;
      return {
        status: 'completed',
        color: passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
        text: passed ? 'Passed' : 'Failed'
      };
    }
    
    return { status: 'not_started', color: 'bg-gray-100 text-gray-800', text: 'Not Started' };
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-2">
                  Total Assessments
                </p>
                <p className="text-3xl font-bold text-blue-700">
                  {stats.total_assessments}
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-xl">
                <BookOpenIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-600 mb-2">
                  Completed
                </p>
                <p className="text-3xl font-bold text-green-700">
                  {stats.completed_assessments}
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-xl">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-yellow-600 mb-2">
                  Passed
                </p>
                <p className="text-3xl font-bold text-yellow-700">
                  {stats.passed_assessments}
                </p>
              </div>
              <div className="p-3 bg-yellow-200 rounded-xl">
                <TrophyIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-600 mb-2">
                  Average Score
                </p>
                <p className="text-3xl font-bold text-purple-700">
                  {stats.average_score}%
                </p>
              </div>
              <div className="p-3 bg-purple-200 rounded-xl">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header and Filters */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Assessments</h1>
          <p className="text-gray-600 mt-1">
            Complete assessments to test your knowledge
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
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
      <div className="space-y-4">
        {filteredAssessments.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'pending' ? 'No pending assessments' : 
               filter === 'completed' ? 'No completed assessments' : 
               'No assessments available'}
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "Assessments will appear here when they're assigned to your courses."
                : "Switch filters to see other assessments."
              }
            </p>
          </div>
        ) : (
          filteredAssessments.map((assessment) => {
            const status = getAssessmentStatus(assessment);
            const latestAttempt = assessment.last_attempt;

            return (
              <div
                key={assessment.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {assessment.title}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {assessment.course?.coursename}
                        </p>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${status.color}`}>
                        {status.text}
                      </span>
                    </div>

                    {assessment.description && (
                      <p className="text-gray-700 mb-4">{assessment.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        <span>{formatTimeLimit(assessment.time_limit)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <AcademicCapIcon className="w-4 h-4 mr-2" />
                        <span>{assessment.questions_count} questions</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <TrophyIcon className="w-4 h-4 mr-2" />
                        <span>{assessment.passing_score}% to pass</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">
                          {assessment.attempts?.length || 0}/{assessment.max_attempts} attempts
                        </span>
                      </div>
                    </div>

                    {/* Latest Attempt Info */}
                    {latestAttempt && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Latest Attempt
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(latestAttempt.submitted_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-bold ${getScoreBadgeColor(latestAttempt.percentage)}`}>
                              {latestAttempt.percentage}%
                            </span>
                            <p className={`text-xs px-2 py-1 rounded-full mt-1 ${latestAttempt.is_passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {latestAttempt.is_passed ? 'Passed' : 'Failed'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-6 flex flex-col space-y-2">
                    {assessment.has_active_attempt ? (
                      <button
                        onClick={() => handleStartAssessment(assessment)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <PlayIcon className="w-4 h-4 mr-2" />
                        Resume
                      </button>
                    ) : assessment.can_attempt ? (
                      <button
                        onClick={() => handleStartAssessment(assessment)}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <PlayIcon className="w-4 h-4 mr-2" />
                        {assessment.attempts_count && assessment.attempts_count > 0 ? 'Retake' : 'Start'}
                      </button>
                    ) : (
                      <span className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
                        No attempts left
                      </span>
                    )}

                    {latestAttempt && (
                      <button
                        onClick={() => handleViewResults(assessment.id, latestAttempt.id)}
                        className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        View Results
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}