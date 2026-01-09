import api from '@/lib/api';
import { User } from '../types/auth';

export interface TrainingMaterial {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_category_type: 'handout' | 'document' | 'manual';
  file_size: number;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  file_size_human?: string;
  uploaded_by?: User;
}

export interface CreateTrainingMaterialData {
  course_id: number;
  title: string;
  description?: string;
  file: File;
  file_category_type: 'handout' | 'document' | 'manual';
  order?: number;
}

export interface UpdateTrainingMaterialData {
  title?: string;
  description?: string;
  file_category_type?: 'handout' | 'document' | 'manual';
  order?: number;
  is_active?: boolean;
}

// Get all training materials with optional filtering
export const getTrainingMaterials = async (courseId?: number): Promise<{ success: boolean; data: TrainingMaterial[] }> => {
  try {
    const params = new URLSearchParams();
    if (courseId) params.append('course_id', courseId.toString());
    
    const response = await api.get(`/api/admin/training-materials${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching training materials:', error);
    throw error;
  }
};

export interface TrainingMaterialsByCategory {
  handouts: TrainingMaterial[];
  documents: TrainingMaterial[];
  manuals: TrainingMaterial[];
}

// Get training materials for a specific course
export const getTrainingMaterialsByCourse = async (courseId: number): Promise<{ success: boolean; course_id: number; materials: TrainingMaterial[] } & TrainingMaterialsByCategory> => {
  try {
    const response = await api.get(`/api/admin/courses/${courseId}/training-materials`);
    return response.data;
  } catch (error) {
    console.error('Error fetching training materials by course:', error);
    throw error;
  }
};

// Trainee-specific function to get training materials (read-only)

export const getTrainingMaterialsByCourseTrainee = async (courseId: number): Promise<{ success: boolean; course_id: number; materials: TrainingMaterial[] } & TrainingMaterialsByCategory> => {
  try {
    const response = await api.get(`/api/trainee/courses/${courseId}/training-materials`);
    return response.data;
  } catch (error) {
    console.error('Error fetching training materials by course:', error);
    throw error;
  }
};

// Create a new training material
export const createTrainingMaterial = async (data: CreateTrainingMaterialData): Promise<{ success: boolean; message: string; material: TrainingMaterial }> => {
  try {
    // Validate PDF file before upload
    const validation = validatePdfFile(data.file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('course_id', data.course_id.toString());
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('file', data.file);
    formData.append('file_category_type', data.file_category_type);
    if (data.order !== undefined) formData.append('order', data.order.toString());

    const response = await api.post('/api/admin/training-materials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating training material:', error);
    throw error;
  }
};

// Get a specific training material
export const getTrainingMaterial = async (id: number): Promise<{ success: boolean; material: TrainingMaterial }> => {
  try {
    const response = await api.get(`/api/admin/training-materials/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching training material:', error);
    throw error;
  }
};

// Update a training material
export const updateTrainingMaterial = async (id: number, data: UpdateTrainingMaterialData): Promise<{ success: boolean; message: string; material: TrainingMaterial }> => {
  try {
    const response = await api.put(`/api/admin/training-materials/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating training material:', error);
    throw error;
  }
};

// Delete a training material
export const deleteTrainingMaterial = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/api/admin/training-materials/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting training material:', error);
    throw error;
  }
};

// Helper function to validate PDF files
export const validatePdfFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['application/pdf'];
  const maxSize = 50 * 1024 * 1024; // 50MB in bytes

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only PDF files are allowed' };
  }

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 50MB' };
  }

  return { isValid: true };
};

// View a training material
export const viewTrainingMaterial = async (id: number): Promise<string> => {
  try {
    const response = await api.get(`/api/admin/training-materials/${id}/view`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    return url;
  } catch (error) {
    console.error('Error viewing training material:', error);
    throw error;
  }
};

export const viewTrainingMaterialTrainee = async (id: number): Promise<string> => {
  try {
    const response = await api.get(`/api/trainee/training-materials/${id}/view`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    return url;
  } catch (error) {
    console.error('Error viewing training material:', error);
    throw error;
  }
};

export const viewTrainingMaterialTraineeWithCourse = async (courseId: number, materialId: number): Promise<string> => {
  try {
    const response = await api.get(`/api/trainee/courses/${courseId}/training-materials/${materialId}/view`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    return url;
  } catch (error) {
    console.error('Error viewing training material:', error);
    throw error;
  }
};

// Enhanced interface for document management view
export interface TrainingMaterialWithCourse extends TrainingMaterial {
  course_name?: string;
  course_code?: string;
  instructor_name?: string;
  downloads?: number;
  views?: number;
  uploaded_by?: User;
}

export interface DocumentManagementStats {
  total_documents: number;
  total_handouts: number;
  total_manuals: number;
  total_size: number;
  total_size_human: string;
  recent_uploads: number;
  active_courses: number;
}

// Get all training materials across all courses for document management
export const getAllTrainingMaterials = async (filters?: {
  search?: string;
  file_category_type?: 'handout' | 'document' | 'manual' | 'all';
  course_id?: number;
  is_active?: boolean;
  sort_by?: 'created_at' | 'title' | 'file_size' | 'views';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}): Promise<{
  success: boolean;
  data: TrainingMaterialWithCourse[];
  stats: DocumentManagementStats;
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}> => {
  try {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.file_category_type && filters.file_category_type !== 'all') {
      params.append('file_category_type', filters.file_category_type);
    }
    if (filters?.course_id) params.append('course_id', filters.course_id.toString());
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters?.sort_by) params.append('sort_by', filters.sort_by);
    if (filters?.sort_order) params.append('sort_order', filters.sort_order);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const response = await api.get(`/api/admin/documents/all${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all training materials:', error);
    throw error;
  }
};

// Download a training material
export const downloadTrainingMaterial = async (id: number): Promise<void> => {
  try {
    const response = await api.get(`/api/admin/training-materials/${id}/download`, {
      responseType: 'blob',
    });

    // Get filename from content-disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'document.pdf';
    if (contentDisposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    // Create blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading training material:', error);
    throw error;
  }
};

// Bulk delete training materials
export const bulkDeleteTrainingMaterials = async (ids: number[]): Promise<{ success: boolean; message: string; deleted_count: number }> => {
  try {
    const response = await api.post('/api/admin/training-materials/bulk-delete', { ids });
    return response.data;
  } catch (error) {
    console.error('Error bulk deleting training materials:', error);
    throw error;
  }
};

// Bulk update training materials status
export const bulkUpdateTrainingMaterialsStatus = async (ids: number[], is_active: boolean): Promise<{ success: boolean; message: string; updated_count: number }> => {
  try {
    const response = await api.post('/api/admin/training-materials/bulk-update-status', { ids, is_active });
    return response.data;
  } catch (error) {
    console.error('Error bulk updating training materials:', error);
    throw error;
  }
};