"use client";

import React, { useState, useEffect } from "react";
import {
  Question,
  QuestionType,
  QuestionOption,
  CreateQuestionData,
  createQuestion,
  updateQuestion,
  validateQuestion,
  getNextOrderForCourse,
} from "@/src/services/questionBankService";
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

interface AddEditQuestionProps {
  courseId: any;
  question?: Question | null;
  onSave: () => void;
  onCancel: () => void;
}

type FormOption = {
  text: string;
  is_correct: boolean;
  order: number;
};

export default function AddEditQuestion({
  courseId,
  question,
  onSave,
  onCancel,
}: AddEditQuestionProps) {
  const isEditing = !!question;

  const [formData, setFormData] = useState({
    question_text: "",
    question_type: "multiple_choice" as QuestionType,
    points: 1,
    explanation: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    correct_answer: "", // For identification questions
  });

  const [options, setOptions] = useState<FormOption[]>([
    { text: "", is_correct: false, order: 0 },
    { text: "", is_correct: false, order: 1 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load question data for editing
  useEffect(() => {
    if (question) {
      setFormData({
        question_text: question.question_text,
        question_type: question.question_type,
        points: question.points,
        explanation: question.explanation || "",
        difficulty: question.difficulty,
        correct_answer: question.correct_answer || "",
      });

      if (question.options && question.options.length > 0) {
        setOptions(
          question.options.map((opt) => ({
            text: opt.text,
            is_correct: opt.is_correct,
            order: opt.order,
          }))
        );
      }
    }
  }, [question]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [loading, onCancel]);

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      { text: "", is_correct: false, order: prev.length },
    ]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return; // Minimum 2 options
    setOptions((prev) =>
      prev.filter((_, i) => i !== index).map((opt, i) => ({ ...opt, order: i }))
    );
  };

  const updateOption = (
    index: number,
    field: keyof FormOption,
    value: string | boolean
  ) => {
    setOptions((prev) =>
      prev.map((opt, i) => {
        if (i === index) {
          return { ...opt, [field]: value };
        }
        // For multiple choice, uncheck other options when one is checked
        if (
          field === "is_correct" &&
          value === true &&
          formData.question_type === "multiple_choice"
        ) {
          return { ...opt, is_correct: false };
        }
        return opt;
      })
    );
  };

  const handleQuestionTypeChange = (newType: QuestionType) => {
    setFormData((prev) => ({ ...prev, question_type: newType }));

    // Reset options for different question types
    if (newType === "identification") {
      setOptions([]);
    } else if (options.length === 0) {
      setOptions([
        { text: "", is_correct: false, order: 0 },
        { text: "", is_correct: false, order: 1 },
      ]);
    }

    // For multiple choice, ensure only one correct answer
    if (newType === "multiple_choice") {
      setOptions((prev) =>
        prev.map((opt, i) => ({
          ...opt,
          is_correct: i === 0 ? opt.is_correct : false,
        }))
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setValidationErrors([]);

    // Prepare data for validation
    const questionData: Partial<CreateQuestionData> = {
      ...formData,
      course_id: courseId,
    };

    if (formData.question_type === "identification") {
      questionData.correct_answer = formData.correct_answer;
    } else {
      questionData.options = options;
    }

    // Validate
    const validation = validateQuestion(questionData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        const updateData = {
          question_text: formData.question_text,
          points: formData.points,
          explanation: formData.explanation || undefined,
          difficulty: formData.difficulty,
          ...(formData.question_type === "identification"
            ? { correct_answer: formData.correct_answer }
            : { options: options }),
        };

        await updateQuestion(question.id, updateData);
      } else {
        // Get next order number
        const { nextOrder } = await getNextOrderForCourse(courseId);

        const createData: CreateQuestionData = {
          ...(questionData as CreateQuestionData),
          order: nextOrder,
        };

        await createQuestion(createData);
      }

      onSave();
    } catch (err: any) {
      setError(err.message || "Failed to save question");
      console.error("Error saving question:", err);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeDescription = (type: QuestionType) => {
    switch (type) {
      case "multiple_choice":
        return "Students select one correct answer from multiple options.";
      case "checkbox":
        return "Students can select multiple correct answers from the options.";
      case "identification":
        return "Students type their answer directly (text input).";
      default:
        return "";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
      onClick={(e) => e.target === e.currentTarget && !loading && onCancel()}
    >
      <div className="relative top-8 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-2/3 max-w-4xl shadow-lg rounded-lg bg-white mb-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Edit Question" : "Add New Question"}
          </h3>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Error Messages */}
        {(error || validationErrors.length > 0) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            {error && <p className="text-red-700 text-sm mb-2">{error}</p>}
            {validationErrors.length > 0 && (
              <div>
                <p className="text-red-700 text-sm font-medium mb-1">
                  Please fix the following errors:
                </p>
                <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <select
                value={formData.question_type}
                onChange={(e) =>
                  handleQuestionTypeChange(e.target.value as QuestionType)
                }
                disabled={isEditing || loading}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="checkbox">Checkbox (Multiple Select)</option>
                <option value="identification">Identification</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {getQuestionTypeDescription(formData.question_type)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.points}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      points: parseFloat(e.target.value) || 1,
                    }))
                  }
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      difficulty: e.target.value as any,
                    }))
                  }
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text *
            </label>
            <textarea
              value={formData.question_text}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  question_text: e.target.value,
                }))
              }
              rows={3}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your question here..."
              required
            />
          </div>

          {/* Options for Multiple Choice and Checkbox */}
          {(formData.question_type === "multiple_choice" ||
            formData.question_type === "checkbox") && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Answer Options *
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-600 bg-blue-100 hover:bg-blue-200"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Option
                </button>
              </div>

              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex items-center h-10">
                      <input
                        type={
                          formData.question_type === "multiple_choice"
                            ? "radio"
                            : "checkbox"
                        }
                        checked={option.is_correct}
                        onChange={(e) =>
                          updateOption(index, "is_correct", e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex-1">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) =>
                          updateOption(index, "text", e.target.value)
                        }
                        placeholder={`Option ${index + 1}`}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="flex items-center justify-center h-10 w-10 text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-2">
                {formData.question_type === "multiple_choice"
                  ? "Select the radio button for the correct answer."
                  : "Check all correct answers."}
              </p>
            </div>
          )}

          {/* Correct Answer for Identification */}
          {formData.question_type === "identification" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correct Answer *
              </label>
              <input
                type="text"
                value={formData.correct_answer}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    correct_answer: e.target.value,
                  }))
                }
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the correct answer"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be used for automatic grading (case-insensitive).
              </p>
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explanation (Optional)
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  explanation: e.target.value,
                }))
              }
              rows={2}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Provide an explanation for the correct answer..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <>{isEditing ? "Update Question" : "Add Question"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
