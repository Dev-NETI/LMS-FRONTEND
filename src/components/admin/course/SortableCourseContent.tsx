"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Bars3Icon,
  DocumentArrowDownIcon,
  FilmIcon,
  BookOpenIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import {
  CourseContent,
  updateCourseContentOrder,
} from "@/src/services/courseContentService";

interface SortableItemProps {
  content: CourseContent;
  onEdit?: (content: CourseContent) => void;
  onDelete?: (content: CourseContent) => void;
  onView?: (content: CourseContent) => void;
  onDownload?: (content: CourseContent) => void;
}

function SortableItem({
  content,
  onEdit,
  onDelete,
  onView,
  onDownload,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: content.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getContentIcon = () => {
    if (content.content_type === "url") {
      return <BookOpenIcon className="w-5 h-5 text-blue-500" />;
    }

    if (content.file_type === "articulate_html") {
      return <FilmIcon className="w-5 h-5 text-purple-500" />;
    }

    return <DocumentArrowDownIcon className="w-5 h-5 text-gray-500" />;
  };

  const getContentTypeLabel = () => {
    if (content.content_type === "url") return "External Link";
    if (content.file_type === "articulate_html") return "Articulate";
    if (content.file_type === "pdf") return "PDF";
    return "File";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? "shadow-lg ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="flex items-center space-x-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing rounded hover:bg-gray-100 transition-colors"
        >
          <Bars3Icon className="w-5 h-5" />
        </div>

        {/* Order Number */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
          {content.order + 1}
        </div>

        {/* Content Icon */}
        <div className="flex-shrink-0">{getContentIcon()}</div>

        {/* Content Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-gray-900 truncate">
              {content.title}
            </h4>
            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
              {getContentTypeLabel()}
            </span>
            {!content.is_active && (
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                Inactive
              </span>
            )}
          </div>

          {content.description && (
            <p className="text-sm text-gray-600 truncate">
              {content.description}
            </p>
          )}

          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
            {content.file_size && <span>{content.file_size_human}</span>}
            <span>
              Created: {new Date(content.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {onView && (
            <button
              onClick={() => onView(content)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title={
                content.content_type === "url"
                  ? "Open Link"
                  : content.file_type === "articulate_html"
                  ? "Launch Articulate Content"
                  : "View File"
              }
            >
              {content.file_type === "articulate_html" ? (
                <PlayIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          )}

          {onDownload && content.content_type === "file" && (
            <button
              onClick={() => onDownload(content)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Download File"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(content)}
              className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
              title="Edit"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(content)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface SortableCourseContentProps {
  contents: CourseContent[];
  onContentsChange: (contents: CourseContent[]) => void;
  onEdit?: (content: CourseContent) => void;
  onDelete?: (content: CourseContent) => void;
  onView?: (content: CourseContent) => void;
  onDownload?: (content: CourseContent) => void;
  isUpdating?: boolean;
}

export default function SortableCourseContent({
  contents,
  onContentsChange,
  onEdit,
  onDelete,
  onView,
  onDownload,
  isUpdating = false,
}: SortableCourseContentProps) {
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = contents.findIndex((item) => item.id === active.id);
    const newIndex = contents.findIndex((item) => item.id === over.id);

    const newContents = arrayMove(contents, oldIndex, newIndex);

    // Update order values based on new positions
    const updatedContents = newContents.map((content, index) => ({
      ...content,
      order: index,
    }));

    // Optimistically update the UI
    onContentsChange(updatedContents);

    try {
      // Send update to backend
      const updates = updatedContents.map((content) => ({
        id: content.id,
        order: content.order,
      }));

      await updateCourseContentOrder(updates);
    } catch (error) {
      console.error("Failed to update content order:", error);
      // Revert the change on error
      onContentsChange(contents);
      alert("Failed to update content order. Please try again.");
    }
  };

  const sortedContents = [...contents].sort((a, b) => a.order - b.order);

  return (
    <div
      className={`space-y-4 ${
        isUpdating ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {contents.length === 0 ? (
        <div className="text-center py-12">
          <DocumentArrowDownIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No content available
          </h3>
          <p className="text-gray-600">
            Add some content to this course to get started.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedContents.map((content) => content.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sortedContents.map((content) => (
                <SortableItem
                  key={content.id}
                  content={content}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                  onDownload={onDownload}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {isDragging && (
        <div className="fixed inset-0 bg-opacity-5 pointer-events-none z-50" />
      )}
    </div>
  );
}
