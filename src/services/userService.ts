import api from '@/lib/api';

export interface User {
    user_id?: number;
    f_name?: string;
    m_name?: string;
    l_name?: string;
    is_active?: boolean;
    email?: string;
}

export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }
  
export interface UserResponse {
    success: boolean;
    data: User[];
    pagination?: PaginationMeta;
    message: string;
  }

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

export const getAllUser = async (params: GetUsersParams = {}): Promise<UserResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const url = `/api/admin/all-users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const getAllInstructors = async (params: GetUsersParams = {}): Promise<UserResponse> => {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const url = `/api/admin/all-instructors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export interface Trainee {
  trainee_id?: number;
  f_name?: string;
  m_name?: string;
  l_name?: string;
  email?: string;
  username?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TraineeResponse {
  success: boolean;
  data: Trainee[];
  pagination?: PaginationMeta;
  message: string;
}

export interface GetTraineesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const getAllTrainees = async (params: GetTraineesParams = {}): Promise<TraineeResponse> => {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `/api/admin/all-trainees${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching trainees:', error);
    throw error;
  }
};

export interface EnrolledCourse {
  enrollment_id: number;
  course_id: number;
  course_name: string;
  course_code: string;
  date_registered: string;
  date_completed?: string;
  status: string;
  schedule_id: number;
}

export interface AssessmentAttempt {
  attempt_id: number;
  assessment_id: number;
  assessment_title: string;
  attempt_number: number;
  started_at: string;
  submitted_at?: string;
  time_remaining?: number;
  score?: number;
  percentage?: number;
  status: string;
  is_passed?: boolean;
  created_at: string;
}

export interface SecurityLog {
  log_id: number;
  assessment_id: number;
  assessment_title: string;
  attempt_id?: number;
  activity: string;
  event_type: string;
  severity: string;
  ip_address: string;
  user_agent: string;
  additional_data?: any;
  event_timestamp: string;
  created_at: string;
}

export interface TraineeStatistics {
  total_courses: number;
  completed_courses: number;
  total_assessments: number;
  passed_assessments: number;
  failed_assessments: number;
  security_violations: number;
  average_score: number;
}

export interface TraineeProfile {
  trainee: Trainee;
  enrolled_courses: EnrolledCourse[];
  assessment_attempts: AssessmentAttempt[];
  security_logs: SecurityLog[];
  statistics: TraineeStatistics;
}

export interface TraineeProfileResponse {
  success: boolean;
  data: TraineeProfile;
  message: string;
}

export const getTraineeProfile = async (traineeId: number): Promise<TraineeProfileResponse> => {
  try {
    const response = await api.get(`/api/admin/trainees/${traineeId}/profile`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trainee profile:', error);
    throw error;
  }
};