"use client";

import React, { useState, useEffect } from "react";
import {
  CourseContent,
  getCourseContentsByCourse,
  createCourseContentFile,
  createCourseContentUrl,
  updateCourseContent,
  deleteCourseContent,
  downloadCourseContent,
  viewCourseContent,
  getArticulateContent,
  cleanupArticulateContent,
} from "@/src/services/courseContentService";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  DocumentIcon,
  LinkIcon,
  FilmIcon,
  XMarkIcon,
  PlayIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

type ContentFormData = {
  title: string;
  description: string;
  contentType: "file" | "url";
  fileType?: "articulate_html" | "pdf";
  file?: File;
  url?: string;
  order: number;
};

export default function CourseContentPage({ course }: { course: any }) {
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState<CourseContent | null>(
    null
  );
  const [formData, setFormData] = useState<ContentFormData>({
    title: "",
    description: "",
    contentType: "file",
    fileType: "pdf",
    order: 0,
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articulateViewer, setArticulateViewer] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
    contentId?: number;
  }>({
    isOpen: false,
    url: "",
    title: "",
    contentId: undefined,
  });

  useEffect(() => {
    fetchCourseContents();
  }, [course.id]);

  // Handle Escape key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (articulateViewer.isOpen) {
          closeArticulateViewer();
        } else if (showForm && !submitLoading) {
          closeModal();
        }
      }
    };

    if (showForm || articulateViewer.isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [showForm, submitLoading, articulateViewer.isOpen]);

  const fetchCourseContents = async () => {
    try {
      setLoading(true);
      const response = await getCourseContentsByCourse(course.id);
      if (response.success) {
        setContents(response.contents || []);
      }

      console.log(response);
    } catch (error) {
      console.error("Error fetching course contents:", error);
      setError("Failed to load course contents");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLoading) return;

    try {
      setSubmitLoading(true);
      setError(null);

      if (editingContent) {
        // Update existing content
        const updateData = {
          title: formData.title,
          description: formData.description,
          order: formData.order,
        };

        if (formData.contentType === "url" && formData.url) {
          updateData.url = formData.url;
        }

        await updateCourseContent(editingContent.id, updateData);
      } else {
        // Create new content
        if (formData.contentType === "file") {
          if (!formData.file || !formData.fileType) {
            setError("Please select a file and file type");
            return;
          }
          await createCourseContentFile({
            course_id: course.id,
            title: formData.title,
            description: formData.description,
            content_type: "file",
            file_type: formData.fileType,
            file: formData.file,
            order: formData.order,
          });
        } else {
          if (!formData.url) {
            setError("Please enter a URL");
            return;
          }
          await createCourseContentUrl({
            course_id: course.id,
            title: formData.title,
            description: formData.description,
            content_type: "url",
            url: formData.url,
            order: formData.order,
          });
        }
      }

      await fetchCourseContents();
      resetForm();
    } catch (error: any) {
      setError(error.message || "An error occurred");
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      contentType: "file",
      fileType: "pdf",
      order: 0,
    });
    setShowForm(false);
    setEditingContent(null);
    setError(null);
  };

  const closeModal = () => {
    if (!submitLoading) {
      resetForm();
    }
  };

  const handleEdit = (content: CourseContent) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      description: content.description || "",
      contentType: content.content_type,
      fileType: content.file_type as "articulate_html" | "pdf",
      url: content.url || "",
      order: content.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (content: CourseContent) => {
    if (!confirm(`Are you sure you want to delete "${content.title}"?`)) return;

    try {
      await deleteCourseContent(content.id);
      await fetchCourseContents();
    } catch (error) {
      console.error("Error deleting content:", error);
      setError("Failed to delete content");
    }
  };

  const handleView = async (content: CourseContent) => {
    if (content.content_type === "url") {
      window.open(content.url, "_blank");
    } else if (content.file_type === "articulate_html") {
      try {
        const response = await getArticulateContent(content.id);

        console.log(response);
        if (response.success) {
          setArticulateViewer({
            isOpen: true,
            url: response.index_url,
            title: response.title,
            contentId: response.content_id,
          });
        }
      } catch (error) {
        console.error("Error viewing Articulate content:", error);
        setError("Failed to load Articulate content");
      }
    } else {
      try {
        const url = await viewCourseContent(content.id);
        window.open(url, "_blank");
      } catch (error) {
        console.error("Error viewing content:", error);
        setError("Failed to view content");
      }
    }
  };

  const handleDownload = async (content: CourseContent) => {
    if (content.content_type === "url") return;

    try {
      await downloadCourseContent(content.id, content.file_name || "download");
    } catch (error) {
      console.error("Error downloading content:", error);
      setError("Failed to download content");
    }
  };

  const closeArticulateViewer = async () => {
    const contentId = articulateViewer.contentId;
    setArticulateViewer({
      isOpen: false,
      url: "",
      title: "",
      contentId: undefined,
    });

    // Optional cleanup - uncomment if you want to automatically cleanup extracted files
    // if (contentId) {
    //   try {
    //     await cleanupArticulateContent(contentId);
    //   } catch (error) {
    //     console.error("Error cleaning up Articulate content:", error);
    //   }
    // }
  };

  const openInNewWindow = () => {
    if (articulateViewer.url) {
      window.open(articulateViewer.url, "_blank");
    }
  };

  const getContentIcon = (content: CourseContent) => {
    if (content.content_type === "url") {
      return <LinkIcon className="h-6 w-6 text-blue-600" />;
    }
    if (content.file_type === "articulate_html") {
      return <FilmIcon className="h-6 w-6 text-green-600" />;
    }
    return <DocumentIcon className="h-6 w-6 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Course Content (Self-Paced Learning)
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Content
        </button>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={closeModal}
        >
          <div
            className="relative top-20 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-1/2 max-w-2xl shadow-lg rounded-lg bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                {editingContent ? "Edit Content" : "Add New Content"}
              </h4>
              <button
                onClick={closeModal}
                disabled={submitLoading}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <select
                  value={formData.contentType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contentType: e.target.value as "file" | "url",
                    })
                  }
                  disabled={!!editingContent}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="file">File Upload</option>
                  <option value="url">External Link</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter content title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter content description (optional)"
                />
              </div>

              {formData.contentType === "file" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File Type
                    </label>
                    <select
                      value={formData.fileType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fileType: e.target.value as "articulate_html" | "pdf",
                        })
                      }
                      disabled={!!editingContent}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="articulate_html">
                        Articulate HTML (ZIP)
                      </option>
                    </select>
                  </div>

                  {!editingContent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        File
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                              <span>Upload a file</span>
                              <input
                                type="file"
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    file: e.target.files?.[0],
                                  })
                                }
                                accept={
                                  formData.fileType === "pdf" ? ".pdf" : ".zip"
                                }
                                required
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {formData.fileType === "pdf"
                              ? "PDF up to 100MB"
                              : "ZIP up to 100MB"}
                          </p>
                          {formData.file && (
                            <p className="text-sm text-green-600 font-medium">
                              Selected: {formData.file.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {formData.contentType === "url" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    required
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter a valid URL for external learning content
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  placeholder="0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Determines the display order in the content list
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {submitLoading
                    ? "Saving..."
                    : editingContent
                    ? "Update Content"
                    : "Add Content"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Articulate Content Viewer Modal */}
      {articulateViewer.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h4 className="text-lg font-medium text-gray-900">
                  {articulateViewer.title}
                </h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={openInNewWindow}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="Open in new window"
                  >
                    <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={closeArticulateViewer}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Close"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="relative" style={{ height: "calc(90vh - 80px)" }}>
                <iframe
                  src={articulateViewer.url}
                  className="w-full h-full border-none"
                  title={articulateViewer.title}
                  allow="fullscreen"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {contents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No course content added yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              Add Articulate HTML, PDFs, or external links for self-paced
              learning.
            </p>
          </div>
        ) : (
          contents
            .sort((a, b) => a.order - b.order)
            .map((content, index) => (
              <div
                key={content.id}
                className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {index + 1}
                  </span>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {getContentIcon(content)}
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {content.title}
                  </h4>
                  {content.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {content.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {content.content_type === "url"
                        ? "External Link"
                        : content.file_type === "articulate_html"
                        ? "Articulate HTML"
                        : "PDF Document"}
                    </span>
                    {content.file_size_human && (
                      <span className="text-xs text-gray-500">
                        {content.file_size_human}
                      </span>
                    )}
                    {content.uploaded_by && (
                      <span className="text-xs text-gray-500">
                        by {content.uploaded_by?.f_name}{" "}
                        {content.uploaded_by?.l_name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleView(content)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title={
                      content.content_type === "url"
                        ? "Open Link"
                        : content.file_type === "articulate_html"
                        ? "Launch Articulate Content"
                        : "View File"
                    }
                  >
                    {content.file_type === "articulate_html" ? (
                      <PlayIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                  {content.content_type === "file" && (
                    <button
                      onClick={() => handleDownload(content)}
                      className="p-2 text-gray-400 hover:text-green-600"
                      title="Download File"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(content)}
                    className="p-2 text-gray-400 hover:text-yellow-600"
                    title="Edit Content"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(content)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Delete Content"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
