"use client";

import React, { useState, useEffect } from "react";
import {
  Question,
  QuestionType,
  getQuestionsByCourse,
  deleteQuestion,
  bulkDeleteQuestions,
  duplicateQuestion,
} from "@/src/services/questionBankService";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import AddEditQuestion from "./AddEditQuestion";
import QuestionList from "./QuestionList";

interface QuestionBankProps {
  courseId: any;
}

export default function QuestionBank({ courseId }: QuestionBankProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<QuestionType | "">("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const perPage = 20;

  // Bulk operations
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [courseId, currentPage, searchTerm, selectedType, selectedDifficulty]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getQuestionsByCourse(
        courseId,
        currentPage,
        perPage,
        searchTerm || undefined,
        selectedType || undefined,
        selectedDifficulty || undefined
      );

      if (response.success) {
        setQuestions(response.data);
        setTotalPages(response.last_page);
        setTotalQuestions(response.total);
      } else {
        setError("Failed to load questions");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch questions");
      console.error("Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setShowAddEdit(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowAddEdit(true);
  };

  const handleDeleteQuestion = async (question: Question) => {
    if (
      !confirm(`Are you sure you want to delete "${question.question_text}"?`)
    ) {
      return;
    }

    try {
      await deleteQuestion(question.id);
      await fetchQuestions();
      setSelectedQuestions((prev) => {
        const updated = new Set(prev);
        updated.delete(question.id);
        return updated;
      });
    } catch (err: any) {
      setError(err.message || "Failed to delete question");
    }
  };

  const handleDuplicateQuestion = async (question: Question) => {
    try {
      await duplicateQuestion(question.id);
      await fetchQuestions();
    } catch (err: any) {
      setError(err.message || "Failed to duplicate question");
    }
  };

  const handleBulkDelete = async () => {
    const selectedArray = Array.from(selectedQuestions);
    if (selectedArray.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedArray.length} selected questions?`
      )
    ) {
      return;
    }

    try {
      setBulkLoading(true);
      await bulkDeleteQuestions(selectedArray);
      await fetchQuestions();
      setSelectedQuestions(new Set());
    } catch (err: any) {
      setError(err.message || "Failed to delete questions");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleQuestionSaved = () => {
    setShowAddEdit(false);
    setEditingQuestion(null);
    fetchQuestions();
  };

  const handleSelectQuestion = (questionId: number) => {
    setSelectedQuestions((prev) => {
      const updated = new Set(prev);
      if (updated.has(questionId)) {
        updated.delete(questionId);
      } else {
        updated.add(questionId);
      }
      return updated;
    });
  };

  const handleSelectAll = () => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(questions.map((q) => q.id)));
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
    setSelectedDifficulty("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || selectedType || selectedDifficulty;

  if (loading && currentPage === 1) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Question Bank</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage questions ({totalQuestions} questions)
          </p>
        </div>
        <button
          onClick={handleAddQuestion}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Question
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search questions..."
          />
        </div>

        {/* Filters Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
              hasActiveFilters
                ? "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            }`}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </button>

          {/* Bulk Actions */}
          {selectedQuestions.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedQuestions.size} selected
              </span>
              <button
                onClick={handleBulkDelete}
                disabled={bulkLoading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as QuestionType | "");
                  setCurrentPage(1);
                }}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="checkbox">Checkbox</option>
                <option value="identification">Identification</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="flex items-end">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Question List */}
      <QuestionList
        questions={questions}
        selectedQuestions={selectedQuestions}
        onSelectQuestion={handleSelectQuestion}
        onSelectAll={handleSelectAll}
        onEdit={handleEditQuestion}
        onDelete={handleDeleteQuestion}
        onDuplicate={handleDuplicateQuestion}
        loading={loading}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * perPage + 1} to{" "}
            {Math.min(currentPage * perPage, totalQuestions)} of{" "}
            {totalQuestions} questions
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 border rounded-md text-sm font-medium ${
                      currentPage === page
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Question Modal */}
      {showAddEdit && (
        <AddEditQuestion
          courseId={courseId}
          question={editingQuestion}
          onSave={handleQuestionSaved}
          onCancel={() => {
            setShowAddEdit(false);
            setEditingQuestion(null);
          }}
        />
      )}
    </div>
  );
}
