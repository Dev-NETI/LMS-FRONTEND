"use client";

import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  BookOpenIcon,
  TrophyIcon,
  CalendarIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  FilmIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  PauseIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckSolid } from "@heroicons/react/24/solid";
import {
  TraineeProgress,
  CourseProgressResponse,
  getCourseProgress,
  markModuleAsStarted,
  markModuleAsCompleted,
  formatTimeSpent,
  getStatusColor,
  getStatusText,
  getProgressBarColor,
} from "@/src/services/traineeProgressService";
import {
  CourseContent,
  getCourseContentForTrainee,
  getArticulateContentForTrainee,
  viewCourseContent,
  downloadCourseContent,
} from "@/src/services/courseContentService";
import { useAuth } from "@/src/context/AuthContext";

interface TraineeProgressTrackingProps {
  scheduleId: number;
  courseId: number;
}

export default function TraineeProgressTracking({
  scheduleId,
  courseId,
}: TraineeProgressTrackingProps) {
  const { user } = useAuth();
  const [progressData, setProgressData] =
    useState<CourseProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<TraineeProgress | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [courseContents, setCourseContents] = useState<CourseContent[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [articulateViewer, setArticulateViewer] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
    contentId?: number;
    startTime?: number;
  }>({
    isOpen: false,
    url: "",
    title: "",
    contentId: undefined,
    startTime: undefined,
  });
  const [viewingContent, setViewingContent] = useState<{
    contentId: number;
    startTime: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !courseId) return;

      console.log(user);

      setIsLoading(true);
      setError(null);

      try {
        // Fetch both progress and course contents
        const [progressResponse, contentResponse] = await Promise.all([
          getCourseProgress(courseId, scheduleId),
          getCourseContentForTrainee(courseId),
        ]);

        if (progressResponse.success) {
          setProgressData(progressResponse);
        } else {
          setError("Failed to load progress data");
        }

        if (contentResponse.success) {
          setCourseContents(contentResponse.data);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch data";
        setError(errorMessage);
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, courseId, scheduleId]);

  // Handle Escape key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (articulateViewer.isOpen) {
          closeArticulateViewer();
        } else if (selectedModule) {
          setSelectedModule(null);
        }
      }
    };

    if (articulateViewer.isOpen || selectedModule) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [articulateViewer.isOpen, selectedModule]);

  const handleStartModule = async (moduleId: number) => {
    if (!user) return;

    setActionLoading(moduleId);
    try {
      const response = await markModuleAsStarted({
        trainee_id: user.id,
        course_content_id: moduleId,
      });

      if (response.success) {
        // Start time tracking
        setViewingContent({
          contentId: moduleId,
          startTime: Date.now(),
        });

        // Find and launch the content
        const content = courseContents.find((c) => c.id === moduleId);
        if (content) {
          await handleContentView(content);
        }

        // Refresh progress data
        const updatedProgress = await getCourseProgress(courseId, scheduleId);
        if (updatedProgress.success) {
          setProgressData(updatedProgress);
        }
      }
    } catch (error) {
      console.error("Error starting module:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteModule = async (
    moduleId: number,
    customTimeSpent?: number
  ) => {
    if (!user) return;

    setActionLoading(moduleId);
    try {
      // Calculate time spent if currently viewing this content
      let timeSpent = customTimeSpent;
      if (!timeSpent && viewingContent?.contentId === moduleId) {
        const timeElapsed = Math.floor(
          (Date.now() - viewingContent.startTime) / 60000
        ); // Convert to minutes
        timeSpent = Math.max(1, timeElapsed); // Minimum 1 minute
      }

      const response = await markModuleAsCompleted({
        trainee_id: user.id,
        course_content_id: moduleId,
        time_spent: timeSpent,
      });

      if (response.success) {
        // Clear viewing content tracking
        setViewingContent(null);

        // Close Articulate viewer if open
        if (
          articulateViewer.isOpen &&
          articulateViewer.contentId === moduleId
        ) {
          setArticulateViewer({
            isOpen: false,
            url: "",
            title: "",
            contentId: undefined,
            startTime: undefined,
          });
        }

        // Refresh progress data
        const updatedProgress = await getCourseProgress(courseId, scheduleId);
        if (updatedProgress.success) {
          setProgressData(updatedProgress);
        }
      }
    } catch (error) {
      console.error("Error completing module:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleContentView = async (content: CourseContent) => {
    if (content.content_type === "url") {
      window.open(content.url, "_blank");
    } else if (content.file_type === "articulate_html") {
      try {
        const response = await getArticulateContentForTrainee(content.id);
        if (response.success) {
          setArticulateViewer({
            isOpen: true,
            url: response.index_url,
            title: response.title,
            contentId: response.content_id,
            startTime: Date.now(),
          });
        }
      } catch (error) {
        console.error("Error viewing Articulate content:", error);
        setError("Failed to load Articulate content");
      }
    } else {
      try {
        const url = await viewCourseContent(content.id);
        window.open(url, "_blank");
      } catch (error) {
        console.error("Error viewing content:", error);
        setError("Failed to view content");
      }
    }
  };

  const closeArticulateViewer = () => {
    const contentId = articulateViewer.contentId;
    const startTime = articulateViewer.startTime;

    setArticulateViewer({
      isOpen: false,
      url: "",
      title: "",
      contentId: undefined,
      startTime: undefined,
    });

    // Update time spent if this was being tracked
    if (contentId && startTime && viewingContent?.contentId === contentId) {
      const timeElapsed = Math.floor((Date.now() - startTime) / 60000); // Convert to minutes
      setViewingContent((prev) =>
        prev ? { ...prev, startTime: Date.now() - timeElapsed * 60000 } : null
      );
    }
  };

  const openInNewWindow = () => {
    if (articulateViewer.url) {
      window.open(articulateViewer.url, "_blank");
    }
  };

  const getContentIcon = (content: CourseContent, status?: string) => {
    if (status === "completed") {
      return <CheckSolid className="w-6 h-6 text-green-600" />;
    }

    if (content.content_type === "url") {
      return <BookOpenIcon className="w-6 h-6 text-blue-500" />;
    }

    if (content.file_type === "articulate_html") {
      return <FilmIcon className="w-6 h-6 text-purple-500" />;
    }

    return <DocumentArrowDownIcon className="w-6 h-6 text-gray-500" />;
  };

  const getContentProgress = (contentId: number) => {
    return progressData?.modules.find((m) => m.course_content_id === contentId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gray-300 rounded mr-3"></div>
              <div className="h-6 bg-gray-300 rounded w-48"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !progressData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load progress
          </h3>
          <p className="text-gray-600">
            {error || "Unable to load progress data"}
          </p>
        </div>
      </div>
    );
  }

  const { overview, modules } = progressData;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-blue-100 rounded-full mr-3">
            <ChartBarIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">My Progress</h2>
            <p className="text-sm text-gray-600 mt-1">
              Track your learning journey and achievements
            </p>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Total Modules
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  {overview.total_modules}
                </p>
              </div>
              <BookOpenIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-700">
                  {overview.completed_modules}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-yellow-700">
                  {overview.in_progress_modules}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  Time Spent
                </p>
                <p className="text-2xl font-bold text-purple-700">
                  {formatTimeSpent(overview.total_time_spent)}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              Overall Completion
            </h3>
            <span className="text-sm font-medium text-gray-900">
              {overview.overall_completion_percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(
                overview.overall_completion_percentage
              )}`}
              style={{ width: `${overview.overall_completion_percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Achievement Badge */}
        {overview.overall_completion_percentage === 100 && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <TrophyIcon className="w-8 h-8" />
              <div>
                <h3 className="font-bold text-lg">Congratulations!</h3>
                <p className="text-yellow-100">
                  You have completed all course modules. Well done!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Course Content List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Course Content
        </h3>

        {courseContents.length === 0 ? (
          <div className="text-center py-8">
            <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No content available
            </h4>
            <p className="text-gray-600">
              Course content will appear here when it becomes available.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {courseContents
              .sort((a, b) => a.order - b.order)
              .map((content, index) => {
                const progress = getContentProgress(content.id);
                const isCurrentlyViewing =
                  viewingContent?.contentId === content.id;

                return (
                  <div
                    key={content.id}
                    className={`border rounded-lg p-4 hover:shadow-sm transition-all ${
                      isCurrentlyViewing
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {index + 1}
                          </span>
                        </div>

                        <div className="flex-shrink-0">
                          {getContentIcon(content, progress?.status)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900 truncate">
                              {content.title}
                            </h4>
                            {progress && (
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                  progress.status
                                )}`}
                              >
                                {getStatusText(progress.status)}
                              </span>
                            )}
                            {content.content_type === "url" && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-600">
                                External Link
                              </span>
                            )}
                            {content.file_type === "articulate_html" && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-600">
                                Articulate
                              </span>
                            )}
                          </div>

                          {content.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {content.description}
                            </p>
                          )}

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {progress && (
                              <>
                                <span>
                                  {progress.completion_percentage}% complete
                                </span>
                                <span>
                                  {formatTimeSpent(progress.time_spent)} spent
                                </span>
                                {progress.last_activity && (
                                  <div className="flex items-center space-x-1">
                                    <CalendarIcon className="w-3 h-3" />
                                    <span>
                                      Last:{" "}
                                      {new Date(
                                        progress.last_activity
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                            {content.file_size && (
                              <span>{content.file_size_human}</span>
                            )}
                            {isCurrentlyViewing && (
                              <span className="text-blue-600 font-medium">
                                Currently viewing...
                              </span>
                            )}
                          </div>

                          {/* Progress Bar */}
                          {progress && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(
                                    progress.completion_percentage
                                  )}`}
                                  style={{
                                    width: `${progress.completion_percentage}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {(!progress || progress.status === "not_started") && (
                          <button
                            onClick={() => handleStartModule(content.id)}
                            disabled={actionLoading === content.id}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {content.file_type === "articulate_html" ? (
                              <PlayIcon className="w-4 h-4" />
                            ) : (
                              <PlayIcon className="w-4 h-4" />
                            )}
                            <span>Start</span>
                          </button>
                        )}

                        {progress && progress.status === "in_progress" && (
                          <>
                            <button
                              onClick={() => handleContentView(content)}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
                            >
                              {content.file_type === "articulate_html" ? (
                                <PlayIcon className="w-4 h-4" />
                              ) : (
                                <EyeIcon className="w-4 h-4" />
                              )}
                              <span>Continue</span>
                            </button>
                            <button
                              onClick={() => handleCompleteModule(content.id)}
                              disabled={actionLoading === content.id}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                              <span>Complete</span>
                            </button>
                          </>
                        )}

                        {progress && progress.status === "completed" && (
                          <button
                            onClick={() => handleContentView(content)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            <EyeIcon className="w-4 h-4" />
                            <span>Review</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Module Details Modal */}
      {selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-11/12 md:w-2/3 max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Module Details
              </h3>
              <button
                onClick={() => setSelectedModule(null)}
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

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {selectedModule.course_content?.title || "Module Title"}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(
                        selectedModule.status
                      )}`}
                    >
                      {getStatusText(selectedModule.status)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Progress:</span>
                    <span className="ml-2">
                      {selectedModule.completion_percentage}%
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Time Spent:
                    </span>
                    <span className="ml-2">
                      {formatTimeSpent(selectedModule.time_spent)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Last Activity:
                    </span>
                    <span className="ml-2">
                      {selectedModule.last_activity
                        ? new Date(
                            selectedModule.last_activity
                          ).toLocaleString()
                        : "Never"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedModule.course_content?.description && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">
                    Description
                  </h5>
                  <p className="text-gray-600">
                    {selectedModule.course_content.description}
                  </p>
                </div>
              )}

              {selectedModule.notes && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Notes</h5>
                  <p className="text-gray-600">{selectedModule.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setSelectedModule(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Articulate Content Viewer Modal */}
      {articulateViewer.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <h4 className="text-lg font-medium text-gray-900">
                    {articulateViewer.title}
                  </h4>
                  {viewingContent?.contentId === articulateViewer.contentId && (
                    <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      Time tracking active
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={openInNewWindow}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="Open in new window"
                  >
                    <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                  </button>
                  {articulateViewer.contentId && (
                    <button
                      onClick={() =>
                        handleCompleteModule(articulateViewer.contentId!)
                      }
                      disabled={actionLoading === articulateViewer.contentId}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Mark Complete</span>
                    </button>
                  )}
                  <button
                    onClick={closeArticulateViewer}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Close"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="relative" style={{ height: "calc(90vh - 80px)" }}>
                <iframe
                  src={articulateViewer.url}
                  className="w-full h-full border-none"
                  title={articulateViewer.title}
                  allow="fullscreen"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
