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

// Create a new training material
export const createTrainingMaterial = async (data: CreateTrainingMaterialData): Promise<{ success: boolean; message: string; material: TrainingMaterial }> => {
  try {
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

// Download a training material
export const downloadTrainingMaterial = async (id: number): Promise<void> => {
  try {
    const response = await api.get(`/api/admin/training-materials/${id}/download`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from response headers
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'download';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
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