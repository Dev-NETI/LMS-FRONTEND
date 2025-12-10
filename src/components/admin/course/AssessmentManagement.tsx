"use client";

import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import {
  getQuestionsByCourse,
  Question,
} from "@/src/services/questionBankService";
import {
  Assessment,
  getAssessmentsByCourse,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getCourseSchedules,
  assignAssessmentToSchedules,
  removeAssessmentFromSchedule,
} from "@/src/services/assessmentService";

interface AssessmentManagementProps {
  courseId: number;
}

interface Schedule {
  scheduleid: number;
  batchno: string;
  startdateformat: string;
  enddateformat: string;
}

interface AssignedSchedule {
  schedule_id: number;
  schedule_name: string;
  schedule_code: string;
  available_from?: string;
  available_until?: string;
}

export default function AssessmentManagement({
  courseId,
}: AssessmentManagementProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<number | null>(
    null
  );
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<number[]>([]);
  const [scheduleAssignmentData, setScheduleAssignmentData] = useState({
    available_from: "",
    available_until: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    time_limit: 60,
    max_attempts: 3,
    passing_score: 70,
    is_active: true,
    is_randomized: false,
    show_results_immediately: true,
  });

  useEffect(() => {
    fetchAssessments();
    fetchQuestions();
    fetchSchedules();
  }, [courseId]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await getAssessmentsByCourse(courseId);

      if (response.success) {
        setAssessments(response.data || []);
      }
    } catch (err) {
      console.error("Error fetching assessments:", err);
      setError("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await getQuestionsByCourse(courseId);
      setQuestions(response.data);

      console.log(response.data);
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await getCourseSchedules(courseId);
      if (response.success) {
        setSchedules(response.data);
      }
    } catch (err) {
      console.error("Error fetching schedules:", err);
    }
  };

  const handleCreateAssessment = async () => {
    try {
      const response = await createAssessment(courseId, {
        ...formData,
        questions: selectedQuestions,
      });

      if (response.success) {
        setAssessments([response.data, ...assessments]);
        setShowCreateModal(false);
        setShowQuestionSelector(false);
        setSelectedQuestions([]);
        setFormData({
          title: "",
          description: "",
          instructions: "",
          time_limit: 60,
          max_attempts: 3,
          passing_score: 70,
          is_active: true,
          is_randomized: false,
          show_results_immediately: true,
        });
        setError(null);
      }
    } catch (err: any) {
      console.error("Error creating assessment:", err);
      setError(err.message || "Failed to create assessment");
    }
  };

  const handleToggleActive = async (
    assessmentId: number,
    isActive: boolean
  ) => {
    try {
      const response = await updateAssessment(assessmentId, {
        is_active: !isActive,
      });

      if (response.success) {
        setAssessments(
          assessments.map((assessment) =>
            assessment.id === assessmentId
              ? { ...assessment, is_active: !isActive }
              : assessment
          )
        );
      }
    } catch (err) {
      console.error("Error updating assessment:", err);
    }
  };

  const handleDeleteAssessment = async (assessmentId: number) => {
    if (!confirm("Are you sure you want to delete this assessment?")) return;

    try {
      const response = await deleteAssessment(assessmentId);

      if (response.success) {
        setAssessments(
          assessments.filter((assessment) => assessment.id !== assessmentId)
        );
      }
    } catch (err) {
      console.error("Error deleting assessment:", err);
    }
  };

  const handleQuestionSelection = (questionId: number) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleScheduleSelection = (scheduleId: number) => {
    setSelectedScheduleIds((prev) =>
      prev.includes(scheduleId)
        ? prev.filter((id) => id !== scheduleId)
        : [...prev, scheduleId]
    );
  };

  const handleAssignToSchedules = async () => {
    if (!selectedAssessment || selectedScheduleIds.length === 0) return;

    try {
      const response = await assignAssessmentToSchedules(selectedAssessment, {
        schedule_ids: selectedScheduleIds,
        available_from: scheduleAssignmentData.available_from || null,
        available_until: scheduleAssignmentData.available_until || null,
      });

      if (response.success) {
        setShowScheduleModal(false);
        setSelectedScheduleIds([]);
        setScheduleAssignmentData({ available_from: "", available_until: "" });
        fetchAssessments(); // Refresh to show new assignments
        setError(null);
      }
    } catch (err: any) {
      console.error("Error assigning to schedules:", err);
      setError(err.response?.data?.message || "Failed to assign to schedules");
    }
  };

  const handleRemoveFromSchedule = async (
    assessmentId: number,
    scheduleId: number
  ) => {
    if (
      !confirm(
        "Are you sure you want to remove this assessment from the schedule?"
      )
    )
      return;

    try {
      const response = await removeAssessmentFromSchedule(
        assessmentId,
        scheduleId
      );

      if (response.success) {
        fetchAssessments(); // Refresh to show changes
      }
    } catch (err: any) {
      console.error("Error removing from schedule:", err);
      setError(err.response?.data?.message || "Failed to remove from schedule");
    }
  };

  const openScheduleAssignmentModal = (assessmentId: number) => {
    setSelectedAssessment(assessmentId);
    setShowScheduleModal(true);
  };

  // Helper functions for date constraints
  const getMinAvailableDate = () => {
    if (selectedScheduleIds.length === 0) return "";
    
    const selectedSchedules = schedules.filter(s => 
      selectedScheduleIds.includes(s.scheduleid)
    );
    
    if (selectedSchedules.length === 0) return "";
    
    // Get the earliest start date among selected schedules
    const earliestStart = selectedSchedules.reduce((earliest, schedule) => {
      const scheduleStart = new Date(schedule.startdateformat);
      return !earliest || scheduleStart < earliest ? scheduleStart : earliest;
    }, null as Date | null);
    
    return earliestStart ? earliestStart.toISOString().split('T')[0] : "";
  };

  const getMaxAvailableDate = () => {
    if (selectedScheduleIds.length === 0) return "";
    
    const selectedSchedules = schedules.filter(s => 
      selectedScheduleIds.includes(s.scheduleid)
    );
    
    if (selectedSchedules.length === 0) return "";
    
    // Get the latest end date among selected schedules
    const latestEnd = selectedSchedules.reduce((latest, schedule) => {
      const scheduleEnd = new Date(schedule.enddateformat);
      return !latest || scheduleEnd > latest ? scheduleEnd : latest;
    }, null as Date | null);
    
    return latestEnd ? latestEnd.toISOString().split('T')[0] : "";
  };

  const getScheduleDateRangeText = () => {
    if (selectedScheduleIds.length === 0) return "No schedules selected";
    
    const selectedSchedules = schedules.filter(s => 
      selectedScheduleIds.includes(s.scheduleid)
    );
    
    if (selectedSchedules.length === 0) return "No schedules selected";
    
    const minDate = getMinAvailableDate();
    const maxDate = getMaxAvailableDate();
    
    // Check if all schedules are same day
    const isSameDay = minDate === maxDate;
    
    if (selectedSchedules.length === 1) {
      const schedule = selectedSchedules[0];
      const startDate = new Date(schedule.startdateformat).toLocaleDateString();
      const endDate = new Date(schedule.enddateformat).toLocaleDateString();
      
      if (startDate === endDate) {
        return `${startDate} (Single day schedule)`;
      } else {
        return `${startDate} - ${endDate}`;
      }
    } else {
      if (isSameDay) {
        return `${new Date(minDate).toLocaleDateString()} (All schedules on same day)`;
      } else {
        return `${new Date(minDate).toLocaleDateString()} - ${new Date(maxDate).toLocaleDateString()} (across ${selectedSchedules.length} schedules)`;
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading assessments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Course Assessments
          </h2>
          <p className="text-gray-600">Manage assessments for this course</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Assessment
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 gap-6">
        {assessments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No assessments
            </h3>
            <p className="mt-1 text-gray-500">
              Get started by creating your first assessment.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Assessment
            </button>
          </div>
        ) : (
          assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {assessment.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assessment.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {assessment.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{assessment.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div className="flex items-center text-gray-600">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      {assessment.time_limit} minutes
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DocumentTextIcon className="w-4 h-4 mr-2" />
                      {assessment.questions_count} questions
                    </div>
                    <div className="flex items-center text-gray-600">
                      <AcademicCapIcon className="w-4 h-4 mr-2" />
                      {assessment.passing_score}% to pass
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="text-gray-600">
                        {assessment.max_attempts} attempts max
                      </span>
                    </div>
                  </div>

                  {/* Schedule Assignments */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Assigned Schedules:
                    </h4>
                    {(assessment as any).assigned_schedules?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {(assessment as any).assigned_schedules.map(
                          (schedule: AssignedSchedule) => (
                            <div
                              key={schedule.schedule_id}
                              className="flex items-center bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm"
                            >
                              <span className="mr-2">
                                {schedule.schedule_code} -{" "}
                                {schedule.schedule_name}
                              </span>
                              <button
                                onClick={() =>
                                  handleRemoveFromSchedule(
                                    assessment.id,
                                    schedule.schedule_id
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 ml-1"
                                title="Remove from schedule"
                              >
                                <XCircleIcon className="w-4 h-4" />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                        ⚠️ Not assigned to any schedule - trainees cannot access
                        this assessment
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => openScheduleAssignmentModal(assessment.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Assign to Schedules"
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      handleToggleActive(assessment.id, assessment.is_active)
                    }
                    className={`p-2 rounded-lg ${
                      assessment.is_active
                        ? "text-red-600 hover:bg-red-50"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                    title={assessment.is_active ? "Deactivate" : "Activate"}
                  >
                    {assessment.is_active ? (
                      <XCircleIcon className="w-5 h-5" />
                    ) : (
                      <CheckCircleIcon className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteAssessment(assessment.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Assessment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {showQuestionSelector
                  ? "Select Questions"
                  : "Create New Assessment"}
              </h3>

              {!showQuestionSelector ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assessment Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Enter assessment title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                      placeholder="Brief description of the assessment"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructions
                    </label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          instructions: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32"
                      placeholder="Detailed instructions for trainees"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Limit (minutes)
                      </label>
                      <input
                        type="number"
                        value={formData.time_limit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            time_limit: Number(e.target.value),
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Attempts
                      </label>
                      <input
                        type="number"
                        value={formData.max_attempts}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            max_attempts: Number(e.target.value),
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      value={formData.passing_score}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          passing_score: Number(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_randomized"
                        checked={formData.is_randomized}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_randomized: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="is_randomized"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Randomize question order
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="show_results_immediately"
                        checked={formData.show_results_immediately}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            show_results_immediately: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="show_results_immediately"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Show results immediately after submission
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setShowQuestionSelector(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Next: Select Questions
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      Select questions from the question bank to include in this
                      assessment. Selected: {selectedQuestions.length} questions
                    </p>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {questions
                      .filter((q) => q.is_active)
                      .map((question) => (
                        <div
                          key={question.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedQuestions.includes(question.id)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleQuestionSelection(question.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-2">
                                {question.question_text}
                              </h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="bg-gray-100 px-2 py-1 rounded">
                                  {question.question_type.replace("_", " ")}
                                </span>
                                <span>{question.points} points</span>
                                <span
                                  className={`px-2 py-1 rounded ${
                                    question.difficulty === "easy"
                                      ? "bg-green-100 text-green-800"
                                      : question.difficulty === "medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {question.difficulty}
                                </span>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={selectedQuestions.includes(question.id)}
                              onChange={() =>
                                handleQuestionSelection(question.id)
                              }
                              className="ml-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      onClick={() => setShowQuestionSelector(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCreateAssessment}
                      disabled={selectedQuestions.length === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Assessment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Assignment Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Assign Assessment to Schedules
              </h3>

              <div className="space-y-6">
                {/* Schedule Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Schedules ({selectedScheduleIds.length} selected)
                  </label>
                  <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
                    {schedules.map((schedule) => (
                      <div
                        key={schedule.scheduleid}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedScheduleIds.includes(schedule.scheduleid)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() =>
                          handleScheduleSelection(schedule.scheduleid)
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {schedule.batchno}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(
                                schedule.startdateformat
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(
                                schedule.enddateformat
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedScheduleIds.includes(
                              schedule.scheduleid
                            )}
                            onChange={() =>
                              handleScheduleSelection(schedule.scheduleid)
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Range Selection */}
                {selectedScheduleIds.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">
                      Assessment Availability Period
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Available From <span className="text-gray-500 font-normal">(optional)</span>
                        </label>
                        <input
                          type="date"
                          value={scheduleAssignmentData.available_from}
                          onChange={(e) =>
                            setScheduleAssignmentData(prev => ({
                              ...prev,
                              available_from: e.target.value
                            }))
                          }
                          min={getMinAvailableDate()}
                          max={getMaxAvailableDate()}
                          placeholder="Leave empty for schedule start date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Defaults to: {new Date(getMinAvailableDate()).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Available Until <span className="text-gray-500 font-normal">(optional)</span>
                        </label>
                        <input
                          type="date"
                          value={scheduleAssignmentData.available_until}
                          onChange={(e) =>
                            setScheduleAssignmentData(prev => ({
                              ...prev,
                              available_until: e.target.value
                            }))
                          }
                          min={scheduleAssignmentData.available_from || getMinAvailableDate()}
                          max={getMaxAvailableDate()}
                          placeholder="Leave empty for schedule end date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Defaults to: {new Date(getMaxAvailableDate()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm">
                        <strong>Note:</strong> The assessment will only be available to trainees 
                        within the date range you specify, and must be within the schedule's 
                        start and end dates.
                      </p>
                      <div className="mt-2 text-sm text-blue-700">
                        <strong>Schedule Date Range:</strong> {getScheduleDateRangeText()}
                      </div>
                      <div className="mt-2 text-sm text-blue-600">
                        💡 <strong>Tip:</strong> Leave both fields empty to automatically use the full schedule duration.
                      </div>
                    </div>
                  </div>
                )}

                {selectedScheduleIds.length === 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-amber-800 text-sm">
                      Please select at least one schedule to assign the
                      assessment.
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowScheduleModal(false);
                      setSelectedScheduleIds([]);
                      setScheduleAssignmentData({
                        available_from: "",
                        available_until: "",
                      });
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignToSchedules}
                    disabled={selectedScheduleIds.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Assign to Schedules
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
