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
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckSolid } from "@heroicons/react/24/solid";
import {
  TraineeProgress,
  CourseProgressResponse,
  getCourseProgress,
  markModuleAsStarted,
  markModuleAsCompleted,
  updateModuleProgress,
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
    isFullscreen?: boolean;
  }>({
    isOpen: false,
    url: "",
    title: "",
    contentId: undefined,
    startTime: undefined,
    isFullscreen: false,
  });
  const [viewingContent, setViewingContent] = useState<{
    contentId: number;
    startTime: number;
    totalTimeSpent: number;
  } | null>(null);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);
  const [timeInterval, setTimeInterval] = useState<NodeJS.Timeout | null>(null);

  // Load persistent session data on component mount
  useEffect(() => {
    const savedSession = localStorage.getItem("articulate_session");
    if (savedSession && user && progressData) {
      try {
        const sessionData = JSON.parse(savedSession);
        if (sessionData.userId === user.id && sessionData.contentId) {
          // Always get the latest time from the database for real-time accuracy
          const existingProgress = getContentProgress(sessionData.contentId);
          const existingTimeInSeconds = existingProgress
            ? existingProgress.time_spent * 60
            : 0;

          console.log(
            "Restoring session for content:",
            sessionData.contentId,
            "with",
            existingTimeInSeconds / 60,
            "minutes"
          );

          setViewingContent({
            contentId: sessionData.contentId,
            startTime: Date.now(), // Fresh start time for new session
            totalTimeSpent: existingTimeInSeconds, // Use latest database time
          });
        }
      } catch (error) {
        console.error("Error loading saved session:", error);
        localStorage.removeItem("articulate_session");
      }
    }
  }, [user, progressData]);

  // Save session data to localStorage whenever viewingContent changes
  useEffect(() => {
    if (viewingContent && user) {
      localStorage.setItem(
        "articulate_session",
        JSON.stringify({
          userId: user.id,
          contentId: viewingContent.contentId,
          startTime: viewingContent.startTime,
          totalTimeSpent: viewingContent.totalTimeSpent,
        })
      );
    } else {
      localStorage.removeItem("articulate_session");
    }
  }, [viewingContent, user]);

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

  // Time tracking effect with localStorage persistence
  useEffect(() => {
    if (viewingContent && articulateViewer.isOpen) {
      const interval = setInterval(() => {
        const currentSessionElapsed = Math.floor(
          (Date.now() - viewingContent.startTime) / 1000
        ); // seconds

        // Total session time = previously accumulated time + current session
        const totalSessionTime =
          viewingContent.totalTimeSpent + currentSessionElapsed;
        setCurrentSessionTime(totalSessionTime);
      }, 1000);

      setTimeInterval(interval);

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      if (timeInterval) {
        clearInterval(timeInterval);
        setTimeInterval(null);
      }
    }

    return () => {
      if (timeInterval) {
        clearInterval(timeInterval);
      }
    };
  }, [viewingContent, articulateViewer.isOpen]);

  // Auto-save progress periodically - every 1 minute
  useEffect(() => {
    if (!viewingContent || !user) return;

    const autoSaveInterval = setInterval(async () => {
      const currentSessionElapsed = Math.floor(
        (Date.now() - viewingContent.startTime) / 60000
      );
      const totalTimeSpent =
        Math.floor(viewingContent.totalTimeSpent / 60) + currentSessionElapsed;

      if (totalTimeSpent > 0) {
        try {
          console.log("Auto-saving progress:", totalTimeSpent, "minutes");

          await updateModuleProgress({
            trainee_id: user.id,
            course_content_id: viewingContent.contentId,
            completion_percentage: 50, // In progress
            time_spent: totalTimeSpent,
          });

          // DON'T reset startTime - keep it continuous for accurate session tracking
          // Only update totalTimeSpent to match what was saved to database
          setViewingContent((prev) =>
            prev
              ? {
                  ...prev,
                  totalTimeSpent: totalTimeSpent * 60, // Keep the original startTime intact
                }
              : null
          );

          // Save session data to localStorage for persistence
          const sessionData = {
            userId: user.id,
            contentId: viewingContent.contentId,
            startTime: viewingContent.startTime, // Keep original start time
            totalTimeSpent: totalTimeSpent * 60,
            lastSaved: Date.now(),
          };
          localStorage.setItem(
            `lms_session_${viewingContent.contentId}`,
            JSON.stringify(sessionData)
          );

          // Refresh progress data to get updated database values
          if (courseId && scheduleId) {
            const updatedProgress = await getCourseProgress(
              courseId,
              scheduleId
            );
            if (updatedProgress.success) {
              setProgressData(updatedProgress);
            }
          }

          console.log("Progress auto-saved successfully");
        } catch (error) {
          console.error("Error auto-saving progress:", error);
        }
      }
    }, 60000); // Save every 1 minute

    return () => clearInterval(autoSaveInterval);
  }, [viewingContent, user, courseId, scheduleId]);

  const handleStartModule = async (moduleId: number) => {
    if (!user) return;

    setActionLoading(moduleId);
    try {
      const response = await markModuleAsStarted({
        trainee_id: user.id,
        course_content_id: moduleId,
      });

      if (response.success) {
        // Check for localStorage session recovery first
        let existingTimeInSeconds = 0;
        const sessionKey = `lms_session_${moduleId}`;
        const savedSession = localStorage.getItem(sessionKey);

        if (savedSession) {
          try {
            const sessionData = JSON.parse(savedSession);
            // Only recover if it's from within the last hour
            if (Date.now() - sessionData.lastSaved < 3600000) {
              existingTimeInSeconds = sessionData.totalTimeSpent;
              console.log(
                "Recovered session time:",
                existingTimeInSeconds / 60,
                "minutes"
              );
            } else {
              localStorage.removeItem(sessionKey); // Remove stale session
            }
          } catch (error) {
            console.error("Error parsing saved session:", error);
            localStorage.removeItem(sessionKey);
          }
        }

        // Fallback to database progress if no valid session
        if (existingTimeInSeconds === 0) {
          const existingProgress = getContentProgress(moduleId);
          existingTimeInSeconds = existingProgress
            ? existingProgress.time_spent * 60
            : 0;
        }

        // Start time tracking with accumulated time
        setViewingContent({
          contentId: moduleId,
          startTime: Date.now(),
          totalTimeSpent: existingTimeInSeconds,
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
          // Check for localStorage session recovery first
          let existingTimeInSeconds = 0;
          const sessionKey = `lms_session_${content.id}`;
          const savedSession = localStorage.getItem(sessionKey);

          if (savedSession) {
            try {
              const sessionData = JSON.parse(savedSession);
              // Only recover if it's from within the last hour
              if (Date.now() - sessionData.lastSaved < 3600000) {
                existingTimeInSeconds = sessionData.totalTimeSpent;
                console.log(
                  "Recovered session time for content view:",
                  existingTimeInSeconds / 60,
                  "minutes"
                );
              } else {
                localStorage.removeItem(sessionKey); // Remove stale session
              }
            } catch (error) {
              console.error("Error parsing saved session:", error);
              localStorage.removeItem(sessionKey);
            }
          }

          // Fallback to database progress if no valid session
          if (existingTimeInSeconds === 0) {
            const existingProgress = getContentProgress(content.id);
            existingTimeInSeconds = existingProgress
              ? existingProgress.time_spent * 60
              : 0;
          }

          // Set up viewing content with accumulated time if not already tracking
          if (!viewingContent || viewingContent.contentId !== content.id) {
            setViewingContent({
              contentId: content.id,
              startTime: Date.now(),
              totalTimeSpent: existingTimeInSeconds,
            });
          }

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

  const toggleFullscreen = () => {
    setArticulateViewer((prev) => ({
      ...prev,
      isFullscreen: !prev.isFullscreen,
    }));
  };

  const saveCurrentProgress = async () => {
    if (!viewingContent || !user) return;

    const currentSessionElapsed = Math.floor(
      (Date.now() - viewingContent.startTime) / 60000
    );
    const totalTimeSpent =
      Math.floor(viewingContent.totalTimeSpent / 60) + currentSessionElapsed;

    if (totalTimeSpent > 0) {
      try {
        console.log(
          "Saving current progress on close:",
          totalTimeSpent,
          "minutes"
        );

        await updateModuleProgress({
          trainee_id: user.id,
          course_content_id: viewingContent.contentId,
          completion_percentage: 50, // In progress
          time_spent: totalTimeSpent,
        });

        // Update the accumulated time but keep the session continuous
        setViewingContent((prev) =>
          prev
            ? {
                ...prev,
                totalTimeSpent: totalTimeSpent * 60, // Update accumulated time
              }
            : null
        );
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    }
  };

  const formatSessionTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    // Always show format like "1h 32m 2s" or "32m 2s" or "2s"
    if (hours > 0) {
      if (minutes > 0 && secs > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
      } else if (minutes > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${hours}h`;
      }
    } else if (minutes > 0) {
      if (secs > 0) {
        return `${minutes}m ${secs}s`;
      } else {
        return `${minutes}m`;
      }
    } else {
      return `${secs}s`;
    }
  };

  const closeArticulateViewer = async () => {
    // Save progress before closing
    await saveCurrentProgress();

    const contentId = articulateViewer.contentId;

    // Clean up localStorage session on close (optional)
    if (contentId) {
      localStorage.removeItem(`lms_session_${contentId}`);
    }

    setArticulateViewer({
      isOpen: false,
      url: "",
      title: "",
      contentId: undefined,
      startTime: undefined,
      isFullscreen: false,
    });

    // Clear time tracking
    setCurrentSessionTime(0);
    setViewingContent(null);
    if (timeInterval) {
      clearInterval(timeInterval);
      setTimeInterval(null);
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

      {/* Udemy-style Articulate Viewer */}
      {articulateViewer.isOpen && (
        <div
          className={`fixed inset-0 bg-black z-50 ${
            articulateViewer.isFullscreen ? "" : ""
          } overflow-hidden`}
        >
          {/* Top Navigation Bar */}
          <div
            className={`bg-black/90 text-white flex items-center justify-between px-6 py-3 ${
              articulateViewer.isFullscreen
                ? "absolute top-0 left-0 right-0 z-10"
                : ""
            }`}
          >
            <div className="flex items-center space-x-4">
              <button
                onClick={closeArticulateViewer}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Exit course"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-3">
                <FilmIcon className="w-6 h-6 text-purple-400" />
                <div>
                  <h1 className="font-semibold text-lg">
                    {articulateViewer.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <span>
                      Session Time: {formatSessionTime(currentSessionTime)}
                    </span>
                    {viewingContent && <span>•</span>}
                    {viewingContent && (
                      <span>
                        Started:{" "}
                        {new Date(
                          viewingContent.startTime
                        ).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Action Buttons */}
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title={
                  articulateViewer.isFullscreen
                    ? "Exit fullscreen"
                    : "Enter fullscreen"
                }
              >
                {articulateViewer.isFullscreen ? (
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
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div
            className={`flex ${
              articulateViewer.isFullscreen
                ? "h-screen pt-16"
                : "h-[calc(100vh-5rem)]"
            }`}
            style={{
              height: articulateViewer.isFullscreen
                ? "calc(100vh - 64px)"
                : "calc(100vh - 80px)",
            }}
          >
            {/* Content Viewer */}
            <div className="flex-1 bg-gray-900">
              <iframe
                src={articulateViewer.url}
                className="w-full h-full border-none"
                title={articulateViewer.title}
                allow="fullscreen"
                scrolling="yes"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  display: "block",
                }}
              />
            </div>

            {/* Side Panel */}
            {!articulateViewer.isFullscreen && (
              <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
                {/* Panel Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">
                    Course Progress
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Track your learning journey
                  </p>
                </div>

                {/* Progress Stats */}
                <div className="p-4 space-y-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">
                        Session Time
                      </span>
                      <ClockIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-xl font-bold text-blue-900">
                      {formatSessionTime(currentSessionTime)}
                    </div>
                  </div>

                  {(() => {
                    const progress = articulateViewer.contentId
                      ? getContentProgress(articulateViewer.contentId)
                      : null;
                    return (
                      progress && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-900">
                              Total Time
                            </span>
                            <ClockIcon className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="text-xl font-bold text-green-900">
                            {formatTimeSpent(progress.time_spent)}
                          </div>
                        </div>
                      )
                    );
                  })()}

                  {articulateViewer.contentId && (
                    <button
                      onClick={() =>
                        handleCompleteModule(articulateViewer.contentId!)
                      }
                      disabled={actionLoading === articulateViewer.contentId}
                      className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>Mark as Complete</span>
                    </button>
                  )}
                </div>

                {/* Course Content List */}
                <div className="flex-1 overflow-y-auto p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Course Content
                  </h4>
                  <div className="space-y-2">
                    {courseContents
                      .sort((a, b) => a.order - b.order)
                      .map((content, index) => {
                        const progress = getContentProgress(content.id);
                        const isCurrentContent =
                          content.id === articulateViewer.contentId;

                        return (
                          <div
                            key={content.id}
                            className={`p-3 rounded-lg border transition-colors ${
                              isCurrentContent
                                ? "bg-blue-50 border-blue-200"
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-blue-600">
                                  {index + 1}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-medium truncate ${
                                    isCurrentContent
                                      ? "text-blue-900"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {content.title}
                                </p>
                                {progress && (
                                  <div className="flex items-center space-x-2 mt-1">
                                    <div className="w-16 bg-gray-200 rounded-full h-1">
                                      <div
                                        className="bg-green-400 h-1 rounded-full"
                                        style={{
                                          width: `${progress.completion_percentage}%`,
                                        }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {progress.completion_percentage}%
                                    </span>
                                  </div>
                                )}
                              </div>
                              {progress?.status === "completed" && (
                                <CheckSolid className="w-4 h-4 text-green-500" />
                              )}
                              {isCurrentContent && (
                                <PlayIcon className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
