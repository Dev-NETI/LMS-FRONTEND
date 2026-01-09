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
  // State management
  const [assessments, setAssessments] = useState<AssessmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<AssessmentType | null>(null);

  // Assignment form state
  const [assignmentData, setAssignmentData] = useState<ScheduleAssignmentData>({
    available_from: "",
    available_until: "",
  });

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch assessments
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

  // Open assignment modal
  const handleOpenAssignModal = (assessment: AssessmentType) => {
    setSelectedAssessment(assessment);
    setShowAssignModal(true);

    // Reset form
    setAssignmentData({
      available_from: "",
      available_until: "",
    });
  };

  // Close assignment modal
  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedAssessment(null);
    setAssignmentData({
      available_from: "",
      available_until: "",
    });
  };

  // Handle date change
  const handleDateChange = (
    field: "available_from" | "available_until",
    value: string
  ) => {
    setAssignmentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Submit assignment
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
        fetchData(); // Refresh data
      } else {
        alert(response.message || "Failed to assign assessment");
      }
    } catch (err: any) {
      alert(err.message || "Failed to assign assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove assessment from schedule
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
        fetchData(); // Refresh data
      } else {
        alert(response.message || "Failed to remove assignment");
      }
    } catch (err: any) {
      alert(err.message || "Failed to remove assignment");
    }
  };

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (assessments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">No assessments found for this course</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Assessments</h2>
        <button
          onClick={fetchData}
          className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded"
        >
          Refresh
        </button>
      </div>

      {/* Assessments List */}
      <div className="grid gap-4">
        {assessments.map((assessment) => (
          <div
            key={assessment.id}
            className="bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">
                  {assessment.title}
                </h3>
                {assessment.description && (
                  <p className="text-gray-600 mb-4">{assessment.description}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Time Limit:</span>
                    <p className="font-medium">
                      {assessment.time_limit} minutes
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Max Attempts:</span>
                    <p className="font-medium">{assessment.max_attempts}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Passing Score:</span>
                    <p className="font-medium">{assessment.passing_score}%</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <p
                      className={`font-medium ${
                        assessment.is_active ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {assessment.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>

                {assessment.questions_count !== undefined && (
                  <div className="mt-4">
                    <span className="text-gray-500 text-sm">Questions: </span>
                    <span className="font-medium text-sm">
                      {assessment.questions_count}
                    </span>
                    {assessment.total_points !== undefined && (
                      <>
                        <span className="text-gray-500 text-sm ml-4">
                          Total Points:{" "}
                        </span>
                        <span className="font-medium text-sm">
                          {assessment.total_points}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="ml-4">
                <button
                  onClick={() => handleOpenAssignModal(assessment)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Assign to Schedule
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">
                Assign Assessment to Schedules
              </h3>
              <p className="text-gray-600 mt-1">{selectedAssessment.title}</p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Date Range */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">
                  Availability Period (Optional)
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Set when this assessment should be available to trainees in
                  this schedule. Leave blank for no time restrictions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available From
                    </label>
                    <input
                      type="datetime-local"
                      value={assignmentData.available_from}
                      onChange={(e) =>
                        handleDateChange("available_from", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      When the assessment becomes available
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Until
                    </label>
                    <input
                      type="datetime-local"
                      value={assignmentData.available_until}
                      onChange={(e) =>
                        handleDateChange("available_until", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Deadline for taking the assessment
                    </p>
                  </div>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h4 className="font-semibold text-blue-900">
                    Assignment Target
                  </h4>
                </div>
                <p className="text-sm text-blue-800">
                  This assessment will be assigned to the current schedule
                  (Schedule ID: {scheduleId})
                </p>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={handleCloseAssignModal}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAssignment}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Assigning..." : "Assign to Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Assessment;
