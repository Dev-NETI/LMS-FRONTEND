import api from '@/lib/api';
import { User } from '../types/auth';

export interface CourseContent {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  content_type: 'file' | 'url';
  file_type?: 'articulate_html' | 'pdf' | 'link';
  file_name?: string;
  file_path?: string;
  url?: string;
  mime_type?: string;
  file_size?: number;
  order: number;
  is_active: boolean;
  uploaded_by_user_id?: number;
  created_at: string;
  updated_at: string;
  file_size_human?: string;
  uploaded_by?: User;
}

export interface CreateCourseContentData {
  course_id: number;
  title: string;
  description?: string;
  content_type: 'file' | 'url';
  file_type?: 'articulate_html' | 'pdf';
  file?: File;
  url?: string;
  order?: number;
}

export interface UpdateCourseContentData {
  title?: string;
  description?: string;
  url?: string;
  order?: number;
  is_active?: boolean;
}

export interface CourseContentByType {
  articulate_contents: CourseContent[];
  pdf_contents: CourseContent[];
  link_contents: CourseContent[];
}

// Get all course contents with optional filtering
export const getCourseContents = async (courseId?: number, contentType?: string, fileType?: string): Promise<{ success: boolean; data: CourseContent[] }> => {
  try {
    const params = new URLSearchParams();
    if (courseId) params.append('course_id', courseId.toString());
    if (contentType) params.append('content_type', contentType);
    if (fileType) params.append('file_type', fileType);
    
    const response = await api.get(`/api/admin/course-content${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course contents:', error);
    throw error;
  }
};

// Get course contents for a specific course
export const getCourseContentsByCourse = async (courseId: number): Promise<{ 
  success: boolean; 
  course_id: number; 
  contents: CourseContent[];
  total_count: number;
} & CourseContentByType> => {
  try {
    const response = await api.get(`/api/admin/courses/${courseId}/content`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course contents by course:', error);
    throw error;
  }
};

// Create a new course content (file upload)
export const createCourseContentFile = async (data: CreateCourseContentData & { file: File; file_type: 'articulate_html' | 'pdf' }): Promise<{ success: boolean; message: string; content: CourseContent }> => {
  try {
    // Validate file before upload
    const validation = validateFileForUpload(data.file, data.file_type);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('course_id', data.course_id.toString());
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('content_type', 'file');
    formData.append('file_type', data.file_type);
    formData.append('file', data.file);
    if (data.order !== undefined) formData.append('order', data.order.toString());

    const response = await api.post('/api/admin/course-content', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating course content file:', error);
    throw error;
  }
};

// Create a new course content (URL)
export const createCourseContentUrl = async (data: CreateCourseContentData & { url: string }): Promise<{ success: boolean; message: string; content: CourseContent }> => {
  try {
    // Validate URL
    if (!isValidUrl(data.url)) {
      throw new Error('Please enter a valid URL');
    }

    const requestData = {
      course_id: data.course_id,
      title: data.title,
      description: data.description,
      content_type: 'url' as const,
      url: data.url,
      order: data.order || 0,
    };

    const response = await api.post('/api/admin/course-content', requestData);
    return response.data;
  } catch (error) {
    console.error('Error creating course content URL:', error);
    throw error;
  }
};

// Get a specific course content
export const getCourseContent = async (id: number): Promise<{ success: boolean; content: CourseContent }> => {
  try {
    const response = await api.get(`/api/admin/course-content/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course content:', error);
    throw error;
  }
};

// Update a course content
export const updateCourseContent = async (id: number, data: UpdateCourseContentData): Promise<{ success: boolean; message: string; content: CourseContent }> => {
  try {
    const response = await api.put(`/api/admin/course-content/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating course content:', error);
    throw error;
  }
};

// Delete a course content
export const deleteCourseContent = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/api/admin/course-content/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting course content:', error);
    throw error;
  }
};

// Helper function to validate files for upload
export const validateFileForUpload = (
  file: File,
  fileType: 'articulate_html' | 'pdf'
): { isValid: boolean; error?: string } => {
  const maxSize = 500 * 1024 * 1024; // 500MB in bytes

  if (fileType === 'articulate_html') {
    const allowedTypes = ['application/zip', 'application/x-zip-compressed'];
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Articulate HTML content must be uploaded as a ZIP file' };
    }
  } else if (fileType === 'pdf') {
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Only PDF files are allowed' };
    }
  }

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 500MB' };
  }

  return { isValid: true };
};

// Helper function to validate URLs
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// View a course content file
export const viewCourseContent = async (id: number): Promise<string> => {
  try {
    const response = await api.get(`/api/admin/course-content/${id}/view`, {
      responseType: 'blob',
    });
    
    // Get the content type from response headers or default based on file type
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    
    const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
    return url;
  } catch (error) {
    console.error('Error viewing course content:', error);
    throw error;
  }
};

// Download a course content file
export const downloadCourseContent = async (id: number, fileName: string): Promise<void> => {
  try {
    const response = await api.get(`/api/admin/course-content/${id}/download`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading course content:', error);
    throw error;
  }
};

// Trainee-specific function to get course contents
export const getCourseContentForTrainee = async (courseId: number): Promise<{ success: boolean; data: CourseContent[] }> => {
  try {
    const response = await api.get(`/api/trainee/courses/${courseId}/content`);
    return {
      success: response.data.success,
      data: response.data.contents || response.data.data || []
    };
  } catch (error) {
    console.error('Error fetching course content for trainee:', error);
    throw error;
  }
};

// Get Articulate content URL for viewing (auto-detects user context)
export const getArticulateContent = async (id: number): Promise<{ 
  success: boolean; 
  index_url: string; 
  content_id: number; 
  title: string 
}> => {
  try {
    // Try admin endpoint first, fallback to trainee if 403
    let response;
    try {
      console.log('Trying admin endpoint for Articulate content:', id);
      response = await api.get(`/api/admin/course-content/${id}/articulate`);
      console.log('Admin endpoint success:', response.data);
    } catch (error: any) {
      console.log('Admin endpoint failed:', error.response?.status, error.response?.data);
      if (error.response?.status === 403) {
        // Fallback to trainee endpoint
        console.log('Trying trainee endpoint for Articulate content:', id);
        response = await api.get(`/api/trainee/course-content/${id}/articulate`);
        console.log('Trainee endpoint success:', response.data);
      } else {
        throw error;
      }
    }
    return response.data;
  } catch (error) {
    console.error('Error getting Articulate content:', error);
    throw error;
  }
};

// Get Articulate content URL for trainees
export const getArticulateContentForTrainee = async (id: number): Promise<{ 
  success: boolean; 
  index_url: string; 
  content_id: number; 
  title: string 
}> => {
  try {
    const response = await api.get(`/api/trainee/course-content/${id}/articulate`);
    return response.data;
  } catch (error) {
    console.error('Error getting Articulate content for trainee:', error);
    throw error;
  }
};

// Cleanup extracted Articulate content (admin only)
export const cleanupArticulateContent = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/api/admin/course-content/${id}/cleanup`);
    return response.data;
  } catch (error) {
    console.error('Error cleaning up Articulate content:', error);
    throw error;
  }
};

// Update multiple course content order
export const updateCourseContentOrder = async (updates: { id: number; order: number }[]): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.put('/api/admin/course-content/update-order', { updates });
    return response.data;
  } catch (error) {
    console.error('Error updating content order:', error);
    throw error;
  }
};

// Get the next order number for a course
export const getNextOrderForCourse = async (courseId: number): Promise<{ nextOrder: number }> => {
  try {
    const response = await api.get(`/api/admin/courses/${courseId}/content/next-order`);
    return response.data;
  } catch (error) {
    console.error('Error getting next order:', error);
    throw error;
  }
};