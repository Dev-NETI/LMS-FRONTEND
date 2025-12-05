"use client";

import React from "react";
import {
  Question,
  getQuestionTypeLabel,
  getDifficultyColor,
} from "@/src/services/questionBankService";
import {
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ChatBubbleLeftEllipsisIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  Square2StackIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";

interface QuestionListProps {
  questions: Question[];
  selectedQuestions: Set<number>;
  onSelectQuestion: (questionId: number) => void;
  onSelectAll: () => void;
  onEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
  onDuplicate: (question: Question) => void;
  loading?: boolean;
}

export default function QuestionList({
  questions,
  selectedQuestions,
  onSelectQuestion,
  onSelectAll,
  onEdit,
  onDelete,
  onDuplicate,
  loading = false,
}: QuestionListProps) {
  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return <QuestionMarkCircleIcon className="w-5 h-5 text-blue-500" />;
      case 'checkbox':
        return <Square2StackIcon className="w-5 h-5 text-purple-500" />;
      case 'identification':
        return <IdentificationIcon className="w-5 h-5 text-green-500" />;
      default:
        return <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderQuestionPreview = (question: Question) => {
    const maxLength = 100;
    const truncatedText = question.question_text.length > maxLength 
      ? question.question_text.substring(0, maxLength) + "..."
      : question.question_text;

    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-900 font-medium">{truncatedText}</p>
        
        {/* Show options preview for multiple choice and checkbox */}
        {(question.question_type === 'multiple_choice' || question.question_type === 'checkbox') && 
         question.options && question.options.length > 0 && (
          <div className="space-y-1">
            {question.options.slice(0, 3).map((option, index) => (
              <div key={index} className="flex items-center text-xs text-gray-600">
                {question.question_type === 'multiple_choice' ? (
                  <div className={`w-3 h-3 rounded-full border mr-2 ${
                    option.is_correct 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300'
                  }`}>
                    {option.is_correct && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`w-3 h-3 rounded border mr-2 flex items-center justify-center ${
                    option.is_correct 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-300'
                  }`}>
                    {option.is_correct && <CheckIcon className="w-2 h-2" />}
                  </div>
                )}
                <span className={option.is_correct ? 'font-medium text-green-700' : ''}>
                  {option.text.length > 40 ? option.text.substring(0, 40) + "..." : option.text}
                </span>
              </div>
            ))}
            {question.options.length > 3 && (
              <p className="text-xs text-gray-500 ml-5">
                +{question.options.length - 3} more options
              </p>
            )}
          </div>
        )}

        {/* Show correct answer for identification */}
        {question.question_type === 'identification' && question.correct_answer && (
          <div className="text-xs text-gray-600">
            <span className="font-medium text-green-700">Answer:</span> {question.correct_answer}
          </div>
        )}
      </div>
    );
  };

  if (questions.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <ChatBubbleLeftEllipsisIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No questions found
        </h3>
        <p className="text-gray-600">
          Start building your question bank by adding your first question.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header with Select All */}
      {questions.length > 0 && (
        <div className="flex items-center px-4 py-3 bg-gray-50 rounded-t-lg border-b border-gray-200">
          <input
            type="checkbox"
            checked={selectedQuestions.size === questions.length && questions.length > 0}
            onChange={onSelectAll}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-3 text-sm font-medium text-gray-700">
            Select All ({questions.length} questions)
          </span>
        </div>
      )}

      {/* Question Items */}
      <div className="divide-y divide-gray-200 border border-gray-200 rounded-b-lg">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className={`p-4 hover:bg-gray-50 transition-colors ${
              selectedQuestions.has(question.id) ? 'bg-blue-50' : 'bg-white'
            }`}
          >
            <div className="flex items-start space-x-4">
              {/* Checkbox */}
              <div className="flex items-center h-6">
                <input
                  type="checkbox"
                  checked={selectedQuestions.has(question.id)}
                  onChange={() => onSelectQuestion(question.id)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>

              {/* Order Number */}
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-semibold text-sm">
                {question.order + 1}
              </div>

              {/* Question Icon */}
              <div className="flex-shrink-0 mt-1">
                {getQuestionIcon(question.question_type)}
              </div>

              {/* Question Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                    {getQuestionTypeLabel(question.question_type)}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                  </span>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                    {question.points} pts
                  </span>
                  {!question.is_active && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                      Inactive
                    </span>
                  )}
                </div>

                {renderQuestionPreview(question)}

                {question.explanation && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded-md">
                    <p className="text-xs text-yellow-800">
                      <span className="font-medium">Explanation:</span> {
                        question.explanation.length > 100 
                          ? question.explanation.substring(0, 100) + "..."
                          : question.explanation
                      }
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-3">
                  <span>
                    Created: {new Date(question.created_at).toLocaleDateString()}
                  </span>
                  {question.created_by && (
                    <span>
                      by {question.created_by.f_name} {question.created_by.l_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(question)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Question"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => onDuplicate(question)}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Duplicate Question"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => onDelete(question)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Question"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading questions...</span>
        </div>
      )}
    </div>
  );
}