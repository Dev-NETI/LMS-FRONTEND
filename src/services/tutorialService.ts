import api from '@/lib/api';
import { User } from '../types/auth';

export interface Tutorial {
  id: number;
  title: string;
  description?: string;
  video_file_name: string;
  video_file_path: string;
  video_file_type: string;
  video_file_size: number;
  video_file_size_human: string;
  duration_seconds?: number;
  duration_formatted: string;
  category: 'user_manual' | 'quality_procedure' | 'tutorial';
  total_views: number;
  is_active: boolean;
  uploaded_by_user_id?: number;
  created_at: string;
  updated_at: string;
  uploaded_by?: User;
}

export interface TutorialStats {
  total_tutorials: number;
  total_user_manuals: number;
  total_quality_procedures: number;
  total_video_tutorials: number;
  total_views: number;
  recent_uploads: number;
}

export interface CreateTutorialData {
  title: string;
  description?: string;
  video: File;
  thumbnail?: File;
  duration_seconds?: number;
  category: 'user_manual' | 'quality_procedure' | 'tutorial';
}

export interface UpdateTutorialData {
  title?: string;
  description?: string;
  duration_seconds?: number;
  category?: 'user_manual' | 'quality_procedure' | 'tutorial';
  is_active?: boolean;
}

// Get all tutorials
export const getTutorials = async (filters?: {
  category?: 'user_manual' | 'quality_procedure' | 'tutorial';
  is_active?: boolean;
  per_page?: number;
}): Promise<{
  success: boolean;
  data: Tutorial[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}> => {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const response = await api.get(`/api/admin/tutorials${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    throw error;
  }
};

// Get tutorial statistics
export const getTutorialStats = async (): Promise<{ success: boolean; stats: TutorialStats }> => {
  try {
    const response = await api.get('/api/admin/tutorials/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching tutorial stats:', error);
    throw error;
  }
};

// Create a new tutorial
export const createTutorial = async (data: CreateTutorialData): Promise<{ success: boolean; message: string; tutorial: Tutorial }> => {
  try {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('video', data.video);
    if (data.thumbnail) formData.append('thumbnail', data.thumbnail);
    if (data.duration_seconds !== undefined) formData.append('duration_seconds', data.duration_seconds.toString());
    formData.append('category', data.category);

    const response = await api.post('/api/admin/tutorials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating tutorial:', error);
    throw error;
  }
};

// Get a single tutorial
export const getTutorial = async (id: number): Promise<{ success: boolean; tutorial: Tutorial }> => {
  try {
    const response = await api.get(`/api/admin/tutorials/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tutorial:', error);
    throw error;
  }
};

// Update a tutorial
export const updateTutorial = async (id: number, data: UpdateTutorialData): Promise<{ success: boolean; message: string; tutorial: Tutorial }> => {
  try {
    const response = await api.put(`/api/admin/tutorials/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating tutorial:', error);
    throw error;
  }
};

// Delete a tutorial
export const deleteTutorial = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/api/admin/tutorials/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting tutorial:', error);
    throw error;
  }
};

// Get tutorial video URL
export const getTutorialVideoUrl = (id: number): string => {
  return `/api/admin/tutorials/${id}/video`;
};

// Get tutorial thumbnail URL
export const getTutorialThumbnailUrl = (id: number): string => {
  return `/api/admin/tutorials/${id}/thumbnail`;
};

// View tutorial thumbnail (with authentication)
export const viewTutorialThumbnail = async (id: number): Promise<string> => {
  try {
    const response = await api.get(`/api/admin/tutorials/${id}/thumbnail`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    return url;
  } catch (error) {
    console.error('Error viewing tutorial thumbnail:', error);
    throw error;
  }
};

// View tutorial video
export const viewTutorialVideo = async (id: number): Promise<string> => {
  try {
    const response = await api.get(`/api/admin/tutorials/${id}/video`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    return url;
  } catch (error) {
    console.error('Error viewing tutorial video:', error);
    throw error;
  }
};

// Bulk delete tutorials
export const bulkDeleteTutorials = async (ids: number[]): Promise<{ success: boolean; message: string; deleted_count: number }> => {
  try {
    const response = await api.post('/api/admin/tutorials/bulk-delete', { ids });
    return response.data;
  } catch (error) {
    console.error('Error bulk deleting tutorials:', error);
    throw error;
  }
};
