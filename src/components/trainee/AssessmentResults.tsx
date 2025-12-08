"use client";

import React, { useState, useEffect } from "react";
import {
  AssessmentResult,
  getAssessmentResult,
  formatTimeLimit,
  getScoreBadgeColor,
  getScoreColor,
} from "@/src/services/assessmentService";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  TrophyIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface AssessmentResultsProps {
  attemptId: number;
  assessmentId?: number;
}

export default function AssessmentResults({
  attemptId,
  assessmentId,
}: AssessmentResultsProps) {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [attemptId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAssessmentResult(attemptId);
      
      if (response.success) {
        setResult(response.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load results");
      console.error("Error fetching results:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionReview = (question: any, index: number) => {
    const userAnswer = result?.attempt.answers?.find(a => a.question_id === question.question.id);
    const correctAnswer = result?.correct_answers[question.question.id];
    const explanation = result?.explanations[question.question.id];
    const isCorrect = userAnswer?.is_correct;

    return (
      <div key={question.question.id} className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium">
                {index + 1}
              </span>
              <h3 className="text-lg font-medium text-gray-900">
                {question.question.question_text}
              </h3>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {question.question.points} points
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isCorrect ? (
              <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                Correct
              </span>
            ) : (
              <span className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                <XCircleIcon className="w-4 h-4 mr-1" />
                Incorrect
              </span>
            )}
            <span className="text-sm font-medium text-gray-700">
              {userAnswer?.points_earned || 0}/{question.question.points}
            </span>
          </div>
        </div>

        {/* Answer Content */}
        <div className="space-y-4">
          {/* Multiple Choice / Checkbox */}
          {(question.question.question_type === 'multiple_choice' || 
            question.question.question_type === 'checkbox') && (
            <div className="space-y-2">
              {question.question.options?.map((option: any) => {
                const isUserAnswer = question.question.question_type === 'multiple_choice' 
                  ? userAnswer?.answer_data === option.id
                  : Array.isArray(userAnswer?.answer_data) && userAnswer.answer_data.includes(option.id);
                const isCorrectOption = option.is_correct;
                
                let bgColor = '';
                let textColor = '';
                let borderColor = '';
                
                if (isCorrectOption && isUserAnswer) {
                  // Correct answer selected by user
                  bgColor = 'bg-green-50';
                  textColor = 'text-green-900';
                  borderColor = 'border-green-200';
                } else if (isCorrectOption && !isUserAnswer) {
                  // Correct answer not selected by user
                  bgColor = 'bg-green-50';
                  textColor = 'text-green-900';
                  borderColor = 'border-green-200';
                } else if (!isCorrectOption && isUserAnswer) {
                  // Wrong answer selected by user
                  bgColor = 'bg-red-50';
                  textColor = 'text-red-900';
                  borderColor = 'border-red-200';
                } else {
                  // Regular option
                  bgColor = 'bg-gray-50';
                  textColor = 'text-gray-700';
                  borderColor = 'border-gray-200';
                }

                return (
                  <div
                    key={option.id}
                    className={`p-3 rounded-lg border ${bgColor} ${borderColor}`}
                  >
                    <div className="flex items-start">
                      <div className="flex items-center mt-0.5 mr-3">
                        {question.question.question_type === 'multiple_choice' ? (
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isUserAnswer 
                              ? 'bg-blue-600 border-blue-600' 
                              : 'border-gray-300'
                          }`}>
                            {isUserAnswer && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        ) : (
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            isUserAnswer 
                              ? 'bg-blue-600 border-blue-600' 
                              : 'border-gray-300'
                          }`}>
                            {isUserAnswer && <CheckCircleIcon className="w-3 h-3 text-white" />}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <span className={textColor}>{option.text}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          {isCorrectOption && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                              <CheckCircleIcon className="w-3 h-3 mr-1" />
                              Correct Answer
                            </span>
                          )}
                          {isUserAnswer && !isCorrectOption && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                              Your Answer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Identification */}
          {question.question.question_type === 'identification' && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Your Answer:</label>
                <div className={`mt-1 p-3 rounded-lg border ${
                  isCorrect 
                    ? 'bg-green-50 border-green-200 text-green-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}>
                  {userAnswer?.answer_data || "No answer provided"}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Correct Answer:</label>
                <div className="mt-1 p-3 rounded-lg border bg-green-50 border-green-200 text-green-900">
                  {question.question.correct_answer}
                </div>
              </div>
            </div>
          )}

          {/* Explanation */}
          {explanation && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Explanation:</h4>
              <p className="text-blue-800 text-sm">{explanation}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-400 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Error</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const { attempt, assessment, questions } = result;
  const isPassed = attempt.is_passed;
  const score = attempt.percentage || 0;
  const totalQuestions = questions.length;
  const correctAnswers = attempt.answers?.filter(a => a.is_correct).length || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back
          </button>
          
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            {showAnswers ? "Hide" : "Show"} Answer Review
          </button>
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          {/* Pass/Fail Banner */}
          <div className={`text-center p-6 rounded-xl mb-8 ${
            isPassed 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
              : 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-center mb-4">
              {isPassed ? (
                <TrophyIcon className="w-16 h-16 text-green-600" />
              ) : (
                <XCircleIcon className="w-16 h-16 text-red-600" />
              )}
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${
              isPassed ? 'text-green-800' : 'text-red-800'
            }`}>
              {isPassed ? 'Congratulations!' : 'Try Again'}
            </h1>
            <p className={`text-lg ${
              isPassed ? 'text-green-700' : 'text-red-700'
            }`}>
              {isPassed 
                ? 'You have successfully passed this assessment!'
                : `You need ${assessment.passing_score}% to pass. Keep studying and try again!`
              }
            </p>
          </div>

          {/* Assessment Info */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {assessment.title}
            </h2>
            <p className="text-gray-600">
              Completed on {new Date(attempt.submitted_at!).toLocaleString()}
            </p>
          </div>

          {/* Score Display */}
          <div className="text-center mb-8">
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(score)}`}>
              {score}%
            </div>
            <p className="text-gray-600">Your Score</p>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <AcademicCapIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{correctAnswers}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <ClockIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round((new Date(attempt.submitted_at!).getTime() - 
                            new Date(attempt.started_at).getTime()) / 1000 / 60)}
              </div>
              <div className="text-sm text-gray-600">Minutes Taken</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{attempt.score}</div>
              <div className="text-sm text-gray-600">Points Earned</div>
            </div>
          </div>

          {/* Performance Breakdown */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Breakdown</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Overall Score</span>
                  <span>{score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      score >= assessment.passing_score
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span className="text-orange-600">
                    Passing: {assessment.passing_score}%
                  </span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answer Review */}
        {showAnswers && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Answer Review</h2>
            <div className="space-y-6">
              {questions.map((question, index) => renderQuestionReview(question, index))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center mt-8 space-x-4">
          <button
            onClick={() => router.push('/trainee/assessments')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Back to Assessments
          </button>
          
          {!isPassed && attempt.attempt_number < assessment.max_attempts && (
            <button
              onClick={() => router.push(`/trainee/assessments/${assessment.id}`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}