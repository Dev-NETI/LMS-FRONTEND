"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpenIcon,
  DocumentArrowDownIcon,
  LinkIcon,
  EyeIcon,
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckSolid } from "@heroicons/react/24/solid";
import {
  CourseContent,
  getCourseContentForTrainee,
} from "@/src/services/courseContentService";
import {
  TraineeProgress,
  getCourseProgress,
  markModuleAsStarted,
  markModuleAsCompleted,
  getStatusColor,
  getStatusText,
} from "@/src/services/traineeProgressService";
import { useAuth } from "@/src/context/AuthContext";

interface TraineeCourseContentProps {
  courseId: number;
}

export default function TraineeCourseContent({
  courseId,
}: TraineeCourseContentProps) {
  const { user } = useAuth();
  const [courseContent, setCourseContent] = useState<CourseContent[]>([]);
  const [progressData, setProgressData] = useState<{ [key: number]: TraineeProgress }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch course content
        const contentResponse = await getCourseContentForTrainee(courseId);
        if (contentResponse.success && contentResponse.data) {
          setCourseContent(contentResponse.data);
        }

        // Fetch progress data if user is logged in
        if (user) {
          const progressResponse = await getCourseProgress(courseId);
          if (progressResponse.success) {
            const progressMap: { [key: number]: TraineeProgress } = {};
            progressResponse.modules.forEach((progress) => {
              progressMap[progress.course_content_id] = progress;
            });
            setProgressData(progressMap);
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch course content";
        setError(errorMessage);
        console.error("Error fetching course content:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId, user]);

  const handleStartModule = async (contentId: number) => {
    if (!user) return;

    setActionLoading(contentId);
    try {
      const response = await markModuleAsStarted({
        trainee_id: user.traineeid,
        course_content_id: contentId,
      });

      if (response.success) {
        // Update progress data
        setProgressData(prev => ({
          ...prev,
          [contentId]: response.progress
        }));
      }
    } catch (error) {
      console.error("Error starting module:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteModule = async (contentId: number) => {
    if (!user) return;

    setActionLoading(contentId);
    try {
      const response = await markModuleAsCompleted({
        trainee_id: user.traineeid,
        course_content_id: contentId,
      });

      if (response.success) {
        // Update progress data
        setProgressData(prev => ({
          ...prev,
          [contentId]: response.progress
        }));
      }
    } catch (error) {
      console.error("Error completing module:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getContentIcon = (contentType: string, fileType?: string) => {
    if (contentType === "url") {
      return <LinkIcon className="w-6 h-6 text-blue-500" />;
    }
    
    if (fileType === "articulate_html") {
      return <PlayIcon className="w-6 h-6 text-purple-500" />;
    }
    
    return <DocumentArrowDownIcon className="w-6 h-6 text-green-500" />;
  };

  const getContentTypeLabel = (contentType: string, fileType?: string) => {
    if (contentType === "url") return "Web Link";
    if (fileType === "articulate_html") return "Interactive Course";
    if (fileType === "pdf") return "PDF Document";
    return "File";
  };

  const handleViewContent = (content: CourseContent) => {
    if (content.content_type === "url" && content.url) {
      window.open(content.url, '_blank');
    } else if (content.file_path) {
      // Handle file viewing/download
      const viewUrl = `/api/trainee/course-content/${content.id}/view`;
      window.open(viewUrl, '_blank');
    }
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
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gray-300 rounded"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-300 rounded w-64 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="w-20 h-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load course content
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-blue-100 rounded-full mr-3">
            <BookOpenIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Course Content
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Access your learning materials and track your progress
            </p>
          </div>
        </div>

        {courseContent.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No content available yet
            </h3>
            <p className="text-gray-600">
              Course content will be available here when your instructor uploads materials.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {courseContent.map((content, index) => {
              const progress = progressData[content.id];
              const isCompleted = progress?.status === "completed";
              const isInProgress = progress?.status === "in_progress";
              const isNotStarted = !progress || progress.status === "not_started";

              return (
                <div
                  key={content.id}
                  className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                    isCompleted 
                      ? "border-green-200 bg-green-50" 
                      : isInProgress 
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-shrink-0 relative">
                        {getContentIcon(content.content_type, content.file_type)}
                        {isCompleted && (
                          <CheckSolid className="w-4 h-4 text-green-600 absolute -top-1 -right-1 bg-white rounded-full" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900 truncate">
                            {index + 1}. {content.title}
                          </h3>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {getContentTypeLabel(content.content_type, content.file_type)}
                          </span>
                          {progress && (
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(progress.status)}`}>
                              {getStatusText(progress.status)}
                            </span>
                          )}
                        </div>
                        
                        {content.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {content.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>
                              Added {new Date(content.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {progress && progress.last_activity && (
                            <div className="flex items-center space-x-1">
                              <CheckCircleIcon className="w-4 h-4" />
                              <span>
                                Last activity: {new Date(progress.last_activity).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {content.file_size_human && (
                            <span>{content.file_size_human}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {user && isNotStarted && (
                        <button
                          onClick={() => handleStartModule(content.id)}
                          disabled={actionLoading === content.id}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          <PlayIcon className="w-4 h-4" />
                          <span>Start</span>
                        </button>
                      )}

                      {user && isInProgress && (
                        <button
                          onClick={() => handleCompleteModule(content.id)}
                          disabled={actionLoading === content.id}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          <span>Complete</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleViewContent(content)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>

                  {/* Progress bar for in-progress or completed items */}
                  {progress && progress.completion_percentage > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{progress.completion_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isCompleted ? "bg-green-500" : "bg-yellow-500"
                          }`}
                          style={{ width: `${progress.completion_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}