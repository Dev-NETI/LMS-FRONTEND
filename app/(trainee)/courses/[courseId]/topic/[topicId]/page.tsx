"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  PlayIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import { useAuth } from "@/src/context/AuthContext";

interface Subtopic {
  id: number;
  title: string;
  description: string;
  type: "video" | "document" | "quiz" | "assignment";
  duration?: string;
  completed: boolean;
  order: number;
}

interface Topic {
  id: number;
  title: string;
  description: string;
  courseId: number;
  courseName: string;
  instructor: string;
  estimatedTime: string;
  subtopics: Subtopic[];
  overallProgress: number;
}

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState<Topic | null>(null);

  useEffect(() => {
    const fetchTopicDetails = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await getTopicDetails(params.courseId, params.topicId);

        // Mock data for now
        const mockTopic: Topic = {
          id: Number(params.topicId),
          title: "Introduction to Maritime Safety",
          description:
            "Learn the fundamental principles of maritime safety, including basic concepts, regulations, and safety protocols essential for all maritime operations.",
          courseId: Number(params.courseId),
          courseName: "Maritime Safety Training",
          instructor: "Capt. Johnson",
          estimatedTime: "2 hours",
          overallProgress: 40,
          subtopics: [
            {
              id: 1,
              title: "Maritime Safety Overview",
              description: "Introduction video covering basic safety concepts",
              type: "video",
              duration: "15 min",
              completed: true,
              order: 1,
            },
            {
              id: 2,
              title: "Safety Regulations and Standards",
              description:
                "Review of international maritime safety regulations",
              type: "document",
              duration: "20 min",
              completed: true,
              order: 2,
            },
            {
              id: 3,
              title: "Personal Protective Equipment",
              description:
                "Learn about essential safety equipment and proper usage",
              type: "video",
              duration: "25 min",
              completed: false,
              order: 3,
            },
            {
              id: 4,
              title: "Safety Procedures Quiz",
              description: "Test your understanding of basic safety procedures",
              type: "quiz",
              duration: "10 min",
              completed: false,
              order: 4,
            },
            {
              id: 5,
              title: "Emergency Response Protocols",
              description: "Detailed guide on emergency response procedures",
              type: "document",
              duration: "30 min",
              completed: false,
              order: 5,
            },
            {
              id: 6,
              title: "Safety Assessment Exercise",
              description: "Complete a practical safety assessment scenario",
              type: "assignment",
              duration: "45 min",
              completed: false,
              order: 6,
            },
          ],
        };

        setTopic(mockTopic);
      } catch (error) {
        console.error("Failed to fetch topic details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && params.courseId && params.topicId) {
      fetchTopicDetails();
    }
  }, [user, params.courseId, params.topicId]);

  const getSubtopicIcon = (type: string) => {
    switch (type) {
      case "video":
        return <VideoCameraIcon className="w-5 h-5 text-red-500" />;
      case "document":
        return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
      case "quiz":
        return <ClipboardDocumentListIcon className="w-5 h-5 text-green-500" />;
      case "assignment":
        return <BookOpenIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSubtopicTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-red-100 text-red-800";
      case "document":
        return "bg-blue-100 text-blue-800";
      case "quiz":
        return "bg-green-100 text-green-800";
      case "assignment":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSubtopicClick = (subtopic: Subtopic) => {
    // TODO: Navigate to subtopic content or mark as completed
    console.log("Clicked subtopic:", subtopic.title);
  };

  const toggleSubtopicCompletion = (subtopicId: number) => {
    if (!topic) return;

    const updatedSubtopics = topic.subtopics.map((subtopic) =>
      subtopic.id === subtopicId
        ? { ...subtopic, completed: !subtopic.completed }
        : subtopic
    );

    const completedCount = updatedSubtopics.filter((s) => s.completed).length;
    const overallProgress = Math.round(
      (completedCount / updatedSubtopics.length) * 100
    );

    setTopic({
      ...topic,
      subtopics: updatedSubtopics,
      overallProgress,
    });
  };

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading topic details...</span>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  if (!topic) {
    return (
      <AuthGuard>
        <Layout>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Topic not found
            </h3>
            <p className="text-gray-600">
              The requested topic could not be loaded.
            </p>
            <button
              onClick={() =>
                router.push(`/courses/${params.courseId}/progress`)
              }
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Course
            </button>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  const completedSubtopics = topic.subtopics.filter((s) => s.completed).length;
  const totalSubtopics = topic.subtopics.length;

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() =>
                router.push(`/courses/${params.courseId}/progress`)
              }
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {topic.title}
              </h1>
              <p className="text-gray-600 mt-1">
                {topic.courseName} | {topic.instructor} | Estimated time:{" "}
                {topic.estimatedTime}
              </p>
            </div>
          </div>

          {/* Topic Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Topic Overview
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {topic.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progress
                </span>
                <span className="text-sm text-gray-600">
                  {completedSubtopics} of {totalSubtopics} completed (
                  {topic.overallProgress}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${topic.overallProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {totalSubtopics}
                </div>
                <div className="text-xs text-gray-600">Total Items</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {completedSubtopics}
                </div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {totalSubtopics - completedSubtopics}
                </div>
                <div className="text-xs text-gray-600">Remaining</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {topic.overallProgress}%
                </div>
                <div className="text-xs text-gray-600">Complete</div>
              </div>
            </div>
          </div>

          {/* Subtopics List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Learning Materials
            </h2>
            <div className="space-y-4">
              {topic.subtopics
                .sort((a, b) => a.order - b.order)
                .map((subtopic, index) => (
                  <div
                    key={subtopic.id}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      subtopic.completed
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200 hover:border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Order Number */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          subtopic.completed
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {subtopic.completed ? (
                          <CheckCircleIconSolid className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3
                            className={`font-medium ${
                              subtopic.completed
                                ? "text-gray-900"
                                : "text-gray-800"
                            }`}
                          >
                            {subtopic.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {getSubtopicIcon(subtopic.type)}
                            {subtopic.duration && (
                              <span className="text-sm text-gray-500">
                                {subtopic.duration}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {subtopic.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${getSubtopicTypeColor(
                              subtopic.type
                            )}`}
                          >
                            {subtopic.type.charAt(0).toUpperCase() +
                              subtopic.type.slice(1)}
                          </span>
                          <div className="flex space-x-2">
                            {!subtopic.completed && (
                              <button
                                onClick={() => handleSubtopicClick(subtopic)}
                                className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 text-sm rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <PlayIcon className="w-4 h-4" />
                                <span>Start</span>
                              </button>
                            )}
                            <button
                              onClick={() =>
                                toggleSubtopicCompletion(subtopic.id)
                              }
                              className={`flex items-center space-x-1 px-3 py-1 text-sm rounded-lg transition-colors ${
                                subtopic.completed
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                              <span>
                                {subtopic.completed
                                  ? "Completed"
                                  : "Mark Complete"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Navigation */}
            <div className="mt-8 flex justify-between">
              <button
                onClick={() =>
                  router.push(`/courses/${params.courseId}/progress`)
                }
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Back to Course Timeline</span>
              </button>
              {topic.overallProgress === 100 && (
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Topic Complete! Next Topic →
                </button>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
