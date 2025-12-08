import api from '@/lib/api';
import { Question, QuestionOption } from './questionBankService';

// Interface for the flattened question structure returned by the API
export interface FlattenedQuestion extends Question {
  saved_answer?: any;
}

export interface Assessment {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  instructions?: string;
  time_limit: number; // in minutes
  max_attempts: number;
  passing_score: number; // percentage
  is_active: boolean;
  is_randomized: boolean;
  show_results_immediately: boolean;
  created_at: string;
  updated_at: string;
  course?: {
    courseid: number;
    coursename: string;
  };
  questions_count?: number;
  total_points?: number;
  // Assessment attempt related fields
  attempts_count?: number;
  can_attempt?: boolean;
  has_active_attempt?: boolean;
  active_attempt_id?: number;
  best_score?: number;
  last_attempt?: {
    id: number;
    percentage: number;
    is_passed: boolean;
    submitted_at: string;
  };
  attempts?: AssessmentAttempt[];
}

export interface AssessmentQuestion {
  id: number;
  assessment_id: number;
  question_id: number;
  order: number;
  question: Question;
}

export interface AssessmentAttempt {
  id: number;
  assessment_id: number;
  trainee_id: number;
  attempt_number: number;
  started_at: string;
  submitted_at?: string;
  time_remaining?: number; // in seconds
  score?: number;
  percentage?: number;
  status: 'in_progress' | 'submitted' | 'expired';
  is_passed?: boolean;
  answers: AssessmentAnswer[];
}

export interface AssessmentAnswer {
  id: number;
  attempt_id: number;
  question_id: number;
  answer_data: any; // JSON data containing the answer
  is_correct?: boolean;
  points_earned?: number;
  answered_at: string;
}

export interface AssessmentStats {
  total_assessments: number;
  completed_assessments: number;
  passed_assessments: number;
  average_score: number;
  pending_assessments: number;
}

export interface StartAssessmentResponse {
  success: boolean;
  attempt: AssessmentAttempt;
  questions: FlattenedQuestion[];
  time_limit: number;
  instructions?: string;
}

export interface SubmitAssessmentData {
  attempt_id: number;
  answers: {
    question_id: number;
    answer_data: any;
  }[];
}

export interface AssessmentResult {
  attempt: AssessmentAttempt;
  assessment: Assessment;
  questions: AssessmentQuestion[];
  correct_answers: { [questionId: number]: any };
  explanations: { [questionId: number]: string };
}


// Get assessments for trainee's enrolled courses
export const getTraineeAssessments = async (): Promise<{
  success: boolean;
  data: Assessment[];
}> => {
  try {
    const response = await api.get('/api/trainee/assessments');
    return response.data;
  } catch (error) {
    console.error('Error fetching trainee assessments:', error);
    throw error;
  }
};

// Get assessments for a specific schedule
export const getScheduleAssessments = async (scheduleId: number): Promise<{
  success: boolean;
  data: Assessment[];
}> => {
  try {
    const response = await api.get(`/api/trainee/schedules/${scheduleId}/assessments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching schedule assessments:', error);
    throw error;
  }
};

// Get assessment details
export const getAssessment = async (id: number): Promise<{
  success: boolean;
  data: Assessment;
  attempts: AssessmentAttempt[];
  can_attempt: boolean;
  attempts_remaining: number;
}> => {
  try {
    const response = await api.get(`/api/trainee/assessments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assessment:', error);
    throw error;
  }
};

// Start a new assessment attempt
export const startAssessment = async (assessmentId: number): Promise<StartAssessmentResponse> => {
  try {
    // Start the assessment attempt
    const startResponse = await api.post(`/api/trainee/assessments/${assessmentId}/start`);
    
    if (startResponse.data.success) {
      // Get the assessment questions
      const questionsResponse = await api.get(`/api/trainee/assessments/${assessmentId}/questions`);
      
      if (questionsResponse.data.success) {
        return {
          success: true,
          attempt: questionsResponse.data.data.attempt,
          assessment: questionsResponse.data.data.assessment,
          questions: questionsResponse.data.data.questions,
          time_limit: questionsResponse.data.data.assessment.time_limit
        };
      }
    }
    
    return startResponse.data;
  } catch (error) {
    console.error('Error starting assessment:', error);
    throw error;
  }
};

// Save answer for a question (auto-save)
export const saveAnswer = async (attemptId: number, questionId: number, answerData: any): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await api.post(`/api/trainee/assessment-attempts/${attemptId}/answers`, {
      question_id: questionId,
      answer_data: answerData
    });
    return response.data;
  } catch (error) {
    console.error('Error saving answer:', error);
    throw error;
  }
};

