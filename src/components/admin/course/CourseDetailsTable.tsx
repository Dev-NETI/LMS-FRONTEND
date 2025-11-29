"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  getCourseDetailsByCourse,
  createCourseDetail,
  updateCourseDetail,
  deleteCourseDetail,
  CourseDetail,
  CreateCourseDetailData,
  UpdateCourseDetailData,
  CourseDetailsByType,
} from "@/src/services/courseDetailService";
import { authService } from "@/src/services/authService";

interface CourseDetailsTableProps {
  courseId: number;
}

export default function CourseDetailsTable({
  courseId,
}: CourseDetailsTableProps) {
  const [courseDetails, setCourseDetails] = useState<CourseDetailsByType>({
    descriptions: [],
    learning_objectives: [],
    prerequisites: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState<{
    [key: string]: boolean;
  }>({});
  const [editingDetail, setEditingDetail] = useState<{
    [key: number]: boolean;
  }>({});
  const [editContent, setEditContent] = useState<{ [key: number]: string }>({});
  const [newContent, setNewContent] = useState<{ [key: string]: string }>({});
  const [isCreating, setIsCreating] = useState<{ [key: string]: boolean }>({});
  const [isDeleting, setIsDeleting] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    if (!courseId) return;

    setIsLoading(true);
    try {
      await authService.initCSRF();
      const response = await getCourseDetailsByCourse(courseId);
      setCourseDetails({
        descriptions: response.descriptions,
        learning_objectives: response.learning_objectives,
        prerequisites: response.prerequisites,
      });
    } catch (error) {
      console.error("Failed to fetch course details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDetail = async (
    type: "description" | "learning_objective" | "prerequisite"
  ) => {
    const content = newContent[type];
    if (!content?.trim()) return;

    setIsCreating({ ...isCreating, [type]: true });
    try {
      await authService.initCSRF();

      const createData: CreateCourseDetailData = {
        course_id: courseId,
        type,
        content: content.trim(),
        order: courseDetails[`${type}s` as keyof CourseDetailsByType].length,
      };

      const response = await createCourseDetail(createData);

      setCourseDetails((prev) => ({
        ...prev,
        [`${type}s`]: [
          ...prev[`${type}s` as keyof CourseDetailsByType],
          response.detail,
        ],
      }));

      setNewContent({ ...newContent, [type]: "" });
      setShowCreateForm({ ...showCreateForm, [type]: false });
    } catch (error) {
      console.error("Failed to create course detail:", error);
    } finally {
      setIsCreating({ ...isCreating, [type]: false });
    }
  };

  const handleEditDetail = (detail: CourseDetail) => {
    setEditingDetail({ ...editingDetail, [detail.id]: true });
    setEditContent({ ...editContent, [detail.id]: detail.content });
  };

  const handleCancelEdit = (detailId: number) => {
    setEditingDetail({ ...editingDetail, [detailId]: false });
    setEditContent({ ...editContent, [detailId]: "" });
  };

  const handleUpdateDetail = async (detail: CourseDetail) => {
    const content = editContent[detail.id];
    if (!content?.trim()) return;

    try {
      await authService.initCSRF();

      const updateData: UpdateCourseDetailData = {
        content: content.trim(),
      };

      const response = await updateCourseDetail(detail.id, updateData);

      setCourseDetails((prev) => {
        const typeKey = `${detail.type}s` as keyof CourseDetailsByType;
        return {
          ...prev,
          [typeKey]: prev[typeKey].map((d) =>
            d.id === detail.id ? response.detail : d
          ),
        };
      });

      setEditingDetail({ ...editingDetail, [detail.id]: false });
      setEditContent({ ...editContent, [detail.id]: "" });
    } catch (error) {
      console.error("Failed to update course detail:", error);
    }
  };

  const handleDeleteDetail = async (detail: CourseDetail) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setIsDeleting({ ...isDeleting, [detail.id]: true });
    try {
      await authService.initCSRF();
      await deleteCourseDetail(detail.id);

      setCourseDetails((prev) => {
        const typeKey = `${detail.type}s` as keyof CourseDetailsByType;
        return {
          ...prev,
          [typeKey]: prev[typeKey].filter((d) => d.id !== detail.id),
        };
      });
    } catch (error) {
      console.error("Failed to delete course detail:", error);
    } finally {
      setIsDeleting({ ...isDeleting, [detail.id]: false });
    }
  };

  const renderSection = (
    title: string,
    type: "description" | "learning_objective" | "prerequisite",
    items: CourseDetail[]
  ) => (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <Button
            onClick={() =>
              setShowCreateForm({ ...showCreateForm, [type]: true })
            }
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add {title.slice(0, -1)}
          </Button>
        </div>

        {showCreateForm[type] && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <textarea
              placeholder={`Enter ${title.toLowerCase().slice(0, -1)}...`}
              value={newContent[type] || ""}
              onChange={(e) =>
                setNewContent({ ...newContent, [type]: e.target.value })
              }
              rows={3}
              className="w-full p-2 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 resize-none"
              disabled={isCreating[type]}
            />
            <div className="flex gap-2 mt-3">
              <Button
                onClick={() => handleCreateDetail(type)}
                disabled={!newContent[type]?.trim() || isCreating[type]}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                {isCreating[type] ? "Adding..." : "Add"}
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setShowCreateForm({ ...showCreateForm, [type]: false })
                }
                disabled={isCreating[type]}
                size="sm"
                className="text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-start space-x-3 p-3 border border-gray-100 rounded-lg"
              >
                <span className="text-sm text-gray-500 mt-1 w-6">
                  {index + 1}.
                </span>
                <div className="flex-1">
                  {editingDetail[item.id] ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent[item.id] || ""}
                        onChange={(e) =>
                          setEditContent({
                            ...editContent,
                            [item.id]: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full p-2 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdateDetail(item)}
                          disabled={!editContent[item.id]?.trim()}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleCancelEdit(item.id)}
                          size="sm"
                          className="text-sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {item.content}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditDetail(item)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    disabled={editingDetail[item.id] || isDeleting[item.id]}
                    title="Edit"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDetail(item)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    disabled={editingDetail[item.id] || isDeleting[item.id]}
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-8">
            No {title.toLowerCase()} added yet.
          </p>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderSection("Descriptions", "description", courseDetails.descriptions)}
      {renderSection(
        "Learning Objectives",
        "learning_objective",
        courseDetails.learning_objectives
      )}
      {renderSection(
        "Prerequisites",
        "prerequisite",
        courseDetails.prerequisites
      )}
    </div>
  );
}
