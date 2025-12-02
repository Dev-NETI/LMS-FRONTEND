"use client";

import React, { useState, useEffect } from "react";
import {
  TraineeProgress,
  TraineeProgressData,
  ProgressStatistics,
  getTraineeProgressBySchedule,
  getCourseProgress,
  getActivityLog,
  getStatusColor,
  getStatusText,
  formatTimeSpent,
  getProgressBarColor,
  ActivityLogEntry,
} from "@/src/services/traineeProgressService";
import {
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  EyeIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface ProgressMonitoringProps {
  scheduleId: number;
  scheduleName?: string;
}

export default function ProgressMonitoring({
  scheduleId,
  scheduleName,
}: ProgressMonitoringProps) {
  const [loading, setLoading] = useState(true);
  const [traineeData, setTraineeData] = useState<TraineeProgressData[]>([]);
  const [statistics, setStatistics] = useState<ProgressStatistics | null>(null);
  const [selectedTrainee, setSelectedTrainee] =
    useState<TraineeProgressData | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("progress");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);

  useEffect(() => {
    if (scheduleId) {
      fetchProgressData();
    }
  }, [scheduleId, filterStatus]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getTraineeProgressBySchedule(
        scheduleId!,
        filterStatus === "all" ? undefined : filterStatus
      );

      console.log(response);
      if (response.success) {
        setStatistics(response.statistics);
        setCourseId(response.course_id);
        setTraineeData(response.progress_data);
      }
    } catch (error) {
      console.error("Error fetching progress data:", error);
      setError("Failed to load progress data");
    } finally {
      setLoading(false);
    }
  };

  const viewTraineeDetails = async (trainee: TraineeProgressData) => {
    try {
      setSelectedTrainee(trainee);

      // If we need more detailed progress, fetch it
      if (courseId && trainee.progress.length === 0) {
        const progressResponse = await getCourseProgress(
          courseId,
          trainee.trainee_id
        );
        if (progressResponse.success) {
          const updatedTrainee = {
            ...trainee,
            progress: progressResponse.modules,
          };
          setSelectedTrainee(updatedTrainee);
        }
      }
    } catch (error) {
      console.error("Error fetching trainee details:", error);
    }
  };

  const viewActivityLog = async (progress: TraineeProgress) => {
    try {
      const response = await getActivityLog(progress.id);
      if (response.success) {
        setActivityLog(response.activity_log || []);
        setShowActivityModal(true);
      }
    } catch (error) {
      console.error("Error fetching activity log:", error);
    }
  };

  const getSortedTrainees = () => {
    return [...traineeData]
      .filter((trainee) => {
        const matchesSearch =
          trainee.trainee_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          trainee.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "progress":
            return (
              b.overall_completion_percentage - a.overall_completion_percentage
            );
          case "time":
            return b.total_time_spent - a.total_time_spent;
          case "activity":
            if (!a.last_activity && !b.last_activity) return 0;
            if (!a.last_activity) return 1;
            if (!b.last_activity) return -1;
            return (
              new Date(b.last_activity).getTime() -
              new Date(a.last_activity).getTime()
            );
          case "name":
            return a.trainee_name.localeCompare(b.trainee_name);
          default:
            return 0;
        }
      });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredTrainees = getSortedTrainees();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Progress Monitoring
            </h2>
            {scheduleName && (
              <p className="text-sm text-gray-600 mt-1">{scheduleName}</p>
            )}
          </div>
          <div className="flex space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="not_started">Not Started</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="progress">Sort by Progress</option>
              <option value="time">Sort by Time Spent</option>
              <option value="activity">Sort by Last Activity</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Trainees
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statistics.total_trainees}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statistics.completed_trainees}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Time</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatTimeSpent(statistics.total_time_spent)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Avg. Completion
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statistics.average_completion.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trainees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Trainee Progress Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Trainee Progress
          </h3>
        </div>

        {filteredTrainees.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No trainee progress data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trainee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modules
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrainees.map((trainee) => (
                  <tr key={trainee.trainee_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {trainee.trainee_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {trainee.trainee_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {trainee.email}
                          </div>
                          {trainee.rank && (
                            <div className="text-xs text-gray-400">
                              {trainee.rank}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className={`h-2 rounded-full ${getProgressBarColor(
                              trainee.overall_completion_percentage
                            )}`}
                            style={{
                              width: `${trainee.overall_completion_percentage}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 min-w-max">
                          {trainee.overall_completion_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {trainee.completed_modules} / {trainee.total_modules}
                      </div>
                      <div className="text-xs text-gray-500">
                        {trainee.total_modules - trainee.completed_modules}{" "}
                        remaining
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatTimeSpent(trainee.total_time_spent)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {trainee.last_activity
                          ? new Date(trainee.last_activity).toLocaleDateString()
                          : "Never"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => viewTraineeDetails(trainee)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trainee Details Modal */}
      {selectedTrainee && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-2/3 max-w-4xl shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Progress Details - {selectedTrainee.trainee_name}
              </h3>
              <button
                onClick={() => setSelectedTrainee(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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

            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedTrainee.total_modules}
                </div>
                <div className="text-sm text-blue-600">Total Modules</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {selectedTrainee.completed_modules}
                </div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {selectedTrainee.in_progress_modules}
                </div>
                <div className="text-sm text-yellow-600">In Progress</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-600">
                  {formatTimeSpent(selectedTrainee.total_time_spent)}
                </div>
                <div className="text-sm text-gray-600">Time Spent</div>
              </div>
            </div>

            {/* Module Progress List */}
            <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-900">
                Module Progress
              </h4>
              {selectedTrainee.progress.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No module progress available
                </p>
              ) : (
                selectedTrainee.progress.map((progress) => (
                  <div
                    key={progress.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900">
                          {progress.course_content?.title || "Unknown Module"}
                        </h5>
                        <div className="flex items-center space-x-4 mt-2">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              progress.status
                            )}`}
                          >
                            {getStatusText(progress.status)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {progress.completion_percentage}% complete
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeSpent(progress.time_spent)} spent
                          </span>
                          {progress.last_activity && (
                            <span className="text-xs text-gray-500">
                              Last:{" "}
                              {new Date(
                                progress.last_activity
                              ).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => viewActivityLog(progress)}
                        className="text-gray-400 hover:text-gray-600 ml-4"
                        title="View Activity Log"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedTrainee(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-11/12 md:w-1/2 max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Activity Log
              </h3>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activityLog.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No activity recorded
                </p>
              ) : (
                activityLog.map((entry, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-blue-200 pl-4 py-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {entry.activity}
                        </p>
                        {entry.metadata &&
                          Object.keys(entry.metadata).length > 0 && (
                            <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                              {JSON.stringify(entry.metadata, null, 2)}
                            </pre>
                          )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowActivityModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredTrainees.length === 0 && !loading && !error && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No trainees found
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? "Try adjusting your search to see more results."
              : "No trainees are enrolled in this schedule yet."}
          </p>
        </div>
      )}
    </div>
  );
}
