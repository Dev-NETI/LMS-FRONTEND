import api from '@/lib/api';

export interface CourseDetail {
  id: number;
  course_id: number;
  type: 'description' | 'learning_objective' | 'prerequisite';
  content: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCourseDetailData {
  course_id: number;
  type: 'description' | 'learning_objective' | 'prerequisite';
  content: string;
  order?: number;
}

export interface UpdateCourseDetailData {
  content?: string;
  order?: number;
  is_active?: boolean;
}

export interface CourseDetailsByType {
  descriptions: CourseDetail[];
  learning_objectives: CourseDetail[];
  prerequisites: CourseDetail[];
}

export interface ReorderItem {
  id: number;
  order: number;
}

// Get all course details with optional filtering
export const getCourseDetails = async (courseId?: number, type?: string): Promise<{ success: boolean; data: any; details: CourseDetail[] }> => {
  try {
    const params = new URLSearchParams();
    if (courseId) params.append('course_id', courseId.toString());
    if (type) params.append('type', type);
    
    const response = await api.get(`/api/admin/course-details${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
};

// Get course details grouped by type for a specific course
export const getCourseDetailsByCourse = async (courseId: number): Promise<{ success: boolean; course_id: number } & CourseDetailsByType> => {
  try {
    const response = await api.get(`/api/admin/courses/${courseId}/details`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course details by course:', error);
    throw error;
  }
};

export const getCourseDetailsByCourseTrainee = async (courseId: number): Promise<{ success: boolean; course_id: number } & CourseDetailsByType> => {
  try {
    const response = await api.get(`/api/trainee/courses/${courseId}/details`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course details by course:', error);
    throw error;
  }
};

// Create a new course detail
export const createCourseDetail = async (data: CreateCourseDetailData): Promise<{ success: boolean; message: string; detail: CourseDetail }> => {
  try {
    const response = await api.post('/api/admin/course-details', data);
    return response.data;
  } catch (error) {
    console.error('Error creating course detail:', error);
    throw error;
  }
};

// Get a specific course detail
export const getCourseDetail = async (id: number): Promise<{ success: boolean; detail: CourseDetail }> => {
  try {
    const response = await api.get(`/api/admin/course-details/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course detail:', error);
    throw error;
  }
};

// Update a course detail
export const updateCourseDetail = async (id: number, data: UpdateCourseDetailData): Promise<{ success: boolean; message: string; detail: CourseDetail }> => {
  try {
    const response = await api.put(`/api/admin/course-details/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating course detail:', error);
    throw error;
  }
};

// Delete a course detail
export const deleteCourseDetail = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/api/admin/course-details/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting course detail:', error);
    throw error;
  }
};

// Reorder course details
export const reorderCourseDetails = async (items: ReorderItem[]): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post('/api/admin/course-details/reorder', { items });
    return response.data;
  } catch (error) {
    console.error('Error reordering course details:', error);
    throw error;
  }
};