// Submit assessment
export const submitAssessment = async (data: SubmitAssessmentData): Promise<{
  success: boolean;
  message: string;
  result?: AssessmentResult;
}> => {
  try {
    const response = await api.post(`/api/trainee/assessment-attempts/${data.attempt_id}/submit`, {
      answers: data.answers
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting assessment:', error);
    throw error;
  }
};

// Get assessment attempt details
export const getAssessmentAttempt = async (attemptId: number): Promise<{
  success: boolean;
  data: AssessmentAttempt;
  questions: AssessmentQuestion[];
}> => {
  try {
    const response = await api.get(`/api/trainee/assessment-attempts/${attemptId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assessment attempt:', error);
    throw error;
  }
};

// Get assessment results
export const getAssessmentResult = async (attemptId: number): Promise<{
  success: boolean;
  data: AssessmentResult;
}> => {
  try {
    const response = await api.get(`/api/trainee/assessment-attempts/${attemptId}/result`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assessment result:', error);
    throw error;
  }
};

// Get trainee assessment statistics
export const getAssessmentStats = async (): Promise<{
  success: boolean;
  data: AssessmentStats;
}> => {
  try {
    const response = await api.get('/api/trainee/assessments/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching assessment stats:', error);
    throw error;
  }
};

// Resume an in-progress assessment
export const resumeAssessment = async (attemptId: number, assessmentId: number): Promise<StartAssessmentResponse> => {
  try {
    // For resuming, we just need to get the assessment questions with the existing attempt
    const questionsResponse = await api.get(`/api/trainee/assessments/${assessmentId}/questions`);
    
    if (questionsResponse.data.success) {
      return {
        success: true,
        attempt: questionsResponse.data.data.attempt,
        assessment: questionsResponse.data.data.assessment,
        questions: questionsResponse.data.data.questions,
        time_limit: questionsResponse.data.data.assessment.time_limit
      };
    }
    
    throw new Error('Failed to resume assessment');
  } catch (error) {
    console.error('Error resuming assessment:', error);
    throw error;
  }
};

// Get assessment history
export const getAssessmentHistory = async (assessmentId?: number): Promise<{
  success: boolean;
  data: AssessmentAttempt[];
}> => {
  try {
    const url = assessmentId 
      ? `/api/trainee/assessments/${assessmentId}/history`
      : '/api/trainee/assessments/history';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching assessment history:', error);
    throw error;
  }
};

// Admin Assessment Functions

// Get assessments for a course (admin)
export const getAssessmentsByCourse = async (courseId: number): Promise<{
  success: boolean;
  data: Assessment[];
}> => {
  try {
    const response = await api.get(`/api/admin/courses/${courseId}/assessments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course assessments:', error);
    throw error;
  }
};

// Create assessment (admin)
export const createAssessment = async (courseId: number, assessmentData: {
  title: string;
  description: string;
  instructions: string;
  time_limit: number;
  max_attempts: number;
  passing_score: number;
  is_randomized: boolean;
  show_results_immediately: boolean;
  questions: number[];
}): Promise<{
  success: boolean;
  data: Assessment;
  message: string;
}> => {
  try {
    const response = await api.post(`/api/admin/courses/${courseId}/assessments`, {
      ...assessmentData,
      course_id: courseId,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating assessment:', error);
    throw error;
  }
};

// Update assessment (admin)
export const updateAssessment = async (assessmentId: number, assessmentData: Partial<{
  title: string;
  description: string;
  instructions: string;
  time_limit: number;
  max_attempts: number;
  passing_score: number;
  is_active: boolean;
  is_randomized: boolean;
  show_results_immediately: boolean;
}>): Promise<{
  success: boolean;
  data: Assessment;
  message: string;
}> => {
  try {
    const response = await api.put(`/api/admin/assessments/${assessmentId}`, assessmentData);
    return response.data;
  } catch (error) {
    console.error('Error updating assessment:', error);
    throw error;
  }
};

// Delete assessment (admin)
export const deleteAssessment = async (assessmentId: number): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await api.delete(`/api/admin/assessments/${assessmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting assessment:', error);
    throw error;
  }
};

// Get assessment statistics (admin)
export const getAdminAssessmentStats = async (assessmentId: number): Promise<{
  success: boolean;
  data: {
    total_attempts: number;
    submitted_attempts: number;
    passed_attempts: number;
    average_score: number;
    pass_rate: number;
    unique_trainees: number;
  };
}> => {
  try {
    const response = await api.get(`/api/admin/assessments/${assessmentId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin assessment stats:', error);
    throw error;
  }
};

// Utility functions
export const formatTimeLimit = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

export const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getScoreColor = (percentage: number): string => {
  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 80) return 'text-blue-600';
  if (percentage >= 70) return 'text-yellow-600';
  if (percentage >= 60) return 'text-orange-600';
  return 'text-red-600';
};

export const getScoreBadgeColor = (percentage: number): string => {
  if (percentage >= 90) return 'bg-green-100 text-green-800';
  if (percentage >= 80) return 'bg-blue-100 text-blue-800';
  if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
  if (percentage >= 60) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'submitted':
      return 'bg-green-100 text-green-800';
    case 'expired':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'submitted':
      return 'Submitted';
    case 'expired':
      return 'Expired';
    default:
      return status;
  }
};