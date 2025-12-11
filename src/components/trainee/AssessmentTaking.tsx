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
  AcademicCapIcon,
  CheckCircleIcon,
  TrophyIcon,
  UsersIcon,
  ShieldCheckIcon,
  EyeIcon,
  DocumentTextIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { FlagIcon as FlagIconSolid } from "@heroicons/react/24/solid";
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
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load assessment";
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
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to start assessment";
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
    const isAnswered =
      currentAnswer !== undefined &&
      currentAnswer !== null &&
      currentAnswer !== "";

    return (
      <div className="space-y-8">
        {/* Question Header */}
        <div className="flex items-start justify-between ">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                  isAnswered
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {currentQuestionIndex + 1}
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Question {currentQuestionIndex + 1}
                </h2>
                <p className="text-xs text-gray-500">
                  {questions.length} questions total
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-800 leading-relaxed font-medium">
                {question.question_text}
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleFlag(question.id)}
            className={`group p-2 rounded-lg transition-all duration-200 ${
              flaggedQuestions.has(question.id)
                ? "bg-amber-100 text-amber-600 hover:bg-amber-200 shadow-lg shadow-amber-500/25"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-amber-600"
            }`}
            title="Flag for review"
          >
            {flaggedQuestions.has(question.id) ? (
              <FlagIconSolid className="w-4 h-4" />
            ) : (
              <FlagIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {question.question_type === "multiple_choice" && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-700 mb-3">
                Select one answer:
              </h3>
              {question.options?.map((option, index) => (
                <label
                  key={option.id}
                  className={`group flex items-start p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    currentAnswer === option.id
                      ? "border-blue-300 bg-blue-50 shadow-lg shadow-blue-500/10"
                      : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      name={`question_${question.id}`}
                      value={option.id}
                      checked={currentAnswer === option.id}
                      onChange={(e) =>
                        handleAnswerChange(
                          question.id,
                          parseInt(e.target.value)
                        )
                      }
                      className="w-4 h-4 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <span
                      className={`text-sm leading-relaxed ${
                        currentAnswer === option.id
                          ? "text-blue-900 font-medium"
                          : "text-gray-800"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}. {option.text}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}

          {question.question_type === "checkbox" && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-700 mb-3">
                Select all that apply:
              </h3>
              {question.options?.map((option, index) => {
                const isChecked =
                  Array.isArray(currentAnswer) &&
                  currentAnswer.includes(option.id);
                return (
                  <label
                    key={option.id}
                    className={`group flex items-start p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      isChecked
                        ? "border-green-300 bg-green-50 shadow-lg shadow-green-500/10"
                        : "border-gray-200 hover:border-green-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={isChecked}
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
                        className="w-4 h-4 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <span
                        className={`text-sm leading-relaxed ${
                          isChecked
                            ? "text-green-900 font-medium"
                            : "text-gray-800"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}. {option.text}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {question.question_type === "identification" && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-700 mb-3">
                Type your answer:
              </h3>
              <div className="relative">
                <textarea
                  value={currentAnswer || ""}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  placeholder="Type your answer here..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm leading-relaxed resize-none"
                  rows={4}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {(currentAnswer || "").length} characters
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Answer Status */}
        <div
          className={`flex items-center justify-center p-2 rounded-lg ${
            isAnswered
              ? "bg-green-50 border border-green-200"
              : "bg-amber-50 border border-amber-200"
          }`}
        >
          <div className="flex items-center">
            {isAnswered ? (
              <>
                <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-green-700 text-sm font-medium">
                  Answer saved
                </span>
              </>
            ) : (
              <>
                <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mr-2" />
                <span className="text-amber-700 text-sm font-medium">
                  Please select an answer
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-600 opacity-20 animate-pulse"></div>
          </div>
          <h3 className="mt-6 text-lg font-semibold text-gray-700">
            Loading Assessment
          </h3>
          <p className="mt-2 text-gray-500">
            Please wait while we prepare your assessment...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Assessment Error
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.back()}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-lg shadow-red-500/25"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-5xl mx-auto p-6">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
              <AcademicCapIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
              {assessment?.title || "Assessment"}
            </h1>
            <p className="text-lg text-gray-600">
              Review the instructions below before starting
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Instructions Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                {assessment?.instructions && (
                  <div className="mb-8">
                    <div className="flex items-center mb-6">
                      <div className="w-8 h-8 bg-blue-100 rounded-xl mr-3 flex items-center justify-center">
                        <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Instructions
                      </h2>
                    </div>
                    <div className="prose max-w-none text-gray-700 leading-relaxed">
                      {assessment.instructions}
                    </div>
                  </div>
                )}

                {/* Assessment Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="group bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-200 rounded-xl mr-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <ClockIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-blue-900">Time Limit</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-800 mb-1">
                      {assessment?.time_limit
                        ? `${assessment.time_limit} min`
                        : "Unlimited"}
                    </p>
                    <p className="text-sm text-blue-600">
                      {assessment?.time_limit
                        ? "Complete within time limit"
                        : "Take your time"}
                    </p>
                  </div>

                  <div className="group bg-gradient-to-br from-emerald-50 to-green-100 p-6 rounded-2xl border border-emerald-200/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-emerald-200 rounded-xl mr-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <QuestionMarkCircleIcon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="font-bold text-emerald-900">Questions</h3>
                    </div>
                    <p className="text-2xl font-bold text-emerald-800 mb-1">
                      {assessment?.questions_count || 0}
                    </p>
                    <p className="text-sm text-emerald-600">
                      Total questions to answer
                    </p>
                  </div>

                  <div className="group bg-gradient-to-br from-amber-50 to-yellow-100 p-6 rounded-2xl border border-amber-200/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-amber-200 rounded-xl mr-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <TrophyIcon className="w-5 h-5 text-amber-600" />
                      </div>
                      <h3 className="font-bold text-amber-900">
                        Passing Score
                      </h3>
                    </div>
                    <p className="text-2xl font-bold text-amber-800 mb-1">
                      {assessment?.passing_score}%
                    </p>
                    <p className="text-sm text-amber-600">
                      Minimum score to pass
                    </p>
                  </div>

                  <div className="group bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-2xl border border-purple-200/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-purple-200 rounded-xl mr-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <UsersIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-purple-900">Attempts</h3>
                    </div>
                    <p className="text-2xl font-bold text-purple-800 mb-1">
                      {assessment?.max_attempts}
                    </p>
                    <p className="text-sm text-purple-600">
                      Maximum attempts allowed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Actions Panel */}
            <div className="lg:col-span-1">
              {/* Security Requirements */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-red-100 rounded-xl mr-3 flex items-center justify-center">
                    <ShieldCheckIcon className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Security Notice
                  </h2>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        Activity Monitoring
                      </p>
                      <p className="text-gray-600">
                        Your actions are tracked during the assessment
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        Tab Switching
                      </p>
                      <p className="text-gray-600">
                        Switching tabs will be recorded as suspicious
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        Auto-Save
                      </p>
                      <p className="text-gray-600">
                        Answers are saved automatically
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        Page Refresh
                      </p>
                      <p className="text-gray-600">
                        Progress will be restored if refreshed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  Ready to start?
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={enterFullscreen}
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-blue-200 text-blue-700 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium"
                  >
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Enter Fullscreen
                  </button>

                  <button
                    onClick={() => {
                      startTimeRef.current = new Date();
                      securityLogger.logAssessmentStarted();
                      startNewAssessment();
                    }}
                    className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-bold text-lg shadow-lg shadow-green-500/25"
                  >
                    <PlayIcon className="w-5 h-5 mr-2" />
                    Start Assessment
                  </button>

                  <button
                    onClick={() => router.back()}
                    className="w-full px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 rounded-lg">
        <div className="max-w-6xl mx-auto px-6 py-3">
          {/* Security Warnings */}
          {(tabSwitchCount > 0 || !windowFocused) && (
            <div className="mb-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-sm">
                <div className="w-6 h-6 bg-red-100 rounded-lg mr-2 flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-900">
                    Security Alert: {tabSwitchCount} tab switches
                    {!windowFocused && ", focus lost"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header Content */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3 ">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {assessment?.title}
                </h1>
                <p className="text-xs text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-600">
                  {answeredCount}/{questions.length} answered
                </span>
              </div>

              <div
                className={`flex items-center px-3 py-1.5 rounded-lg font-medium text-xs ${
                  timeRemaining < 300
                    ? "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300"
                    : timeRemaining < 900
                    ? "bg-gradient-to-r from-amber-100 to-yellow-200 text-amber-800 border border-amber-300"
                    : "bg-gradient-to-r from-emerald-100 to-green-200 text-emerald-800 border border-emerald-300"
                }`}
              >
                <ClockIcon className="w-3 h-3 mr-1" />
                {formatTimeRemaining(timeRemaining)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">
                Progress
              </span>
              <span className="text-xs font-bold text-blue-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-4 mb-3">
            {renderQuestionContent(currentQuestion)}
          </div>

          {/* Navigation */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-3">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`group flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentQuestionIndex === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 hover:shadow-lg"
                }`}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                Previous
              </button>

              <div className="flex items-center space-x-3">
                {restoringAnswers && (
                  <div className="flex items-center px-3 py-1 bg-blue-50 rounded-lg">
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                    <span className="text-xs font-medium text-blue-700">
                      Restoring...
                    </span>
                  </div>
                )}
                {saving && (
                  <div className="flex items-center px-3 py-1 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                    <span className="text-xs font-medium text-green-700">
                      Saving...
                    </span>
                  </div>
                )}
              </div>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={() => setShowConfirmSubmit(true)}
                  className="group flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all duration-200 text-sm font-bold shadow-lg shadow-green-500/25"
                >
                  <StopIcon className="w-4 h-4 mr-2" />
                  Submit
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="group flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 text-sm font-medium shadow-lg shadow-blue-500/25"
                >
                  Next
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Question Navigator */}
        <div className="w-64">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-3">
            <div className="flex items-center mb-3">
              <div className="w-5 h-5 bg-indigo-100 rounded-lg mr-2 flex items-center justify-center">
                <BookOpenIcon className="w-3 h-3 text-indigo-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Navigator</h3>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-3">
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
                    className={`group relative w-6 h-6 rounded text-xs font-bold transition-all duration-200 ${
                      isCurrent
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md scale-105"
                        : isAnswered
                        ? "bg-gradient-to-br from-green-100 to-emerald-200 text-green-800 hover:from-green-200 hover:to-emerald-300"
                        : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300"
                    }`}
                  >
                    {index + 1}
                    {isFlagged && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full flex items-center justify-center">
                        <FlagIconSolid className="w-1 h-1 text-white" />
                      </div>
                    )}
                    {isAnswered && !isCurrent && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="w-1 h-1 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-1.5 bg-green-50 rounded">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-br from-green-100 to-emerald-200 rounded mr-1.5 flex items-center justify-center">
                    <CheckCircleIcon className="w-2 h-2 text-green-600" />
                  </div>
                  <span className="font-medium text-green-800">Answered</span>
                </div>
                <span className="text-green-700 font-bold text-xs">
                  {answeredCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded mr-1.5 flex items-center justify-center">
                    <QuestionMarkCircleIcon className="w-2 h-2 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-700">Remaining</span>
                </div>
                <span className="text-gray-600 font-bold text-xs">
                  {questions.length - answeredCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 bg-amber-50 rounded">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-amber-200 rounded mr-1.5 flex items-center justify-center">
                    <FlagIconSolid className="w-2 h-2 text-amber-600" />
                  </div>
                  <span className="font-medium text-amber-800">Flagged</span>
                </div>
                <span className="text-amber-700 font-bold text-xs">
                  {flaggedQuestions.size}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircleIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Submit Assessment
              </h3>
              <p className="text-green-100">Ready to submit your answers?</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Progress Summary */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">
                    Progress Summary
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    {answeredCount}/{questions.length} answered
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${(answeredCount / questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-gray-700 mb-3">
                  You have answered{" "}
                  <span className="font-bold text-gray-900">
                    {answeredCount}
                  </span>{" "}
                  out of{" "}
                  <span className="font-bold text-gray-900">
                    {questions.length}
                  </span>{" "}
                  questions.
                </p>
                {flaggedQuestions.size > 0 && (
                  <p className="text-amber-600 text-sm">
                    <FlagIconSolid className="w-4 h-4 inline mr-1" />
                    {flaggedQuestions.size} question(s) flagged for review
                  </p>
                )}
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-800 text-center font-medium">
                  ⚠️ Once submitted, you cannot make any changes to your
                  answers.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                  disabled={submitting}
                >
                  Review Again
                </button>
                <button
                  onClick={handleSubmitAssessment}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all duration-200 font-bold shadow-lg shadow-green-500/25 disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    "Submit Assessment"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
