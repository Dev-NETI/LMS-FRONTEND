"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@mui/material";
import {
  DocumentArrowDownIcon,
  DocumentIcon,
  EyeIcon,
  PlusIcon,
  FolderIcon,
  TrashIcon,
  CalendarIcon,
  UserIcon,
  PencilIcon,
  CloudArrowUpIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { DocumentIcon as DocumentSolidIcon } from "@heroicons/react/24/solid";

interface TrainingMaterial {
  id: number;
  filename: string;
  title: string;
  description?: string;
  fileSize: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  category: "handout" | "manual" | "exercise" | "reference";
  downloadCount: number;
  isRequired: boolean;
}

interface CourseTrainingMaterialsProps {
  courseId: number;
}

export default function CourseTrainingMaterials({
  courseId,
}: CourseTrainingMaterialsProps) {
  const [materials, setMaterials] = useState<TrainingMaterial[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] =
    useState<TrainingMaterial | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "handout" as "handout" | "manual" | "exercise" | "reference",
    isRequired: false,
    file: null as File | null,
  });

  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockMaterials: TrainingMaterial[] = [
          {
            id: 1,
            filename: "handout.pdf",
            title: "Maritime Safety Handout",
            description:
              "Comprehensive safety procedures and protocols for maritime operations",
            fileSize: "2.4 MB",
            fileType: "PDF",
            uploadedBy: "Captain Johnson",
            uploadedAt: "2024-11-25T09:00:00Z",
            category: "handout",
            downloadCount: 15,
            isRequired: true,
          },
          {
            id: 2,
            filename: "emergency_procedures.pdf",
            title: "Emergency Response Manual",
            description:
              "Step-by-step emergency procedures for various maritime scenarios",
            fileSize: "4.1 MB",
            fileType: "PDF",
            uploadedBy: "Safety Officer Brown",
            uploadedAt: "2024-11-24T14:30:00Z",
            category: "manual",
            downloadCount: 22,
            isRequired: true,
          },
          {
            id: 3,
            filename: "fire_safety_exercise.pdf",
            title: "Fire Safety Training Exercise",
            description: "Practical exercises for fire prevention and response",
            fileSize: "1.8 MB",
            fileType: "PDF",
            uploadedBy: "Chief Officer Smith",
            uploadedAt: "2024-11-23T16:15:00Z",
            category: "exercise",
            downloadCount: 8,
            isRequired: false,
          },
          {
            id: 4,
            filename: "imo_regulations.pdf",
            title: "IMO Safety Regulations Reference",
            description:
              "International Maritime Organization safety regulations and guidelines",
            fileSize: "6.2 MB",
            fileType: "PDF",
            uploadedBy: "Maritime Academy",
            uploadedAt: "2024-11-22T11:00:00Z",
            category: "reference",
            downloadCount: 12,
            isRequired: false,
          },
        ];

        await new Promise((resolve) => setTimeout(resolve, 800));
        setMaterials(mockMaterials);
      } catch (error) {
        console.error("Failed to fetch training materials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, [courseId]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "handout":
        return <DocumentSolidIcon className="w-5 h-5 text-blue-600" />;
      case "manual":
        return <DocumentIcon className="w-5 h-5 text-green-600" />;
      case "exercise":
        return <DocumentIcon className="w-5 h-5 text-orange-600" />;
      case "reference":
        return <DocumentIcon className="w-5 h-5 text-purple-600" />;
      default:
        return <DocumentIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "handout":
        return "bg-blue-100 text-blue-800";
      case "manual":
        return "bg-green-100 text-green-800";
      case "exercise":
        return "bg-orange-100 text-orange-800";
      case "reference":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredMaterials =
    selectedCategory === "all"
      ? materials
      : materials.filter((material) => material.category === selectedCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownload = (material: TrainingMaterial) => {
    // Mock download functionality
    console.log(`Downloading ${material.filename}`);

    // Update download count
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === material.id ? { ...m, downloadCount: m.downloadCount + 1 } : m
      )
    );
  };

  const handleEdit = (material: TrainingMaterial) => {
    setSelectedMaterial(material);
    setUploadForm({
      title: material.title,
      description: material.description || "",
      category: material.category,
      isRequired: material.isRequired,
      file: null,
    });
    setShowEditModal(true);
  };

  const handleDelete = (materialId: number) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
    }
  };

  const handleUpload = () => {
    if (!uploadForm.file || !uploadForm.title) return;

    const newMaterial: TrainingMaterial = {
      id: Date.now(),
      filename: uploadForm.file.name,
      title: uploadForm.title,
      description: uploadForm.description,
      fileSize: `${(uploadForm.file.size / 1024 / 1024).toFixed(1)} MB`,
      fileType: uploadForm.file.name.split(".").pop()?.toUpperCase() || "FILE",
      uploadedBy: "Current User",
      uploadedAt: new Date().toISOString(),
      category: uploadForm.category,
      downloadCount: 0,
      isRequired: uploadForm.isRequired,
    };

    setMaterials((prev) => [newMaterial, ...prev]);
    setShowUploadModal(false);
    setUploadForm({
      title: "",
      description: "",
      category: "handout",
      isRequired: false,
      file: null,
    });
  };

  const handleUpdate = () => {
    if (!selectedMaterial || !uploadForm.title) return;

    setMaterials((prev) =>
      prev.map((m) =>
        m.id === selectedMaterial.id
          ? {
              ...m,
              title: uploadForm.title,
              description: uploadForm.description,
              category: uploadForm.category,
              isRequired: uploadForm.isRequired,
              ...(uploadForm.file && {
                filename: uploadForm.file.name,
                fileSize: `${(uploadForm.file.size / 1024 / 1024).toFixed(
                  1
                )} MB`,
                fileType:
                  uploadForm.file.name.split(".").pop()?.toUpperCase() ||
                  "FILE",
              }),
            }
          : m
      )
    );

    setShowEditModal(false);
    setSelectedMaterial(null);
    setUploadForm({
      title: "",
      description: "",
      category: "handout",
      isRequired: false,
      file: null,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="rectangular" width={120} height={36} />
        </div>

        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              width={80}
              height={32}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Training Materials
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage course handouts, manuals, and reference materials
          </p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
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
          Handouts ({materials.filter((m) => m.category === "handout").length})
        </button>
        <button
          onClick={() => setSelectedCategory("manual")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            selectedCategory === "manual"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Manuals ({materials.filter((m) => m.category === "manual").length})
        </button>
        <button
          onClick={() => setSelectedCategory("exercise")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            selectedCategory === "exercise"
              ? "bg-orange-100 text-orange-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Exercises ({materials.filter((m) => m.category === "exercise").length}
          )
        </button>
        <button
          onClick={() => setSelectedCategory("reference")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            selectedCategory === "reference"
              ? "bg-purple-100 text-purple-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Reference (
          {materials.filter((m) => m.category === "reference").length})
        </button>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <div
            key={material.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    {getCategoryIcon(material.category)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 leading-tight">
                      {material.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {material.filename}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEdit(material)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Edit"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Required Badge */}
              {material.isRequired && (
                <div className="mb-3">
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    Required
                  </span>
                </div>
              )}

              {/* Category Badge */}
              <div className="mb-3">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                    material.category
                  )}`}
                >
                  {material.category.charAt(0).toUpperCase() +
                    material.category.slice(1)}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                {material.description}
              </p>

              {/* File Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>
                  {material.fileType} • {material.fileSize}
                </span>
                <span>{material.downloadCount} downloads</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-xs text-gray-500">
                  <UserIcon className="w-3 h-3 mr-1" />
                  {material.uploadedBy}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <CalendarIcon className="w-3 h-3 mr-1" />
                  {formatDate(material.uploadedAt)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(material)}
                  className="flex-1 text-xs"
                >
                  <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-3"
                  title="Preview"
                >
                  <EyeIcon className="w-4 h-4" />
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
          <p className="text-gray-600 mb-4">
            {selectedCategory === "all"
              ? "No training materials have been uploaded yet."
              : `No ${selectedCategory} materials found.`}
          </p>
          <Button onClick={() => setShowUploadModal(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Upload First Material
          </Button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0  bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Training Material
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-blue-600 hover:text-blue-500"
                    >
                      Upload a file
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                      onChange={(e) =>
                        setUploadForm({
                          ...uploadForm,
                          file: e.target.files?.[0] || null,
                        })
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, PPT, XLS up to 10MB
                    </p>
                  </div>
                </div>
                {uploadForm.file && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {uploadForm.file.name}
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, title: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter material title"
                />
              </div>

              {/* Description */}
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter material description"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={uploadForm.category}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="handout">Handout</option>
                  <option value="manual">Manual</option>
                  <option value="exercise">Exercise</option>
                  <option value="reference">Reference</option>
                </select>
              </div>

              {/* Required */}
              <div className="flex items-center">
                <input
                  id="required"
                  type="checkbox"
                  checked={uploadForm.isRequired}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      isRequired: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="required"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Mark as required material
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!uploadForm.file || !uploadForm.title}
              >
                Upload
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Training Material
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* File Replace (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Replace File (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-600">
                    <label
                      htmlFor="file-replace"
                      className="cursor-pointer text-blue-600 hover:text-blue-500"
                    >
                      Choose new file
                    </label>
                    <input
                      id="file-replace"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                      onChange={(e) =>
                        setUploadForm({
                          ...uploadForm,
                          file: e.target.files?.[0] || null,
                        })
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to keep current file
                    </p>
                  </div>
                </div>
                {uploadForm.file && (
                  <p className="text-sm text-gray-600 mt-1">
                    New file: {uploadForm.file.name}
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, title: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Description */}
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={uploadForm.category}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="handout">Handout</option>
                  <option value="manual">Manual</option>
                  <option value="exercise">Exercise</option>
                  <option value="reference">Reference</option>
                </select>
              </div>

              {/* Required */}
              <div className="flex items-center">
                <input
                  id="required-edit"
                  type="checkbox"
                  checked={uploadForm.isRequired}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      isRequired: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="required-edit"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Mark as required material
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={!uploadForm.title}>
                Update
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
