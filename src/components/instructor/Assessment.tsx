import React, { useState, useEffect } from "react";
import {
  getAssessmentsByCourse,
  assignAssessmentToSchedules,
  removeAssessmentFromSchedule,
  Assessment as AssessmentType,
} from "@/services/assessmentService";

interface AssessmentResultsProps {
  courseId: number;
  scheduleId: number;
}

interface ScheduleAssignmentData {
  available_from: string;
  available_until: string;
}

function Assessment({ courseId, scheduleId }: AssessmentResultsProps) {
  const [assessments, setAssessments] = useState<AssessmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<AssessmentType | null>(null);
  const [assignmentData, setAssignmentData] = useState<ScheduleAssignmentData>({
    available_from: "",
    available_until: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const assessmentsResponse = await getAssessmentsByCourse(courseId);

      if (assessmentsResponse.success) {
        setAssessments(assessmentsResponse.data || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignModal = (assessment: AssessmentType) => {
    setSelectedAssessment(assessment);
    setShowAssignModal(true);
    setAssignmentData({
      available_from: "",
      available_until: "",
    });
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedAssessment(null);
    setAssignmentData({
      available_from: "",
      available_until: "",
    });
  };

  const handleDateChange = (
    field: "available_from" | "available_until",
    value: string
  ) => {
    setAssignmentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssessment) return;

    try {
      setIsSubmitting(true);

      const response = await assignAssessmentToSchedules(
        selectedAssessment.id,
        {
          schedule_ids: [scheduleId],
          available_from: assignmentData.available_from || null,
          available_until: assignmentData.available_until || null,
        }
      );

      if (response.success) {
        alert("Assessment assigned successfully!");
        handleCloseAssignModal();
        fetchData();
      } else {
        alert(response.message || "Failed to assign assessment");
      }
    } catch (err: any) {
      alert(err.message || "Failed to assign assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAssignment = async (
    assessmentId: number,
    scheduleId: number
  ) => {
    if (!confirm("Are you sure you want to remove this assignment?")) return;

    try {
      const response = await removeAssessmentFromSchedule(
        assessmentId,
        scheduleId
      );

      if (response.success) {
        alert("Assignment removed successfully!");
        fetchData();
      } else {
        alert(response.message || "Failed to remove assignment");
      }
    } catch (err: any) {
      alert(err.message || "Failed to remove assignment");
    }
  };

  const isAssessmentAssigned = (assessment: AssessmentType): boolean => {
    return (
      assessment.assigned_schedules?.some(
        (schedule) => schedule.schedule_id === scheduleId
      ) || false
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Header */}
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="h-7 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
          <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Skeleton Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Skeleton Assessment Cards */}
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonAssessmentCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[500px] p-6">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-red-600 mb-6 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px] p-6">
        <div className="text-center max-w-md">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Assessments Found
          </h3>
          <p className="text-gray-600 mb-6">
            There are no assessments available for this course yet.
          </p>
          <button
            onClick={fetchData}
            className="px-6 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Assessment</h2>
          <p className="text-sm text-gray-600 mt-1">
            Assigning the assessment to a schedule ensures it is automatically
            available to the intended participants according to the defined
            timeline.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-900">
                {assessments.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-gray-900">
                {assessments.filter((a) => isAssessmentAssigned(a)).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <svg
                className="w-6 h-6 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {assessments.filter((a) => !isAssessmentAssigned(a)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assessments Grid */}
      <div className="grid gap-6">
        {assessments.map((assessment) => {
          const isAssigned = isAssessmentAssigned(assessment);

          return (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              isAssigned={isAssigned}
              onAssign={handleOpenAssignModal}
            />
          );
        })}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedAssessment && (
        <AssignmentModal
          assessment={selectedAssessment}
          scheduleId={scheduleId}
          assignmentData={assignmentData}
          isSubmitting={isSubmitting}
          onClose={handleCloseAssignModal}
          onDateChange={handleDateChange}
          onSubmit={handleSubmitAssignment}
        />
      )}
    </div>
  );
}

// Skeleton Assessment Card Component
function SkeletonAssessmentCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        {/* Content */}
        <div className="flex-1 space-y-5 w-full">
          {/* Title and Description with Icon */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5 mt-1"></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-lg p-3 border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>

          {/* Questions and Points */}
          <div className="flex gap-4 text-sm bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0 w-full lg:w-auto">
          <div className="w-full lg:w-32 h-11 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

// Assessment Card Component
interface AssessmentCardProps {
  assessment: AssessmentType;
  isAssigned: boolean;
  onAssign: (assessment: AssessmentType) => void;
}

function AssessmentCard({
  assessment,
  isAssigned,
  onAssign,
}: AssessmentCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        {/* Content */}
        <div className="flex-1 space-y-5 w-full">
          {/* Title and Description with Icon */}
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg flex-shrink-0 ${
                isAssigned ? "bg-green-100" : "bg-blue-100"
              }`}
            >
              <svg
                className={`w-6 h-6 ${
                  isAssigned ? "text-green-600" : "text-blue-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {assessment.title}
              </h3>
              {assessment.description && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {assessment.description}
                </p>
              )}
            </div>
          </div>

          {/* Stats Grid with Icons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatItemEnhanced
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              label="Time Limit"
              value={`${assessment.time_limit} min`}
              bgColor="bg-purple-50"
              iconColor="text-purple-600"
            />
            <StatItemEnhanced
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              }
              label="Max Attempts"
              value={assessment.max_attempts}
              bgColor="bg-orange-50"
              iconColor="text-orange-600"
            />
            <StatItemEnhanced
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              }
              label="Passing Score"
              value={`${assessment.passing_score}%`}
              bgColor="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <StatItemEnhanced
              icon={
                assessment.is_active ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )
              }
              label="Status"
              value={assessment.is_active ? "Active" : "Inactive"}
              bgColor={assessment.is_active ? "bg-green-50" : "bg-red-50"}
              iconColor={
                assessment.is_active ? "text-green-600" : "text-red-600"
              }
              valueClassName={
                assessment.is_active ? "text-green-600" : "text-red-600"
              }
            />
          </div>

          {/* Questions and Points */}
          {assessment.questions_count !== undefined && (
            <div className="flex flex-wrap gap-4 text-sm bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-gray-600">Questions:</span>
                <span className="font-semibold text-gray-900">
                  {assessment.questions_count}
                </span>
              </div>
              {assessment.total_points !== undefined && (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <span className="text-gray-600">Total Points:</span>
                  <span className="font-semibold text-gray-900">
                    {assessment.total_points}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0 w-full lg:w-auto">
          <button
            onClick={() => onAssign(assessment)}
            disabled={isAssigned}
            className={`w-full lg:w-auto px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 transform ${
              isAssigned
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            }`}
          >
            {isAssigned ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Already Assigned
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Assign Now
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Enhanced Stat Item Component
interface StatItemEnhancedProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bgColor: string;
  iconColor: string;
  valueClassName?: string;
}

function StatItemEnhanced({
  icon,
  label,
  value,
  bgColor,
  iconColor,
  valueClassName = "text-gray-900",
}: StatItemEnhancedProps) {
  return (
    <div className={`${bgColor} rounded-lg p-3 border border-gray-200`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={iconColor}>{icon}</div>
        <p className="text-xs text-gray-600 font-medium">{label}</p>
      </div>
      <p className={`text-lg font-bold ${valueClassName}`}>{value}</p>
    </div>
  );
}

// Assignment Modal Component
interface AssignmentModalProps {
  assessment: AssessmentType;
  scheduleId: number;
  assignmentData: ScheduleAssignmentData;
  isSubmitting: boolean;
  onClose: () => void;
  onDateChange: (
    field: "available_from" | "available_until",
    value: string
  ) => void;
  onSubmit: () => void;
}

function AssignmentModal({
  assessment,
  scheduleId,
  assignmentData,
  isSubmitting,
  onClose,
  onDateChange,
  onSubmit,
}: AssignmentModalProps) {
  return (
    <div className="fixed inset-0 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden transform transition-all animate-slideUp">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Assign Assessment</h3>
              </div>
              <p className="text-blue-100 font-medium ml-14">
                {assessment.title}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Assessment Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="text-xs text-purple-600 font-medium mb-1">
                Time Limit
              </p>
              <p className="text-sm font-bold text-purple-900">
                {assessment.time_limit} min
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <p className="text-xs text-orange-600 font-medium mb-1">
                Max Attempts
              </p>
              <p className="text-sm font-bold text-orange-900">
                {assessment.max_attempts}
              </p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
              <p className="text-xs text-emerald-600 font-medium mb-1">
                Passing Score
              </p>
              <p className="text-sm font-bold text-emerald-900">
                {assessment.passing_score}%
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-600 font-medium mb-1">
                Questions
              </p>
              <p className="text-sm font-bold text-blue-900">
                {assessment.questions_count || "N/A"}
              </p>
            </div>
          </div>

          {/* Date Range Section */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h4 className="text-base font-bold text-gray-900">
                Availability Period
              </h4>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">
                Optional
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Set when this assessment should be available to trainees. Leave
              blank for no time restrictions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DateInput
                label="Available From"
                value={assignmentData.available_from}
                onChange={(value) => onDateChange("available_from", value)}
                helpText="When the assessment becomes available"
              />
              <DateInput
                label="Available Until"
                value={assignmentData.available_until}
                onChange={(value) => onDateChange("available_until", value)}
                helpText="Deadline for taking the assessment"
              />
            </div>
          </div>
        </div>

        {/* Footer with Enhanced Buttons */}
        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Assigning...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Assign to Schedule
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Date Input Component
interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helpText: string;
}

function DateInput({ label, value, onChange, helpText }: DateInputProps) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
        <svg
          className="w-4 h-4 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {label}
      </label>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
      />
      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {helpText}
      </p>
    </div>
  );
}

export default Assessment;
