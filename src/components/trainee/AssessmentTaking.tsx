"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Assessment,
  AssessmentAttempt,
  FlattenedQuestion,
  getAssessment,
  startAssessment,
  resumeAssessment,
  saveAnswer,
  submitAssessment,
  formatTimeRemaining,
} from "@/src/services/assessmentService";
import { securityLogger } from "@/src/services/securityService";
import {
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface AssessmentTakingProps {
  assessmentId: number;
  attemptId?: number; // For resuming
}

export default function AssessmentTaking({
  assessmentId,
  attemptId,
}: AssessmentTakingProps) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  const [questions, setQuestions] = useState<FlattenedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: number]: any }>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoringAnswers, setRestoringAnswers] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [showInstructions, setShowInstructions] = useState(true);

  // Anti-cheating states
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [suspiciousActivity, setSuspiciousActivity] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [windowFocused, setWindowFocused] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const answersRef = useRef<{ [questionId: number]: any }>({});
  const attemptRef = useRef<AssessmentAttempt | null>(null);

  useEffect(() => {
    if (attemptId) {
      resumeExistingAssessment();
    } else {
      loadAssessmentForInstructions();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [assessmentId, attemptId]);

  // Update refs when state changes
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    attemptRef.current = attempt;
  }, [attempt]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && !showInstructions) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [timeRemaining, showInstructions]);

  // Anti-cheating monitoring effects
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        setSuspiciousActivity((prev) => [
          ...prev,
          `Tab switch at ${new Date().toISOString()}`,
        ]);
        setWindowFocused(false);
        // Log tab switch using security service
        securityLogger.logTabSwitch();
      } else {
        setWindowFocused(true);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Save answers before page unload
      try {
        if (attemptRef.current && Object.keys(answersRef.current).length > 0) {
          localStorage.setItem(
            `assessment_${assessmentId}_attempt_${attemptRef.current.id}_answers`,
            JSON.stringify(answersRef.current)
          );
        }
      } catch (err) {
        // Continue even if backup fails
      }

      if (attempt && !submitting) {
        e.preventDefault();
        e.returnValue =
          "Your assessment progress will be lost. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault();
      setSuspiciousActivity((prev) => [
        ...prev,
        `Right click blocked at ${new Date().toISOString()}`,
      ]);
      // Log right-click attempt using security service
      securityLogger.logRightClickBlocked();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block common cheating shortcuts
      if (
        e.key === "F12" || // Dev tools
        (e.ctrlKey && e.shiftKey && e.key === "I") || // Dev tools
        (e.ctrlKey && e.shiftKey && e.key === "J") || // Console
        (e.ctrlKey && e.key === "u") || // View source
        (e.ctrlKey && e.key === "r") || // Refresh
        e.key === "F5" // Refresh
      ) {
        e.preventDefault();
        setSuspiciousActivity((prev) => [
          ...prev,
          `Blocked shortcut: ${e.key} at ${new Date().toISOString()}`,
        ]);
        // Log blocked shortcut using security service
        securityLogger.logShortcutBlocked(e.key);
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("contextmenu", handleRightClick);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("contextmenu", handleRightClick);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);

      // Save answers on component unmount
      try {
        if (attemptRef.current && Object.keys(answersRef.current).length > 0) {
          localStorage.setItem(
            `assessment_${assessmentId}_attempt_${attemptRef.current.id}_answers`,
            JSON.stringify(answersRef.current)
          );
        }
      } catch (err) {
        // Continue even if backup fails
      }
    };
  }, [attempt, submitting]);

  const loadAssessmentForInstructions = async () => {
    try {
      setLoading(true);
      console.log("Loading assessment details for ID:", assessmentId);
      const response = await getAssessment(assessmentId);

      if (response.success) {
        console.log("Assessment details loaded:", response);
        setAssessment(response.data);
        // Don't set attempt, questions, or start timer yet - just show instructions
        setShowInstructions(true);
      }
    } catch (err: any) {
      console.log("Error loading assessment:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to load assessment";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startNewAssessment = async () => {
    try {
      setLoading(true);
      console.log("Starting new assessment for ID:", assessmentId);
      const response = await startAssessment(assessmentId);

      if (response.success) {
        console.log("Assessment start response:", response);
        setAssessment(response.assessment);
        setAttempt(response.attempt);
        setQuestions(response.questions);
        setTimeRemaining(response.time_limit * 60); // Convert minutes to seconds

        // Initialize answers from existing saved answers - handles page refresh
        const initialAnswers: { [questionId: number]: any } = {};
        if (
          response.attempt.answers &&
          Array.isArray(response.attempt.answers)
        ) {
          response.attempt.answers.forEach((answer) => {
            if (
              answer.question_id &&
              answer.answer_data !== null &&
              answer.answer_data !== undefined
            ) {
              initialAnswers[answer.question_id] = answer.answer_data;
            }
          });
        }

        // Also check if questions have saved_answer property
        response.questions.forEach((question) => {
          if (
            question.saved_answer !== null &&
            question.saved_answer !== undefined
          ) {
            initialAnswers[question.id] = question.saved_answer;
          }
        });

        // Try to merge with localStorage backup if available
        setRestoringAnswers(true);
        try {
          const localStorageKey = `assessment_${assessmentId}_attempt_${response.attempt.id}_answers`;
          const backupAnswers = localStorage.getItem(localStorageKey);
          if (backupAnswers) {
            const parsedBackup = JSON.parse(backupAnswers);
            // Merge server answers with local backup, preferring local for newer changes
            Object.assign(initialAnswers, parsedBackup);
          }
        } catch (err) {
          // Continue without localStorage backup
        } finally {
          setRestoringAnswers(false);
        }

        setAnswers(initialAnswers);
        
        // Hide instructions and start the assessment
        setShowInstructions(false);
        
        // Check if this is actually resuming an existing attempt based on saved answers
        const hasExistingAnswers = Object.keys(initialAnswers).length > 0;
        if (hasExistingAnswers) {
          toast.success("Assessment resumed successfully!");
        } else {
          toast.success("Assessment started successfully!");
        }
      }
    } catch (err: any) {
      console.log("Error starting assessment:", err);
      // Check for specific HTTP status codes
      if (err.response?.status === 409) {
        toast.error(
          "Assessment already started! You cannot start a new attempt while one is in progress."
        );
        setError(
          "Assessment already started. Please resume your existing attempt or wait for it to expire."
        );
      } else {
        const errorMessage = err.response?.data?.message || err.message || "Failed to start assessment";
        console.log("Assessment start error message:", errorMessage);
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const resumeExistingAssessment = async () => {
    try {
      setLoading(true);
      const response = await resumeAssessment(attemptId!, assessmentId);

      if (response.success) {
        setAssessment(response.assessment);
        setAttempt(response.attempt);
        setQuestions(response.questions);
        setTimeRemaining(response.attempt.time_remaining || 0);
        setShowInstructions(false);

        // Load existing answers - improved logic for page refresh
        const savedAnswers: { [questionId: number]: any } = {};

        // Primary source: attempt answers
        if (
          response.attempt.answers &&
          Array.isArray(response.attempt.answers)
        ) {
          response.attempt.answers.forEach((answer) => {
            if (
              answer.question_id &&
              answer.answer_data !== null &&
              answer.answer_data !== undefined
            ) {
              savedAnswers[answer.question_id] = answer.answer_data;
            }
          });
        }

        // Secondary source: questions with saved_answer
        if (response.questions && Array.isArray(response.questions)) {
          response.questions.forEach((question) => {
            if (
              question.saved_answer !== null &&
              question.saved_answer !== undefined
            ) {
              savedAnswers[question.id] = question.saved_answer;
            }
          });
        }

        // Try to merge with localStorage backup if available
        try {
          const localStorageKey = `assessment_${assessmentId}_attempt_${response.attempt.id}_answers`;
          const backupAnswers = localStorage.getItem(localStorageKey);
          if (backupAnswers) {
            const parsedBackup = JSON.parse(backupAnswers);
            // Merge server answers with local backup, preferring local for newer changes
            Object.assign(savedAnswers, parsedBackup);
          }
        } catch (err) {
          // Continue without localStorage backup
        }

        setAnswers(savedAnswers);
        toast.success("Assessment resumed successfully!");
      }
    } catch (err: any) {
      // Check for specific HTTP status codes
      if (err.response?.status === 409) {
        toast.error(
          "Cannot resume assessment! There may be a conflict with the current state."
        );
        setError(
          "Cannot resume assessment due to a conflict. Please try starting a new attempt."
        );
      } else if (err.response?.status === 404) {
        toast.error("Assessment attempt not found!");
        setError(
          "The assessment attempt you're trying to resume was not found."
        );
      } else {
        const errorMessage = err.message || "Failed to resume assessment";
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveAnswerImmediately = async (questionId: number, answerData: any) => {
    if (!attempt || saving) return;

    try {
      setSaving(true);
      await saveAnswer(assessmentId, questionId, answerData);
    } catch (err) {
      // Silent fail for auto-save to avoid disrupting user experience
    } finally {
      setSaving(false);
    }
  };

  const handleAnswerChange = (questionId: number, answerData: any) => {
    const newAnswers = {
      ...answers,
      [questionId]: answerData,
    };

    setAnswers(newAnswers);

    // Backup to localStorage for page refresh recovery
    try {
      if (attempt) {
        localStorage.setItem(
          `assessment_${assessmentId}_attempt_${attempt.id}_answers`,
          JSON.stringify(newAnswers)
        );
      }
    } catch (err) {
      // localStorage may be disabled - continue without it
    }

    // Clear existing auto-save timeout
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }

    // Debounced save after 500ms of no changes
    autoSaveRef.current = setTimeout(() => {
      saveAnswerImmediately(questionId, answerData);
    }, 500);
  };

  const saveCurrentQuestionAnswer = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const answer = answers[currentQuestion?.id];

    if (currentQuestion && answer !== undefined) {
      await saveAnswerImmediately(currentQuestion.id, answer);
    }
  };

  const handleNextQuestion = async () => {
    // Save current answer before navigating
    await saveCurrentQuestionAnswer();

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = async () => {
    // Save current answer before navigating
    await saveCurrentQuestionAnswer();

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleQuestionJump = async (index: number) => {
    // Save current answer before jumping
    await saveCurrentQuestionAnswer();

    setCurrentQuestionIndex(index);
  };

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (err) {
      // Fullscreen request failed - continue without it
      setSuspiciousActivity((prev) => [
        ...prev,
        `Fullscreen denied at ${new Date().toISOString()}`,
      ]);
      // Log fullscreen denial using security service
      securityLogger.logFullscreenDenied();
    }
  };

  const toggleFlag = (questionId: number) => {
    setFlaggedQuestions((prev) => {
      const updated = new Set(prev);
      if (updated.has(questionId)) {
        updated.delete(questionId);
      } else {
        updated.add(questionId);
      }
      return updated;
    });
  };

  const handleTimeUp = async () => {
    alert("Time's up! Your assessment will be submitted automatically.");
    await handleSubmitAssessment();
  };

  // Initialize security logging when component mounts or attempt changes
  useEffect(() => {
    if (assessmentId && attempt) {
      securityLogger.initialize(assessmentId, attempt.id);
    }
  }, [assessmentId, attempt]);

  const saveAllAnswersBeforeSubmit = async () => {
    const savePromises = Object.entries(answers).map(
      ([questionId, answerData]) =>
        saveAnswerImmediately(parseInt(questionId), answerData)
    );

    try {
      await Promise.all(savePromises);
    } catch (err) {
      // Continue with submission even if some saves failed
    }
  };

  const handleSubmitAssessment = async () => {
    if (!attempt) return;

    try {
      setSubmitting(true);
      toast.loading("Submitting assessment...", { id: "submit-assessment" });

      // Save all answers before submission to ensure nothing is lost
      await saveAllAnswersBeforeSubmit();

      // Log assessment completion using security service
      await securityLogger.logAssessmentCompleted({
        tabSwitches: tabSwitchCount,
        suspiciousActivities: suspiciousActivity.length,
        completionTime: startTimeRef.current
          ? Date.now() - startTimeRef.current.getTime()
          : 0,
      });

      // Prepare answers for submission
      const answersData = Object.entries(answers).map(
        ([questionId, answerData]) => ({
          question_id: parseInt(questionId),
          answer_data: answerData,
        })
      );

      const response = await submitAssessment({
        assessment_id: assessmentId,
        attempt_id: attempt.id,
        answers: answersData,
        security_data: {
          tab_switches: tabSwitchCount,
          suspicious_activities: suspiciousActivity,
          window_focus_lost: !windowFocused,
          completion_time: startTimeRef.current
            ? Date.now() - startTimeRef.current.getTime()
            : 0,
        },
      });

      if (response.success) {
        // Clean up localStorage after successful submission
        try {
          localStorage.removeItem(
            `assessment_${assessmentId}_attempt_${attempt.id}_answers`
          );
        } catch (err) {
          // Continue even if cleanup fails
        }
        router.push(`/assessments/${assessmentId}/results/${attempt.id}`);
      }
    } catch (err: any) {
      // Check for specific HTTP status codes
      if (err.response?.status === 409) {
        toast.error(
          "Assessment submission conflict! The assessment may have already been submitted.",
          { id: "submit-assessment" }
        );
        setError(
          "Cannot submit assessment due to a conflict. The assessment may have already been submitted."
        );
      } else {
        const errorMessage = err.message || "Failed to submit assessment";
        toast.error(errorMessage, { id: "submit-assessment" });
        setError(errorMessage);
      }
      setSubmitting(false);
    }
  };

  const renderQuestionContent = (question: FlattenedQuestion) => {
    const currentAnswer = answers[question.id];

    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-800 leading-relaxed">
                {question.question_text}
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleFlag(question.id)}
            className={`p-2 rounded-lg transition-colors ${
              flaggedQuestions.has(question.id)
                ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            }`}
            title="Flag for review"
          >
            <FlagIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-8">
          {question.question_type === "multiple_choice" && (
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <label
                  key={option.id}
                  className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name={`question_${question.id}`}
                    value={option.id}
                    checked={currentAnswer === option.id}
                    onChange={(e) =>
                      handleAnswerChange(question.id, parseInt(e.target.value))
                    }
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-900">{option.text}</span>
                </label>
              ))}
            </div>
          )}

          {question.question_type === "checkbox" && (
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <label
                  key={option.id}
                  className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={
                      Array.isArray(currentAnswer) &&
                      currentAnswer.includes(option.id)
                    }
                    onChange={(e) => {
                      const newAnswer = Array.isArray(currentAnswer)
                        ? [...currentAnswer]
                        : [];
                      if (e.target.checked) {
                        newAnswer.push(option.id);
                      } else {
                        const index = newAnswer.indexOf(option.id);
                        if (index > -1) newAnswer.splice(index, 1);
                      }
                      handleAnswerChange(question.id, newAnswer);
                    }}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-900">{option.text}</span>
                </label>
              ))}
            </div>
          )}

          {question.question_type === "identification" && (
            <div>
              <textarea
                value={currentAnswer || ""}
                onChange={(e) =>
                  handleAnswerChange(question.id, e.target.value)
                }
                placeholder="Type your answer here..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
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

  // Instructions screen
  if (showInstructions && assessment) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {assessment?.title || "Assessment"}
          </h1>

          {assessment?.instructions && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Instructions
              </h2>
              <div className="prose max-w-none text-gray-700">
                {assessment.instructions}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Time Limit</h3>
              <p className="text-blue-800">
                {assessment?.time_limit ? `${assessment.time_limit} minutes` : 'No time limit'}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Questions</h3>
              <p className="text-green-800">{assessment?.questions_count || 0} questions</p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">
                Passing Score
              </h3>
              <p className="text-yellow-800">{assessment?.passing_score}%</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Max Attempts</h3>
              <p className="text-purple-800">
                {assessment?.max_attempts} attempts allowed
              </p>
            </div>
          </div>

          {/* Security Requirements */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              Security & Monitoring Notice
            </h2>
            <div className="space-y-3 text-sm text-red-800">
              <p>
                • <strong>Full monitoring:</strong> Your activity is being
                tracked during this assessment
              </p>
              <p>
                • <strong>Tab switching:</strong> Switching tabs or windows will
                be recorded as suspicious activity
              </p>
              <p>
                • <strong>Right-click disabled:</strong> Context menu is
                disabled to prevent copying
              </p>
              <p>
                • <strong>Shortcut blocking:</strong> Developer tools and
                refresh shortcuts are disabled
              </p>
              <p>
                • <strong>Auto-save:</strong> Your answers are automatically
                saved every 500ms
              </p>
              <p>
                • <strong>Page refresh:</strong> You can safely refresh - your
                progress will be restored
              </p>
              <p className="font-semibold mt-4">
                ⚠️ Excessive suspicious activity may result in assessment
                invalidation
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <div className="flex space-x-3">
              <button
                onClick={enterFullscreen}
                className="px-4 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50"
              >
                Enter Fullscreen
              </button>

              <button
                onClick={() => {
                  startTimeRef.current = new Date();
                  // Log assessment start using security service
                  securityLogger.logAssessmentStarted();
                  startNewAssessment();
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!attempt || questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          {/* Security Warnings */}
          {(tabSwitchCount > 0 || !windowFocused) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-sm text-red-800">
                <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                <span>
                  ⚠️ Security Notice: Tab switches detected ({tabSwitchCount}).
                  {!windowFocused && " Window focus lost."} This activity is
                  being monitored.
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {assessment?.title}
              </h1>
              <span className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-600">
                <span>
                  Answered: {answeredCount}/{questions.length}
                </span>
              </div>

              <div
                className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  timeRemaining < 300
                    ? "bg-red-100 text-red-800"
                    : timeRemaining < 900
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                <ClockIcon className="w-4 h-4 mr-1" />
                {formatTimeRemaining(timeRemaining)}
              </div>
            </div>
          </div>

          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm p-8">
            {renderQuestionContent(currentQuestion)}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Previous
              </button>

              <div className="flex items-center space-x-2">
                {restoringAnswers && (
                  <span className="text-sm text-blue-500">
                    Restoring answers...
                  </span>
                )}
                {saving && (
                  <span className="text-sm text-gray-500">Saving...</span>
                )}
              </div>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={() => setShowConfirmSubmit(true)}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Submit Assessment
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Next
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Question Navigator */}
        <div className="w-80">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Question Navigator
            </h3>

            <div className="grid grid-cols-5 gap-2 mb-6">
              {questions.map((_, index) => {
                const question = questions[index];
                const questionId = question.id;
                const isAnswered = answers[questionId] !== undefined;
                const isFlagged = flaggedQuestions.has(questionId);
                const isCurrent = index === currentQuestionIndex;

                return (
                  <button
                    key={index}
                    onClick={() => handleQuestionJump(index)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all relative ${
                      isCurrent
                        ? "bg-blue-600 text-white"
                        : isAnswered
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {index + 1}
                    {isFlagged && (
                      <FlagIcon className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
                <span>Not answered</span>
              </div>
              <div className="flex items-center">
                <FlagIcon className="w-4 h-4 text-yellow-500 mr-2" />
                <span>Flagged</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Submit Assessment
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to submit your assessment? You have answered{" "}
              {answeredCount} out of {questions.length} questions.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Once submitted, you cannot make any changes to your answers.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={submitting}
              >
                Review Again
              </button>
              <button
                onClick={handleSubmitAssessment}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
