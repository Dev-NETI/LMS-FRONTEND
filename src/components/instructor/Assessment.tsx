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
  const [assignmentData, setAssignmentData] =
    useState<ScheduleAssignmentData>({
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
    return assessment.assigned_schedules?.some(
      (schedule) => schedule.schedule_id === scheduleId
    ) || false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
          <p className="text-gray-600">No assessments found for this course</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Course Assessments
        </h2>
        <button
          onClick={fetchData}
          className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Assessments Grid */}
      <div className="grid gap-4">
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
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-6">
        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* Title and Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {assessment.title}
            </h3>
            {assessment.description && (
              <p className="text-sm text-gray-600">{assessment.description}</p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatItem label="Time Limit" value={`${assessment.time_limit} min`} />
            <StatItem label="Max Attempts" value={assessment.max_attempts} />
            <StatItem label="Passing Score" value={`${assessment.passing_score}%`} />
            <StatItem
              label="Status"
              value={assessment.is_active ? "Active" : "Inactive"}
              valueClassName={
                assessment.is_active ? "text-green-600" : "text-red-600"
              }
            />
          </div>

          {/* Questions Info */}
          {assessment.questions_count !== undefined && (
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-gray-500">Questions: </span>
                <span className="font-medium text-gray-900">
                  {assessment.questions_count}
                </span>
              </div>
              {assessment.total_points !== undefined && (
                <div>
                  <span className="text-gray-500">Total Points: </span>
                  <span className="font-medium text-gray-900">
                    {assessment.total_points}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Assigned Badge */}
          {isAssigned && (
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                ✓ Assigned to This Schedule
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          <button
            onClick={() => onAssign(assessment)}
            disabled={isAssigned}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isAssigned
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
            }`}
          >
            {isAssigned ? "Assigned" : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Stat Item Component
interface StatItemProps {
  label: string;
  value: string | number;
  valueClassName?: string;
}

function StatItem({ label, value, valueClassName = "" }: StatItemProps) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-sm font-medium ${valueClassName || "text-gray-900"}`}>
        {value}
      </p>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Assign Assessment to Schedule
          </h3>
          <p className="text-sm text-gray-600 mt-1">{assessment.title}</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Date Range */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Availability Period (Optional)
            </h4>
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

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
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
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Assignment Target
                </h4>
                <p className="text-sm text-blue-800">
                  This assessment will be assigned to schedule ID: {scheduleId}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Assigning..." : "Assign to Schedule"}
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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <p className="text-xs text-gray-500 mt-1.5">{helpText}</p>
    </div>
  );
}

export default Assessment;
