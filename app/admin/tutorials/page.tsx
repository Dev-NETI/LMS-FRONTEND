"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/src/components/admin/AdminLayout";
import AuthGuard from "@/src/components/auth/AuthGuard";
import {
  CloudArrowUpIcon,
  PlayCircleIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/button";
import {
  getTutorials,
  getTutorialStats,
  createTutorial,
  updateTutorial,
  deleteTutorial,
  bulkDeleteTutorials,
  viewTutorialVideo,
  type Tutorial,
  type TutorialStats,
  type CreateTutorialData,
} from "@/src/services/tutorialService";
import { toast } from "react-toastify";

type CategoryFilter = "all" | "user_manual" | "quality_procedure" | "tutorial";

export default function TutorialManagementPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [stats, setStats] = useState<TutorialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [selectedTutorials, setSelectedTutorials] = useState<number[]>([]);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "tutorial" as "user_manual" | "quality_procedure" | "tutorial",
    video: null as File | null,
    thumbnail: null as File | null,
    duration_seconds: 0,
  });
  const [uploading, setUploading] = useState(false);

  // Fetch tutorials
  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const [tutorialsRes, statsRes] = await Promise.all([
        getTutorials({
          category: categoryFilter !== "all" ? categoryFilter : undefined,
          per_page: 50,
        }),
        getTutorialStats(),
      ]);

      setTutorials(tutorialsRes.data);
      setStats(statsRes.stats);
    } catch (error) {
      console.error("Error fetching tutorials:", error);
      toast.error("Failed to load tutorials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, [categoryFilter]);

  // Handle file selection
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file size (500MB limit)
      if (file.size > 500 * 1024 * 1024) {
        toast.error("Video file must be less than 500MB");
        return;
      }
      setUploadForm({ ...uploadForm, video: file });
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Thumbnail must be less than 5MB");
        return;
      }
      setUploadForm({ ...uploadForm, thumbnail: file });
    }
  };

  // Handle upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadForm.video) {
      toast.error("Please select a video file");
      return;
    }

    if (!uploadForm.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    try {
      setUploading(true);

      const data: CreateTutorialData = {
        title: uploadForm.title,
        description: uploadForm.description || undefined,
        video: uploadForm.video,
        thumbnail: uploadForm.thumbnail || undefined,
        duration_seconds: uploadForm.duration_seconds || undefined,
        category: uploadForm.category,
      };

      await createTutorial(data);
      toast.success("Tutorial uploaded successfully!");

      // Reset form
      setUploadForm({
        title: "",
        description: "",
        category: "tutorial",
        video: null,
        thumbnail: null,
        duration_seconds: 0,
      });
      setShowUploadModal(false);
      fetchTutorials();
    } catch (error: any) {
      console.error("Error uploading tutorial:", error);
      toast.error(error.response?.data?.message || "Failed to upload tutorial");
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this tutorial?")) {
      return;
    }

    try {
      await deleteTutorial(id);
      toast.success("Tutorial deleted successfully");
      fetchTutorials();
    } catch (error) {
      console.error("Error deleting tutorial:", error);
      toast.error("Failed to delete tutorial");
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedTutorials.length === 0) {
      toast.error("Please select tutorials to delete");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedTutorials.length} tutorial(s)?`
      )
    ) {
      return;
    }

    try {
      await bulkDeleteTutorials(selectedTutorials);
      toast.success("Tutorials deleted successfully");
      setSelectedTutorials([]);
      fetchTutorials();
    } catch (error) {
      console.error("Error deleting tutorials:", error);
      toast.error("Failed to delete tutorials");
    }
  };

  // Handle view video
  const handleViewVideo = async (id: number) => {
    try {
      const url = await viewTutorialVideo(id);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error viewing video:", error);
      toast.error("Failed to load video");
    }
  };

  // Toggle selection
  const toggleSelection = (id: number) => {
    setSelectedTutorials((prev) =>
      prev.includes(id) ? prev.filter((tutId) => tutId !== id) : [...prev, id]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedTutorials.length === tutorials.length) {
      setSelectedTutorials([]);
    } else {
      setSelectedTutorials(tutorials.map((tut) => tut.id));
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "user_manual":
        return <DocumentTextIcon className="w-5 h-5" />;
      case "quality_procedure":
        return <ClipboardDocumentCheckIcon className="w-5 h-5" />;
      case "tutorial":
        return <VideoCameraIcon className="w-5 h-5" />;
      default:
        return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
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

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tutorial Management
              </h1>
              <p className="text-gray-600 mt-2">
                Upload and manage video tutorials, manuals, and procedures
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2"
              >
                <CloudArrowUpIcon className="w-5 h-5" />
                <span>Upload Tutorial</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Tutorials
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.total_tutorials}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <PlayCircleIcon className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      User Manuals
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.total_user_manuals}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Quality Procedures
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.total_quality_procedures}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <ClipboardDocumentCheckIcon className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Views
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.total_views.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <EyeIcon className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  categoryFilter === "all"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategoryFilter("user_manual")}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 ${
                  categoryFilter === "user_manual"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <DocumentTextIcon className="w-4 h-4" />
                <span>User Manuals</span>
              </button>
              <button
                onClick={() => setCategoryFilter("quality_procedure")}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 ${
                  categoryFilter === "quality_procedure"
                    ? "bg-green-100 text-green-700 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <ClipboardDocumentCheckIcon className="w-4 h-4" />
                <span>Quality Procedures</span>
              </button>
              <button
                onClick={() => setCategoryFilter("tutorial")}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 ${
                  categoryFilter === "tutorial"
                    ? "bg-purple-100 text-purple-700 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <VideoCameraIcon className="w-4 h-4" />
                <span>Video Tutorials</span>
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedTutorials.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedTutorials.length} tutorial(s) selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTutorials([])}
                    className="flex items-center space-x-1"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Clear</span>
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="flex items-center space-x-1 text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tutorials List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={
                    selectedTutorials.length === tutorials.length &&
                    tutorials.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Select All
                </label>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading tutorials...</p>
                </div>
              </div>
            ) : tutorials.length === 0 ? (
              <div className="p-12 text-center">
                <PlayCircleIcon className="w-16 h-16 text-gray-400 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No tutorials found
                </h3>
                <p className="mt-2 text-gray-600">
                  Upload your first tutorial to get started
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {tutorials.map((tutorial) => (
                  <div
                    key={tutorial.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedTutorials.includes(tutorial.id)}
                        onChange={() => toggleSelection(tutorial.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />

                      <div className="flex-shrink-0">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black flex items-center justify-center">
                          <PlayCircleIcon className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {tutorial.title}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${getCategoryColor(
                              tutorial.category
                            )}`}
                          >
                            {tutorial.category.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{tutorial.video_file_size_human}</span>
                          <span>{tutorial.duration_formatted}</span>
                          <span>
                            {tutorial.total_views.toLocaleString()} views
                          </span>
                          <span>
                            {new Date(tutorial.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            tutorial.is_active ? "bg-green-500" : "bg-gray-400"
                          }`}
                        ></div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewVideo(tutorial.id)}
                          className="flex items-center space-x-1"
                        >
                          <PlayCircleIcon className="w-4 h-4" />
                          <span>Watch</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(tutorial.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Upload Tutorial
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadForm.title}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter tutorial title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) =>
                      setUploadForm({
                        ...uploadForm,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter tutorial description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={uploadForm.category}
                    onChange={(e) =>
                      setUploadForm({
                        ...uploadForm,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="tutorial">Video Tutorial</option>
                    <option value="user_manual">User Manual</option>
                    <option value="quality_procedure">Quality Procedure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video File * (MP4, WebM, AVI, MOV - Max 500MB)
                  </label>
                  <input
                    type="file"
                    required
                    accept="video/mp4,video/webm,video/x-msvideo,video/quicktime"
                    onChange={handleVideoSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {uploadForm.video && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {uploadForm.video.name} (
                      {(uploadForm.video.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail (Optional - Max 5MB)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleThumbnailSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {uploadForm.thumbnail && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {uploadForm.thumbnail.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={uploadForm.duration_seconds}
                    onChange={(e) =>
                      setUploadForm({
                        ...uploadForm,
                        duration_seconds: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter duration in seconds"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1"
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload Tutorial"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AdminLayout>
    </AuthGuard>
  );
}
