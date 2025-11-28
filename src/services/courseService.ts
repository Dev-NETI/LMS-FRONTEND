import api from '@/lib/api';

export interface EnrolledCourse {
  id: number;
  enroledid: number;
  traineeid: number;
  courseid: number;
  dateregistered: string;
  datecompleted: string | null;
  status: string;
  course: {
    coursecode: string;
    coursename: string;
  }
  schedule: {
    batchno: string;
    startdateformat: string;
    enddateformat: string;
  }
}

export interface EnrolledCoursesResponse {
  success: boolean;
  data: EnrolledCourse[];
  message: string;
}

// Admin Course Interface
export interface AdminCourse {
  courseid: number;
  coursecode: string;
  coursename: string;
  coursedescription?: string;
  coursetype?: string;
  courseformat?: string;
  coursecategory?: string;
  coursecreationdate: string;
  courseupdateddate: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminCoursesResponse {
  success: boolean;
  data: AdminCourse[];
  pagination: PaginationMeta;
  message: string;
}

export const getEnrolledCourses = async (): Promise<EnrolledCoursesResponse> => {
  try {
    const response = await api.get('/api/trainee/enrolled-courses');
    return response.data;
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    throw error;
  }
};

// Admin Courses API
export const getAllCourses = async (params: PaginationParams = {}): Promise<AdminCoursesResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    
    const url = `/api/admin/courses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

export const getCourseById = async (id: number): Promise<{ success: boolean; data: AdminCourse; message: string }> => {
  try {
    const response = await api.get(`/api/admin/courses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};
