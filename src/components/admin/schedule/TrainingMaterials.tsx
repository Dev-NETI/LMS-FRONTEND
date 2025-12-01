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
} from "@heroicons/react/24/outline";
import { DocumentIcon as DocumentSolidIcon } from "@heroicons/react/24/solid";
import {
  getTrainingMaterialsByCourse,
  viewTrainingMaterial,
  TrainingMaterial,
} from "@/src/services/trainingMaterialService";
import { authService } from "@/src/services/authService";

interface TrainingMaterialsProps {
  courseId: number;
}

export default function TrainingMaterials({
  courseId,
}: TrainingMaterialsProps) {
  const [materials, setMaterials] = useState<TrainingMaterial[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "handout" | "document" | "manual"
  >("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!courseId) return;

      setIsLoading(true);
      try {
        await authService.initCSRF();
        const response = await getTrainingMaterialsByCourse(courseId);
        setMaterials(response.materials || []);
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

  const filteredMaterials =
    selectedCategory === "all"
      ? materials
      : materials.filter(
          (material) => material.file_category_type === selectedCategory
        );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const handleView = async (material: TrainingMaterial) => {
    try {
      await authService.initCSRF();
      const url = await viewTrainingMaterial(material.id);
      window.open(url, '_blank');
    } catch (error) {
      console.error("Failed to view training material:", error);
    }
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
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Training Materials
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Access course handouts, manuals, and reference materials
        </p>
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
          Handouts (
          {materials.filter((m) => m.file_category_type === "handout").length})
        </button>
        <button
          onClick={() => setSelectedCategory("document")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            selectedCategory === "document"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Documents (
          {materials.filter((m) => m.file_category_type === "document").length})
        </button>
        <button
          onClick={() => setSelectedCategory("manual")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            selectedCategory === "manual"
              ? "bg-purple-100 text-purple-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Manuals (
          {materials.filter((m) => m.file_category_type === "manual").length})
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
              </div>

              {/* Category Badge */}
              <div className="mb-3">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                    material.file_category_type
                  )}`}
                >
                  {material.file_category_type.charAt(0).toUpperCase() +
                    material.file_category_type.slice(1)}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                {material.description}
              </p>

              {/* File Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>
                  {material.file_type.split("/").pop()?.toUpperCase()} •{" "}
                  {formatFileSize(material.file_size)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                {material.uploaded_by && (
                  <div className="flex items-center text-xs text-gray-500">
                    <UserIcon className="w-3 h-3 mr-1" />
                    {material.uploaded_by.f_name} {material.uploaded_by.l_name}
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
                  onClick={() => handleView(material)}
                  className="flex-1 text-xs"
                >
                  <EyeIcon className="w-4 h-4 mr-1" />
                  View
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
          <p className="text-gray-600">
            {selectedCategory === "all"
              ? "No training materials are available for this course."
              : `No ${selectedCategory} materials found.`}
          </p>
        </div>
      )}
    </div>
  );
}
