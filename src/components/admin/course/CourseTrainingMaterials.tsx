"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@mui/material";
import {
  DocumentArrowDownIcon,
  DocumentIcon,
  EyeIcon,
  FolderIcon,
  CalendarIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  DocumentIcon as DocumentSolidIcon,
} from "@heroicons/react/24/solid";
import {
  getTrainingMaterialsByCourse,
  createTrainingMaterial,
  updateTrainingMaterial,
  deleteTrainingMaterial,
  downloadTrainingMaterial,
  TrainingMaterial,
  CreateTrainingMaterialData,
  UpdateTrainingMaterialData,
} from "@/src/services/trainingMaterialService";
import { authService } from "@/src/services/authService";

interface CourseTrainingMaterialsProps {
  courseId: number;
}

export default function CourseTrainingMaterials({
  courseId,
}: CourseTrainingMaterialsProps) {
  const [materials, setMaterials] = useState<TrainingMaterial[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "handout" | "document" | "manual"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMaterial, setEditingMaterial] =
    useState<TrainingMaterial | null>(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    file_category_type: "document" as "handout" | "document" | "manual",
  });
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    file: null as File | null,
    file_category_type: "document" as "handout" | "document" | "manual",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchTrainingMaterials();
  }, [courseId]);

  const fetchTrainingMaterials = async () => {
    if (!courseId) return;

    setIsLoading(true);
    try {
      await authService.initCSRF();
      const response = await getTrainingMaterialsByCourse(courseId);
      console.log(response);
      setMaterials(response.materials || []);
    } catch (error) {
      console.error("Failed to fetch training materials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadMaterial = async () => {
    if (!uploadData.title.trim() || !uploadData.file) return;

    setIsUploading(true);

    try {
      await authService.initCSRF();

      const createData: CreateTrainingMaterialData = {
        course_id: courseId,
        title: uploadData.title.trim(),
        description: uploadData.description.trim() || undefined,
        file: uploadData.file,
        file_category_type: uploadData.file_category_type,
        order: materials.length,
      };

      const response = await createTrainingMaterial(createData);

      setMaterials([...materials, response.material]);
      setUploadData({
        title: "",
        description: "",
        file: null,
        file_category_type: "document",
      });
      setShowUploadModal(false);
    } catch (error) {
      console.error("Failed to upload training material:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditMaterial = (material: TrainingMaterial) => {
    setEditingMaterial(material);
    setEditData({
      title: material.title,
      description: material.description || "",
      file_category_type: material.file_category_type,
    });
    setShowEditModal(true);
  };

  const handleCancelEdit = () => {
    setEditingMaterial(null);
    setEditData({
      title: "",
      description: "",
      file_category_type: "document",
    });
    setShowEditModal(false);
  };

  const handleUpdateMaterial = async () => {
    if (!editingMaterial || !editData.title.trim()) return;

    setIsUpdating(true);
    try {
      await authService.initCSRF();

      const updateData: UpdateTrainingMaterialData = {
        title: editData.title.trim(),
        description: editData.description.trim() || undefined,
        file_category_type: editData.file_category_type,
      };

      const response = await updateTrainingMaterial(
        editingMaterial.id,
        updateData
      );

      setMaterials(
        materials.map((m) =>
          m.id === editingMaterial.id ? response.material : m
        )
      );

      handleCancelEdit();
    } catch (error) {
      console.error("Failed to update training material:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteMaterial = async (material: TrainingMaterial) => {
    if (!confirm("Are you sure you want to delete this training material?"))
      return;

    setIsDeleting({ ...isDeleting, [material.id]: true });
    try {
      await authService.initCSRF();
      await deleteTrainingMaterial(material.id);

      setMaterials(materials.filter((m) => m.id !== material.id));
    } catch (error) {
      console.error("Failed to delete training material:", error);
    } finally {
      setIsDeleting({ ...isDeleting, [material.id]: false });
    }
  };

  const handleDownloadMaterial = async (material: TrainingMaterial) => {
    try {
      await authService.initCSRF();
      await downloadTrainingMaterial(material.id);
    } catch (error) {
      console.error("Failed to download training material:", error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "handout":
        return <DocumentSolidIcon className="w-5 h-5 text-blue-600" />;
      case "document":
        return <DocumentIcon className="w-5 h-5 text-green-600" />;
      case "manual":
        return <DocumentIcon className="w-5 h-5 text-purple-600" />;
      default:
        return <DocumentIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "handout":
        return "bg-blue-100 text-blue-800";
      case "document":
        return "bg-green-100 text-green-800";
      case "manual":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredMaterials =
    selectedCategory === "all"
      ? materials
      : materials.filter(
          (material) => material.file_category_type === selectedCategory
        );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="rectangular" width={120} height={36} />
        </div>

        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" width={80} height={32} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Skeleton variant="rounded" width={40} height={40} />
                  <div>
                    <Skeleton variant="text" width={120} height={20} />
                    <Skeleton variant="text" width={80} height={16} />
                  </div>
                </div>
              </div>
              <Skeleton variant="text" width="100%" height={16} />
              <Skeleton variant="text" width="80%" height={16} sx={{ mt: 1 }} />
              <div className="mt-4 flex gap-2">
                <Skeleton variant="rectangular" width={80} height={32} />
                <Skeleton variant="rectangular" width={60} height={32} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Training Materials</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage course handouts, documents, and reference materials
          </p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Upload Material
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            selectedCategory === "all"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Materials ({materials.length})
        </button>
        <button
          onClick={() => setSelectedCategory("handout")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            selectedCategory === "handout"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Handouts ({materials.filter(m => m.file_category_type === "handout").length})
        </button>
        <button
          onClick={() => setSelectedCategory("document")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            selectedCategory === "document"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Documents ({materials.filter(m => m.file_category_type === "document").length})
        </button>
        <button
          onClick={() => setSelectedCategory("manual")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            selectedCategory === "manual"
              ? "bg-purple-100 text-purple-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Manuals ({materials.filter(m => m.file_category_type === "manual").length})
        </button>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <div key={material.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    {getCategoryIcon(material.file_category_type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 leading-tight">
                      {material.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {material.file_name}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditMaterial(material)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    title="Edit"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMaterial(material)}
                    disabled={isDeleting[material.id]}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                    title="Delete"
                  >
                    {isDeleting[material.id] ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Category Badge */}
              <div className="mb-3">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(material.file_category_type)}`}>
                  {material.file_category_type.charAt(0).toUpperCase() + material.file_category_type.slice(1)}
                </span>
              </div>

              {/* Description */}
              {material.description && (
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {material.description}
                </p>
              )}

              {/* File Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{material.file_type.split('/').pop()?.toUpperCase()} • {formatFileSize(material.file_size)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                {material.uploaded_by && (
                  <div className="flex items-center text-xs text-gray-500">
                    <UserIcon className="w-3 h-3 mr-1" />
                    {material.uploaded_by?.f_name} {material.uploaded_by?.l_name}
                  </div>
                )}
                <div className="flex items-center text-xs text-gray-500">
                  <CalendarIcon className="w-3 h-3 mr-1" />
                  {formatDate(material.created_at)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadMaterial(material)}
                  className="flex-1 text-xs"
                >
                  <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMaterials.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No materials found
          </h3>
          <p className="text-gray-600 mb-6">
            {selectedCategory === "all" 
              ? "No training materials have been uploaded yet." 
              : `No ${selectedCategory} materials found.`
            }
          </p>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Upload First Material
          </Button>
        </div>
      )}
    </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Upload Training Material
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter material title"
                  value={uploadData.title}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, title: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isUploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter description (optional)"
                  value={uploadData.description}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  disabled={isUploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={uploadData.file_category_type}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      file_category_type: e.target.value as
                        | "handout"
                        | "document"
                        | "manual",
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isUploading}
                >
                  <option value="document">Document</option>
                  <option value="handout">Handout</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    onChange={(e) =>
                      setUploadData({
                        ...uploadData,
                        file: e.target.files?.[0] || null,
                      })
                    }
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={isUploading}
                    accept="*/*"
                  />
                  {uploadData.file && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {uploadData.file.name} (
                      {formatFileSize(uploadData.file.size)})
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Support for all file types, max 50MB
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadData({
                    title: "",
                    description: "",
                    file: null,
                    file_category_type: "document",
                  });
                }}
                disabled={isUploading}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadMaterial}
                disabled={
                  !uploadData.title.trim() || !uploadData.file || isUploading
                }
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUploading ? "Uploading..." : "Upload Material"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingMaterial && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Edit Training Material
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter material title"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter description (optional)"
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={editData.file_category_type}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      file_category_type: e.target.value as
                        | "handout"
                        | "document"
                        | "manual",
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isUpdating}
                >
                  <option value="document">Document</option>
                  <option value="handout">Handout</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              {/* File Info Display */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Current File
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Filename:</span>
                    <span className="font-medium">
                      {editingMaterial.file_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="font-medium">
                      {formatFileSize(editingMaterial.file_size)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium">
                      {editingMaterial.file_type}
                    </span>
                  </div>
                  {editingMaterial.uploaded_by && (
                    <div className="flex justify-between">
                      <span>Uploaded by:</span>
                      <span className="font-medium text-blue-600">
                        {editingMaterial.uploaded_by.f_name} {editingMaterial.uploaded_by.l_name}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Upload date:</span>
                    <span className="font-medium">
                      {new Date(editingMaterial.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateMaterial}
                disabled={!editData.title.trim() || isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUpdating ? "Updating..." : "Update Material"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
