"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/src/components/admin/AdminLayout";
import AuthGuard from "@/src/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import {
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  PlayCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  VideoCameraIcon,
  EyeIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/button";
import {
  getTutorials,
  getTutorialStats,
  viewTutorialVideo,
  type Tutorial,
  type TutorialStats,
} from "@/src/services/tutorialService";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";

type CategoryFilter = "all" | "user_manual" | "quality_procedure" | "tutorial";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [stats, setStats] = useState<TutorialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState<Tutorial | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  // Fetch tutorials and stats
  const fetchData = async () => {
    try {
      setLoading(true);

      const [tutorialsResponse, statsResponse] = await Promise.all([
        getTutorials({
          category: activeFilter !== "all" ? activeFilter : undefined,
          is_active: true,
          per_page: 10,
        }),
        getTutorialStats(),
      ]);

      setTutorials(tutorialsResponse.data);
      setStats(statsResponse.stats);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load tutorials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeFilter]);

  // Filter tutorials by search query
  const filteredTutorials = tutorials.filter(
    (tutorial) =>
      tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle video view - open in modal
  const handleViewVideo = async (tutorial: Tutorial) => {
    try {
      setLoadingVideo(true);
      setCurrentVideo(tutorial);
      setShowVideoModal(true);

      const url = await viewTutorialVideo(tutorial.id);
      setCurrentVideoUrl(url);
    } catch (error) {
      console.error("Error viewing video:", error);
      toast.error("Failed to load video");
      setShowVideoModal(false);
    } finally {
      setLoadingVideo(false);
    }
  };

  // Close video modal
  const closeVideoModal = () => {
    setShowVideoModal(false);
    setCurrentVideoUrl(null);
    setCurrentVideo(null);

    // Revoke the blob URL to free memory
    if (currentVideoUrl) {
      URL.revokeObjectURL(currentVideoUrl);
    }
  };

  const getTypeIcon = (category: string) => {
    switch (category) {
      case "user_manual":
        return <DocumentTextIcon className="w-5 h-5" />;
      case "quality_procedure":
        return <ClipboardDocumentCheckIcon className="w-5 h-5" />;
      case "tutorial":
        return <PlayCircleIcon className="w-5 h-5" />;
      default:
        return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  const getTypeColor = (category: string) => {
    switch (category) {
      case "user_manual":
        return "bg-blue-100 text-blue-700";
      case "quality_procedure":
        return "bg-green-100 text-green-700";
      case "tutorial":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "user_manual":
        return "User Manual";
      case "quality_procedure":
        return "Quality Procedure";
      case "tutorial":
        return "Video Tutorial";
      default:
        return category;
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Learning Resources
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.f_name}. Explore manuals, procedures, and
              tutorials.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <FunnelIcon className="w-5 h-5 mr-2" />
                  Filter Content
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveFilter("all")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeFilter === "all"
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    All Resources
                  </button>
                  <button
                    onClick={() => setActiveFilter("user_manual")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center ${
                      activeFilter === "user_manual"
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    User Manuals
                  </button>
                  <button
                    onClick={() => setActiveFilter("quality_procedure")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center ${
                      activeFilter === "quality_procedure"
                        ? "bg-green-100 text-green-700 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" />
                    Quality Procedures
                  </button>
                  <button
                    onClick={() => setActiveFilter("tutorial")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center ${
                      activeFilter === "tutorial"
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <VideoCameraIcon className="w-4 h-4 mr-2" />
                    Video Tutorials
                  </button>
                </div>

                <hr className="my-6" />

                <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                  Quick Stats
                </h3>
                {stats && (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Resources</span>
                      <span className="font-medium">
                        {stats.total_tutorials}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Views</span>
                      <span className="font-medium">
                        {stats.total_views.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recent Uploads</span>
                      <span className="font-medium">
                        {stats.recent_uploads}
                      </span>
                    </div>
                  </div>
                )}

                <hr className="my-6" />

                <Link href="/admin/tutorials">
                  <Button className="w-full">
                    <PlayCircleIcon className="w-4 h-4 mr-2" />
                    Manage Tutorials
                  </Button>
                </Link>
              </div>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-4">
              {/* Search Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search manuals, procedures, or tutorials..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading tutorials...</p>
                  </div>
                </div>
              ) : filteredTutorials.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No tutorials found
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                /* Feed Items */
                filteredTutorials.map((tutorial) => (
                  <div
                    key={tutorial.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Post Header */}
                    <div className="p-4 flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {tutorial.uploaded_by?.f_name?.charAt(0) || "A"}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {tutorial.uploaded_by?.f_name || "Admin"}{" "}
                            {tutorial.uploaded_by?.l_name || "Admin"}
                          </div>
                          <div className="text-sm text-gray-500">
                            System Administrator •{" "}
                            {formatTimestamp(tutorial.created_at)}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getTypeColor(
                          tutorial.category
                        )}`}
                      >
                        {getTypeIcon(tutorial.category)}
                        <span className="ml-1">
                          {getCategoryLabel(tutorial.category)}
                        </span>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="px-4 pb-3">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {tutorial.title}
                      </h3>
                      {tutorial.description && (
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {tutorial.description}
                        </p>
                      )}
                    </div>

                    {/* Thumbnail/Preview */}
                    <div
                      className="relative h-64 flex items-center justify-center cursor-pointer overflow-hidden group bg-black"
                      onClick={() => handleViewVideo(tutorial)}
                    >
                      {/* Play button overlay */}
                      <PlayCircleIcon className="w-20 h-20 text-white opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200" />
                      {tutorial.duration_formatted && (
                        <div className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
                          {tutorial.duration_formatted}
                        </div>
                      )}
                    </div>

                    {/* Stats Bar */}
                    <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          {tutorial.total_views.toLocaleString()} views
                        </span>
                        <span className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {tutorial.duration_formatted || "N/A"}
                        </span>
                      </div>
                      <span className="text-xs">
                        {tutorial.video_file_size_human}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-4 py-3 border-t border-gray-200">
                      <Button
                        className="w-full flex items-center justify-center space-x-2"
                        onClick={() => handleViewVideo(tutorial)}
                      >
                        <PlayCircleIcon className="w-5 h-5" />
                        <span>
                          Watch{" "}
                          {tutorial.category === "tutorial"
                            ? "Tutorial"
                            : "Video"}
                        </span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Video Modal */}
            {showVideoModal && (
              <div className="fixed inset-0 backdrop-blur-md  bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="relative w-full max-w-6xl bg-white rounded-xl shadow-2xl p-6">
                  {/* Close Button */}
                  <button
                    onClick={closeVideoModal}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <XMarkIcon className="w-8 h-8" />
                  </button>

                  {/* Video Info */}
                  {currentVideo && (
                    <div className="mb-4 pr-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {currentVideo.title}
                      </h2>
                      {currentVideo.description && (
                        <p className="text-gray-600 text-sm">
                          {currentVideo.description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Video Player */}
                  <div className="bg-black rounded-lg overflow-hidden shadow-lg">
                    {loadingVideo ? (
                      <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-4 text-gray-600">Loading video...</p>
                        </div>
                      </div>
                    ) : currentVideoUrl ? (
                      <video
                        controls
                        autoPlay
                        className="w-full h-auto max-h-[70vh]"
                        src={currentVideoUrl}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="flex items-center justify-center h-96">
                        <p className="text-gray-600">Failed to load video</p>
                      </div>
                    )}
                  </div>

                  {/* Video Stats */}
                  {currentVideo && (
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          {currentVideo.total_views.toLocaleString()} views
                        </span>
                        <span className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {currentVideo.duration_formatted || "N/A"}
                        </span>
                      </div>
                      <span>{currentVideo.video_file_size_human}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Right Sidebar - Trending & Stats */}
            <div className="lg:col-span-1">
              <div className="space-y-4 sticky top-6">
                {/* Category Stats */}
                {stats && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">
                      Category Breakdown
                    </h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors">
                        <div className="flex items-center">
                          <DocumentTextIcon className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="text-sm text-gray-700">
                            User Manuals
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {stats.total_user_manuals}
                        </span>
                      </div>
                      <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors">
                        <div className="flex items-center">
                          <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2 text-green-600" />
                          <span className="text-sm text-gray-700">
                            Quality Procedures
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {stats.total_quality_procedures}
                        </span>
                      </div>
                      <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors">
                        <div className="flex items-center">
                          <PlayCircleIcon className="w-4 h-4 mr-2 text-purple-600" />
                          <span className="text-sm text-gray-700">
                            Video Tutorials
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {stats.total_video_tutorials}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
                  <h2 className="font-semibold mb-2">Need Help?</h2>
                  <p className="text-sm text-blue-100 mb-4">
                    Contact support or browse our help center for assistance.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full bg-white text-blue-600 hover:bg-blue-50 border-0"
                  >
                    Get Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
