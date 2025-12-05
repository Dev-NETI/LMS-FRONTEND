"use client";

import React from "react";
import {
  XMarkIcon,
  FilmIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckSolid } from "@heroicons/react/24/solid";
import { CourseContent } from "@/src/services/courseContentService";
import { formatTimeSpent } from "@/src/services/traineeProgressService";

interface ArticulateViewerState {
  isOpen: boolean;
  url: string;
  title: string;
  contentId?: number;
  startTime?: number;
  isFullscreen?: boolean;
}

interface ViewingContent {
  contentId: number;
  startTime: number;
  totalTimeSpent: number;
}

interface ArticulateViewerProps {
  articulateViewer: ArticulateViewerState;
  currentSessionTime: number;
  viewingContent: ViewingContent | null;
  courseContents: CourseContent[];
  actionLoading: number | null;
  onClose: () => void;
  onToggleFullscreen: () => void;
  onCompleteModule: (moduleId: number) => void;
  getContentProgress: (contentId: number) => any;
  formatSessionTime: (seconds: number) => string;
}

export default function ArticulateViewer({
  articulateViewer,
  currentSessionTime,
  viewingContent,
  courseContents,
  actionLoading,
  onClose,
  onToggleFullscreen,
  onCompleteModule,
  getContentProgress,
  formatSessionTime,
}: ArticulateViewerProps) {
  if (!articulateViewer.isOpen) return null;

  return (
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
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
            title="Exit course"
          >
            <XMarkIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FilmIcon className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="font-semibold text-lg truncate max-w-md">
                {articulateViewer.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-300">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-3 h-3" />
                  <span>Session: {formatSessionTime(currentSessionTime)}</span>
                </div>
                {viewingContent && (
                  <>
                    <span>•</span>
                    <span>
                      Started:{" "}
                      {new Date(viewingContent.startTime).toLocaleTimeString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleFullscreen}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
            title={
              articulateViewer.isFullscreen
                ? "Exit fullscreen"
                : "Enter fullscreen"
            }
          >
            {articulateViewer.isFullscreen ? (
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0 0l5.5 5.5"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform"
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
        <div className="flex-1 bg-gray-900 relative overflow-hidden">
          {/* Loading overlay */}
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-sm">Loading content...</p>
            </div>
          </div>

          <iframe
            src={articulateViewer.url}
            className="w-full h-full border-none relative z-10"
            title={articulateViewer.title}
            allow="fullscreen"
            scrolling="yes"
            onLoad={(e) => {
              // Hide loading overlay when iframe loads
              const overlay = e.currentTarget
                .previousElementSibling as HTMLElement;
              if (overlay) overlay.style.display = "none";
            }}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
            }}
          />
        </div>

        {/* Enhanced Side Panel */}
        {!articulateViewer.isFullscreen && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-xl">
            {/* Panel Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <h3 className="font-bold text-gray-900 text-lg">
                Course Progress
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Track your learning journey
              </p>
            </div>

            {/* Enhanced Progress Stats */}
            <div className="p-6 space-y-4 border-b border-gray-100">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-blue-900">
                    Current Session
                  </span>
                  <div className="p-1.5 bg-blue-200 rounded-lg">
                    <ClockIcon className="w-4 h-4 text-blue-700" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {formatSessionTime(currentSessionTime)}
                </div>
              </div>

              {(() => {
                const progress = articulateViewer.contentId
                  ? getContentProgress(articulateViewer.contentId)
                  : null;
                return (
                  progress && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-green-900">
                          Total Time Spent
                        </span>
                        <div className="p-1.5 bg-green-200 rounded-lg">
                          <ClockIcon className="w-4 h-4 text-green-700" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-900">
                        {formatTimeSpent(progress.time_spent)}
                      </div>
                    </div>
                  )
                );
              })()}

              {articulateViewer.contentId &&
                (() => {
                  const progress = getContentProgress(
                    articulateViewer.contentId
                  );
                  const isCompleted = progress?.status === "completed";
                  const isLoading =
                    actionLoading === articulateViewer.contentId;

                  return (
                    <button
                      onClick={() =>
                        onCompleteModule(articulateViewer.contentId!)
                      }
                      disabled={isLoading || isCompleted}
                      className={`w-full flex items-center justify-center space-x-2 py-4 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                        isCompleted
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : isLoading
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white opacity-50 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-xl transform hover:-translate-y-0.5"
                      }`}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : isCompleted ? (
                        <CheckCircleIcon className="w-5 h-5" />
                      ) : (
                        <CheckCircleIcon className="w-5 h-5" />
                      )}
                      <span>
                        {isCompleted ? "Already Completed" : "Mark as Complete"}
                      </span>
                    </button>
                  );
                })()}
            </div>

            {/* Enhanced Course Content List */}
            <div className="flex-1 overflow-y-auto p-6">
              <h4 className="font-bold text-gray-900 mb-4 text-lg">
                Course Content
              </h4>
              <div className="space-y-3">
                {courseContents
                  .sort((a, b) => a.order - b.order)
                  .map((content, index) => {
                    const progress = getContentProgress(content.id);
                    const isCurrentContent =
                      content.id === articulateViewer.contentId;

                    return (
                      <div
                        key={content.id}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          isCurrentContent
                            ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-md"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              isCurrentContent
                                ? "bg-blue-200 text-blue-800"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            <span className="text-sm font-bold">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-semibold truncate ${
                                isCurrentContent
                                  ? "text-blue-900"
                                  : "text-gray-900"
                              }`}
                            >
                              {content.title}
                            </p>
                            {progress && (
                              <div className="flex items-center space-x-2 mt-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      progress.completion_percentage === 100
                                        ? "bg-green-500"
                                        : progress.completion_percentage > 50
                                        ? "bg-blue-500"
                                        : "bg-yellow-500"
                                    }`}
                                    style={{
                                      width: `${progress.completion_percentage}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600 font-medium">
                                  {progress.completion_percentage}%
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0 flex items-center space-x-1">
                            {progress?.status === "completed" && (
                              <CheckSolid className="w-5 h-5 text-green-500" />
                            )}
                            {isCurrentContent && (
                              <div className="p-1 bg-blue-200 rounded-full">
                                <PlayIcon className="w-3 h-3 text-blue-600" />
                              </div>
                            )}
                          </div>
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
  );
}
