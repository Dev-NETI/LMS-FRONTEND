"use client";

import React, { useState, useEffect } from "react";
import {
  DocumentTextIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  ClockIcon,
  FolderIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  TrainingMaterial,
  getTrainingMaterialsForTrainee,
} from "@/src/services/trainingMaterialService";

interface TraineeTrainingMaterialsProps {
  courseId: number;
}

export default function TraineeTrainingMaterials({
  courseId,
}: TraineeTrainingMaterialsProps) {
  const [materials, setMaterials] = useState<TrainingMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("created_at");

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!courseId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await getTrainingMaterialsForTrainee(courseId);
        if (response.success && response.data) {
          setMaterials(response.data);
        } else {
          setError("Failed to fetch training materials");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch training materials";
        setError(errorMessage);
        console.error("Error fetching training materials:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, [courseId]);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <DocumentTextIcon className="w-6 h-6 text-red-500" />;
      case 'doc':
      case 'docx':
        return <DocumentTextIcon className="w-6 h-6 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <DocumentTextIcon className="w-6 h-6 text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <DocumentTextIcon className="w-6 h-6 text-orange-500" />;
      default:
        return <DocumentArrowDownIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const handleViewMaterial = (material: TrainingMaterial) => {
    const viewUrl = `/api/trainee/training-materials/${material.id}/view`;
    window.open(viewUrl, '_blank');
  };

  const handleDownloadMaterial = (material: TrainingMaterial) => {
    const downloadUrl = `/api/trainee/training-materials/${material.id}/download`;
    window.open(downloadUrl, '_blank');
  };

  const getFilteredAndSortedMaterials = () => {
    return materials
      .filter(material =>
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'file_size':
            return (b.file_size || 0) - (a.file_size || 0);
          case 'created_at':
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
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
                    <div className="flex space-x-2">
                      <div className="w-16 h-8 bg-gray-300 rounded"></div>
                      <div className="w-20 h-8 bg-gray-300 rounded"></div>
                    </div>
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
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load training materials
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const filteredMaterials = getFilteredAndSortedMaterials();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-purple-100 rounded-full mr-3">
            <FolderIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Training Materials
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Download and access supplementary course materials
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="created_at">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="file_size">Sort by Size</option>
              </select>
            </div>
          </div>
        </div>

        {materials.length === 0 ? (
          <div className="text-center py-12">
            <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No training materials available
            </h3>
            <p className="text-gray-600">
              Training materials will be available here when your instructor uploads them.
            </p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="text-center py-8">
            <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No materials found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMaterials.map((material, index) => (
              <div
                key={material.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {getFileIcon(material.file_name)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {material.title}
                        </h3>
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {material.file_name.split('.').pop()?.toUpperCase()}
                        </span>
                      </div>
                      
                      {material.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {material.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>
                            Uploaded {new Date(material.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {material.file_size_human && (
                          <span>{material.file_size_human}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewMaterial(material)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    
                    <button
                      onClick={() => handleDownloadMaterial(material)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Materials Summary */}
        {materials.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {filteredMaterials.length} of {materials.length} materials shown
              </span>
              <span>
                Total size: {materials.reduce((total, material) => total + (material.file_size || 0), 0).toLocaleString()} bytes
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}