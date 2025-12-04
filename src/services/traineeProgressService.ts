import api from '@/lib/api';
import { User } from '../types/auth';

export interface TraineeProgress {
  id: number;
  trainee_id: number;
  course_id: number;
  course_content_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  time_spent: number;
  completion_percentage: number;
  started_at?: string;
  completed_at?: string;
  last_activity?: string;
  activity_log?: ActivityLogEntry[];
  notes?: string;
  created_at: string;
  updated_at: string;
  time_spent_human?: string;
  duration_since_start?: string;
  trainee?: User;
  course_content?: any;
}

export interface ActivityLogEntry {
  timestamp: string;
  activity: string;
  metadata: any;
}

export interface CourseProgressOverview {
  total_modules: number;
  completed_modules: number;
  in_progress_modules: number;
  remaining_modules: number;
  overall_completion_percentage: number;
  total_time_spent: number;
}

export interface CourseProgressResponse {
  success: boolean;
  trainee_id: number;
  course_id: number;
  overview: CourseProgressOverview;
  modules: TraineeProgress[];
}

export interface ProgressStatistics {
  total_trainees: number;
  active_trainees: number;
  completed_trainees: number;
  average_completion: number;
  total_time_spent: number;
}

export interface TraineeProgressByCourseResponse {
  success: boolean;
  course_id: number;
  course: any;
  progress: TraineeProgress[];
  statistics: ProgressStatistics;
  enrolled_trainees: number[];
}

export interface TraineeProgressData {
  trainee_id: number;
  trainee_name: string;
  email: string;
  rank: string;
  course_id: number;
  progress: TraineeProgress[];
  total_modules: number;
  completed_modules: number;
  in_progress_modules: number;
  total_time_spent: number;
  overall_completion_percentage: number;
  last_activity?: string;
}

export interface TraineeProgressByScheduleResponse {
  success: boolean;
  schedule_id: number;
  course_id: number;
  enrolled_trainees: any[];
  progress_data: TraineeProgressData[];
  statistics: ProgressStatistics;
}

export interface ProgressReportSummary {
  total_progress_records: number;
  completed_modules: number;
  in_progress_modules: number;
  not_started_modules: number;
  total_time_spent: number;
  average_completion: number;
  active_trainees: number;
  active_courses: number;
}

export interface ProgressReportResponse {
  success: boolean;
  progress: TraineeProgress[];
  summary: ProgressReportSummary;
}

// Get course progress for a trainee
export const getCourseProgress = async (courseId: number,  scheduleId?: number): Promise<CourseProgressResponse> => {
  try {
    const response = await api.get(`/api/trainee/courses/${courseId}/progress/${scheduleId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course progress:', error);
    throw error;
  }
};

// Get all trainees' progress for a course (admin only)
export const getTraineeProgressByCourse = async (courseId: number, status?: string): Promise<TraineeProgressByCourseResponse> => {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const response = await api.get(`/api/admin/courses/${courseId}/progress/trainees${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trainee progress by course:', error);
    throw error;
  }
};

// Get all trainees' progress for a schedule (admin only) - NEW METHOD
export const getTraineeProgressBySchedule = async (scheduleId: number, status?: string): Promise<TraineeProgressByScheduleResponse> => {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const response = await api.get(`/api/admin/schedules/${scheduleId}/progress${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trainee progress by schedule:', error);
    throw error;
  }
};

// Mark a module as started
export const markModuleAsStarted = async (data: { trainee_id: number; course_content_id: number }): Promise<{ success: boolean; message: string; progress: TraineeProgress }> => {
  try {
    const response = await api.post('/api/trainee/progress/start', data);
    return response.data;
  } catch (error) {
    console.error('Error marking module as started:', error);
    throw error;
  }
};

// Mark a module as completed
export const markModuleAsCompleted = async (data: { trainee_id: number; course_content_id: number; time_spent?: number }): Promise<{ success: boolean; message: string; progress: TraineeProgress }> => {
  try {
    const response = await api.post('/api/trainee/progress/complete', data);
    return response.data;
  } catch (error) {
    console.error('Error marking module as completed:', error);
    throw error;
  }
};

// Update progress for a module
export const updateModuleProgress = async (data: {
  trainee_id: number;
  course_content_id: number;
  completion_percentage: number;
  time_spent?: number;
  notes?: string;
}): Promise<{ success: boolean; message: string; progress: TraineeProgress }> => {
  try {
    const response = await api.post('/api/trainee/progress/update', data);
    return response.data;
  } catch (error) {
    console.error('Error updating module progress:', error);
    throw error;
  }
};

// Get comprehensive progress report (admin only)
export const getProgressReport = async (filters?: {
  course_id?: number;
  trainee_id?: number;
  date_from?: string;
  date_to?: string;
}): Promise<ProgressReportResponse> => {
  try {
    const params = new URLSearchParams();
    if (filters?.course_id) params.append('course_id', filters.course_id.toString());
    if (filters?.trainee_id) params.append('trainee_id', filters.trainee_id.toString());
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    
    const response = await api.get(`/api/admin/progress/report${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching progress report:', error);
    throw error;
  }
};

// Get activity log for a specific progress record
export const getActivityLog = async (progressId: number): Promise<{ success: boolean; progress: TraineeProgress; activity_log: ActivityLogEntry[] }> => {
  try {
    const response = await api.get(`/api/admin/progress/${progressId}/activity-log`);
    return response.data;
  } catch (error) {
    console.error('Error fetching activity log:', error);
    throw error;
  }
};

// Helper functions for formatting and calculations
export const formatTimeSpent = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'in_progress':
      return 'text-yellow-600 bg-yellow-100';
    case 'not_started':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'In Progress';
    case 'not_started':
      return 'Not Started';
    default:
      return 'Unknown';
  }
};

export const calculateProgressPercentage = (completedModules: number, totalModules: number): number => {
  if (totalModules === 0) return 0;
  return Math.round((completedModules / totalModules) * 100);
};

export const getProgressBarColor = (percentage: number): string => {
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 60) return 'bg-blue-500';
  if (percentage >= 40) return 'bg-yellow-500';
  if (percentage >= 20) return 'bg-orange-500';
  return 'bg-red-500';
};

// Calculate estimated completion time based on current progress
export const calculateEstimatedCompletion = (
  totalModules: number,
  completedModules: number,
  averageTimePerModule: number
): { estimatedHours: number; estimatedDays: number } => {
  if (completedModules === 0) {
    return { estimatedHours: 0, estimatedDays: 0 };
  }
  
  const remainingModules = totalModules - completedModules;
  const estimatedMinutes = remainingModules * averageTimePerModule;
  const estimatedHours = Math.round(estimatedMinutes / 60);
  const estimatedDays = Math.round(estimatedHours / 8); // Assuming 8 hours per day
  
  return { estimatedHours, estimatedDays };
};