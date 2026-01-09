"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/src/components/admin/AdminLayout";
import AuthGuard from "@/src/components/auth/AuthGuard";
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  TrashIcon,
  FolderIcon,
  ClipboardDocumentCheckIcon,
  BookOpenIcon,
  ChartBarIcon,
  CheckIcon,
  XMarkIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/button";
import {
  getAllTrainingMaterials,
  downloadTrainingMaterial,
  viewTrainingMaterial,
  bulkDeleteTrainingMaterials,
  bulkUpdateTrainingMaterialsStatus,
  type TrainingMaterialWithCourse,
  type DocumentManagementStats,
} from "@/src/services/trainingMaterialService";
import toast from "react-hot-toast";

type ViewMode = "grid" | "list" | "table";
type CategoryFilter = "all" | "handout" | "document" | "manual";
type SortField = "created_at" | "title" | "file_size";
type SortOrder = "asc" | "desc";

export default function DocumentPage() {
  const [documents, setDocuments] = useState<TrainingMaterialWithCourse[]>([]);
  const [stats, setStats] = useState<DocumentManagementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await getAllTrainingMaterials({
        search: searchQuery || undefined,
        file_category_type: categoryFilter,
        sort_by: sortField,
        sort_order: sortOrder,
        page: currentPage,
        per_page: 12,
      });

      setDocuments(response.data);
      setStats(response.stats);
      setTotalPages(response.pagination.total_pages);
      console.log(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [searchQuery, categoryFilter, sortField, sortOrder, currentPage]);

  // Handle document view
  const handleView = async (id: number) => {
    try {
      const url = await viewTrainingMaterial(id);
      window.open(url, "_blank");
      toast.success("Document opened in new tab");
    } catch (error) {
      console.error("Error viewing document:", error);
      toast.error("Failed to view document");
    }
  };

  // Handle document download
  const handleDownload = async (id: number) => {
    try {
      await downloadTrainingMaterial(id);
      toast.success("Document downloaded successfully");
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedDocuments.length === 0) {
      toast.error("Please select documents to delete");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedDocuments.length} document(s)?`
      )
    ) {
      return;
    }

    try {
      const response = await bulkDeleteTrainingMaterials(selectedDocuments);
      toast.success(response.message);
      setSelectedDocuments([]);
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting documents:", error);
      toast.error("Failed to delete documents");
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (is_active: boolean) => {
    if (selectedDocuments.length === 0) {
      toast.error("Please select documents to update");
      return;
    }

    try {
      const response = await bulkUpdateTrainingMaterialsStatus(
        selectedDocuments,
        is_active
      );
      toast.success(response.message);
      setSelectedDocuments([]);
      fetchDocuments();
    } catch (error) {
      console.error("Error updating documents:", error);
      toast.error("Failed to update documents");
    }
  };

  // Toggle document selection
  const toggleSelection = (id: number) => {
    setSelectedDocuments((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    );
  };

  // Select all documents
  const toggleSelectAll = () => {
    if (selectedDocuments.length === documents.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(documents.map((doc) => doc.id));
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "handout":
        return <DocumentTextIcon className="w-5 h-5" />;
      case "manual":
        return <BookOpenIcon className="w-5 h-5" />;
      case "document":
        return <ClipboardDocumentCheckIcon className="w-5 h-5" />;
      default:
        return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "handout":
        return "bg-blue-100 text-blue-700";
      case "manual":
        return "bg-purple-100 text-purple-700";
      case "document":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Document Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage all course training materials and documents
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button className="flex items-center space-x-2">
                <CloudArrowUpIcon className="w-5 h-5" />
                <span>Upload Document</span>
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
                      Total Documents
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.total_documents}
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
                      Handouts
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.total_handouts}
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
                    <p className="text-sm font-medium text-gray-600">Manuals</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.total_manuals}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <BookOpenIcon className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Storage
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.total_size_human}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <ChartBarIcon className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents by title, course, or instructor..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Button */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <FunnelIcon className="w-5 h-5" />
                <span>Filters</span>
              </Button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) =>
                        setCategoryFilter(e.target.value as CategoryFilter)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Categories</option>
                      <option value="handout">Handouts</option>
                      <option value="document">Documents</option>
                      <option value="manual">Manuals</option>
                    </select>
                  </div>

                  {/* Sort Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortField}
                      onChange={(e) =>
                        setSortField(e.target.value as SortField)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="created_at">Date Created</option>
                      <option value="title">Title</option>
                      <option value="file_size">File Size</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order
                    </label>
                    <select
                      value={sortOrder}
                      onChange={(e) =>
                        setSortOrder(e.target.value as SortOrder)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedDocuments.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedDocuments.length} document(s) selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDocuments([])}
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
                    onClick={() => handleBulkStatusUpdate(true)}
                    className="flex items-center space-x-1"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>Activate</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate(false)}
                    className="flex items-center space-x-1"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Deactivate</span>
                  </Button>
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

          {/* View Mode Selector and Select All */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={
                  selectedDocuments.length === documents.length &&
                  documents.length > 0
                }
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Select All
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${
                  viewMode === "grid"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${
                  viewMode === "list"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Documents Display */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading documents...</p>
              </div>
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No documents found
              </h3>
              <p className="mt-2 text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Checkbox */}
                      <div className="p-4 border-b border-gray-200">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(doc.id)}
                          onChange={() => toggleSelection(doc.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      {/* Document Preview */}
                      <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-48 flex items-center justify-center">
                        {getCategoryIcon(doc.file_category_type)}
                      </div>

                      {/* Document Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getCategoryColor(
                              doc.file_category_type
                            )}`}
                          >
                            {doc.file_category_type}
                          </div>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              doc.is_active ? "bg-green-500" : "bg-gray-400"
                            }`}
                          ></div>
                        </div>

                        <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                          {doc.title}
                        </h3>

                        <p className="text-xs text-gray-600 mb-2">
                          {doc.course_name || "Unknown Course"}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>{doc.uploaded_by?.name}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(doc.id)}
                            className="flex-1 flex items-center justify-center space-x-1"
                          >
                            <EyeIcon className="w-4 h-4" />
                            <span>View</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(doc.id)}
                            className="flex items-center justify-center"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedDocuments.includes(doc.id)}
                            onChange={() => toggleSelection(doc.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />

                          <div className="flex-shrink-0">
                            <div
                              className={`p-3 rounded-lg ${getCategoryColor(
                                doc.file_category_type
                              )}`}
                            >
                              {getCategoryIcon(doc.file_category_type)}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {doc.title}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${getCategoryColor(
                                  doc.file_category_type
                                )}`}
                              >
                                {doc.file_category_type}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <FolderIcon className="w-4 h-4 mr-1" />
                                {doc.course_name || "Unknown Course"}
                              </span>
                              <span>{formatFileSize(doc.file_size)}</span>
                              <span>{doc.uploaded_by?.name}</span>
                              <span>
                                {new Date(doc.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                doc.is_active ? "bg-green-500" : "bg-gray-400"
                              }`}
                            ></div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(doc.id)}
                              className="flex items-center space-x-1"
                            >
                              <EyeIcon className="w-4 h-4" />
                              <span>View</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(doc.id)}
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
