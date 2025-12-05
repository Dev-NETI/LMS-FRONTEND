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
  SparklesIcon,
  AcademicCapIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckSolid } from "@heroicons/react/24/solid";
import ArticulateViewer from "./ArticulateViewer";
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

          // Check if content is already completed to preserve status
          const currentProgress = getContentProgress(viewingContent.contentId);
          const completionPercentage =
            currentProgress?.status === "completed" ? 100 : 0;

          await updateModuleProgress({
            trainee_id: user.id,
            course_content_id: viewingContent.contentId,
            completion_percentage: completionPercentage, // Only 0% or 100% (completed)
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

    // Check if module is accessible (sequential validation)
    const sortedContents = courseContents.sort((a, b) => a.order - b.order);
    const moduleIndex = sortedContents.findIndex(
      (content) => content.id === moduleId
    );

    if (!isModuleAccessible(moduleIndex)) {
      const lockReason = getModuleLockReason(moduleIndex);
      alert(
        lockReason || "This module is locked. Complete previous modules first."
      );
      return;
    }

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
    // Check if module is accessible (sequential validation) - unless it's already in progress or completed
    const progress = getContentProgress(content.id);
    if (!progress || progress.status === "not_started") {
      const sortedContents = courseContents.sort((a, b) => a.order - b.order);
      const moduleIndex = sortedContents.findIndex((c) => c.id === content.id);

      if (!isModuleAccessible(moduleIndex)) {
        const lockReason = getModuleLockReason(moduleIndex);
        alert(
          lockReason ||
            "This module is locked. Complete previous modules first."
        );
        return;
      }
    }

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

        // Check if content is already completed to preserve status
        const currentProgress = getContentProgress(viewingContent.contentId);
        const completionPercentage =
          currentProgress?.status === "completed" ? 100 : 0;

        await updateModuleProgress({
          trainee_id: user.id,
          course_content_id: viewingContent.contentId,
          completion_percentage: completionPercentage, // Only 0% or 100% (completed)
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

  const isModuleAccessible = (contentIndex: number) => {
    // First module is always accessible
    if (contentIndex === 0) return true;

    // Check if previous module is completed
    const sortedContents = courseContents.sort((a, b) => a.order - b.order);
    const previousContent = sortedContents[contentIndex - 1];

    if (!previousContent) return true;

    const previousProgress = getContentProgress(previousContent.id);
    return previousProgress?.status === "completed";
  };

  const getModuleLockReason = (contentIndex: number) => {
    if (isModuleAccessible(contentIndex)) return null;

    const sortedContents = courseContents.sort((a, b) => a.order - b.order);
    const previousContent = sortedContents[contentIndex - 1];

    return `Complete "${previousContent?.title}" first to unlock this module`;
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
      {/* Enhanced Progress Overview */}
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-200 p-8 shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-4 shadow-lg">
              <AcademicCapIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                My Learning Progress
              </h2>
              <p className="text-gray-600 mt-1 flex items-center">
                <SparklesIcon className="w-4 h-4 mr-1" />
                Track your journey to excellence
              </p>
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="text-right">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {overview.overall_completion_percentage}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-2">
                  Total Modules
                </p>
                <p className="text-3xl font-bold text-blue-700">
                  {overview.total_modules}
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-xl">
                <BookOpenIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-600 mb-2">
                  Completed
                </p>
                <p className="text-3xl font-bold text-green-700">
                  {overview.completed_modules}
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-xl">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-6 border border-amber-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-600 mb-2">
                  In Progress
                </p>
                <p className="text-3xl font-bold text-amber-700">
                  {overview.in_progress_modules}
                </p>
              </div>
              <div className="p-3 bg-amber-200 rounded-xl">
                <ClockIcon className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-600 mb-2">
                  Time Spent
                </p>
                <p className="text-3xl font-bold text-purple-700">
                  {formatTimeSpent(overview.total_time_spent)}
                </p>
              </div>
              <div className="p-3 bg-purple-200 rounded-xl">
                <ClockIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Overall Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Overall Completion
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                {overview.overall_completion_percentage}%
              </span>
              {overview.overall_completion_percentage >= 75 && (
                <SparklesIcon className="w-5 h-5 text-yellow-500" />
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
            <div
              className={`h-4 rounded-full transition-all duration-700 shadow-sm ${getProgressBarColor(
                overview.overall_completion_percentage
              )}`}
              style={{ width: `${overview.overall_completion_percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Getting Started</span>
            <span>Halfway There</span>
            <span>Almost Done</span>
            <span>Completed!</span>
          </div>
        </div>

        {/* Enhanced Achievement Badge */}
        {overview.overall_completion_percentage === 100 && (
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white rounded-xl p-6 mb-8 shadow-xl border border-yellow-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <TrophyIcon className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">🎉 Congratulations!</h3>
                <p className="text-yellow-100">
                  You have completed all course modules. Exceptional work!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Course Content List */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Course Content</h3>
          <div className="text-sm text-gray-500">
            {courseContents.length} modules available
          </div>
        </div>

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
                const isAccessible = isModuleAccessible(index);
                const lockReason = getModuleLockReason(index);

                return (
                  <div
                    key={content.id}
                    className={`border rounded-xl p-6 transition-all duration-300 ${
                      !isAccessible
                        ? "border-gray-300 bg-gray-50 opacity-60"
                        : isCurrentlyViewing
                        ? "border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                            !isAccessible
                              ? "bg-gray-200 text-gray-400"
                              : isCurrentlyViewing
                              ? "bg-blue-200 text-blue-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {!isAccessible ? (
                            <LockClosedIcon className="w-4 h-4" />
                          ) : (
                            <span className="font-bold text-sm">
                              {index + 1}
                            </span>
                          )}
                        </div>

                        <div className="flex-shrink-0">
                          {!isAccessible ? (
                            <LockClosedIcon className="w-6 h-6 text-gray-400" />
                          ) : (
                            getContentIcon(content, progress?.status)
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-3">
                            <h4
                              className={`font-semibold truncate text-lg ${
                                !isAccessible
                                  ? "text-gray-500"
                                  : "text-gray-900"
                              }`}
                            >
                              {content.title}
                            </h4>
                            {!isAccessible && (
                              <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                Locked
                              </span>
                            )}
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
                              <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                External Link
                              </span>
                            )}
                            {content.file_type === "articulate_html" && (
                              <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                                Articulate
                              </span>
                            )}
                          </div>

                          {content.description && (
                            <p
                              className={`text-sm mb-2 ${
                                !isAccessible
                                  ? "text-gray-500"
                                  : "text-gray-600"
                              }`}
                            >
                              {content.description}
                            </p>
                          )}

                          {!isAccessible && lockReason && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                              <div className="flex items-center space-x-2">
                                <LockClosedIcon className="w-4 h-4 text-amber-600" />
                                <p className="text-sm text-amber-700 font-medium">
                                  {lockReason}
                                </p>
                              </div>
                            </div>
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
                                {progress.started_at && (
                                  <div className="flex items-center space-x-1">
                                    <CalendarIcon className="w-3 h-3" />
                                    <span>
                                      Started:{" "}
                                      {new Date(
                                        progress.started_at
                                      ).toLocaleDateString()}{" "}
                                      {new Date(
                                        progress.started_at
                                      ).toLocaleTimeString()}
                                    </span>
                                  </div>
                                )}
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

                          {/* Enhanced Progress Bar */}
                          {progress && (
                            <div className="mt-3">
                              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                                <div
                                  className={`h-3 rounded-full transition-all duration-500 shadow-sm ${getProgressBarColor(
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
                        {(!progress || progress.status === "not_started") &&
                          (!isAccessible ? (
                            <button
                              disabled={true}
                              className="flex items-center space-x-2 px-4 py-2.5 bg-gray-400 text-white rounded-xl text-sm font-semibold cursor-not-allowed opacity-60"
                              title={
                                lockReason || "Complete previous modules first"
                              }
                            >
                              <LockClosedIcon className="w-4 h-4" />
                              <span>Locked</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartModule(content.id)}
                              disabled={actionLoading === content.id}
                              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                              {actionLoading === content.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <PlayIcon className="w-4 h-4" />
                              )}
                              <span>Start</span>
                            </button>
                          ))}

                        {progress && progress.status === "in_progress" && (
                          <>
                            <button
                              onClick={() => handleContentView(content)}
                              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-200 transition-all duration-200 border border-blue-200 hover:border-blue-300"
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
                              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                              {actionLoading === content.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <CheckCircleIcon className="w-4 h-4" />
                              )}
                              <span>Complete</span>
                            </button>
                          </>
                        )}

                        {progress && progress.status === "completed" && (
                          <button
                            onClick={() => handleContentView(content)}
                            className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all duration-200 border border-gray-200 hover:border-gray-300"
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

      {/* Articulate Viewer Component */}
      <ArticulateViewer
        articulateViewer={articulateViewer}
        currentSessionTime={currentSessionTime}
        viewingContent={viewingContent}
        courseContents={courseContents}
        actionLoading={actionLoading}
        onClose={closeArticulateViewer}
        onToggleFullscreen={toggleFullscreen}
        onCompleteModule={handleCompleteModule}
        getContentProgress={getContentProgress}
        formatSessionTime={formatSessionTime}
      />
    </div>
  );
}
