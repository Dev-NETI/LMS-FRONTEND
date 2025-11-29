import api from '@/lib/api';

export interface AnnouncementPost {
  id: number;
  schedule_id: number;
  created_by_user_id?: number;
  title: string;
  content: string;
  is_active: boolean;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  replies_count?: number;
  created_by_user?: AnnouncementUser;
  schedule?: ScheduleData;
  active_replies?: ReplyData[];
}

export interface AnnouncementUser {
  user_id: number;
  f_name: string;
  m_name?: string;
  l_name?: string;
  suffix?: string;
}

export interface ScheduleData {
  scheduleid: number;
  course_name?: string;
}

export interface ReplyData {
  id: number;
  content: string;
  created_at: string;
  user?: AnnouncementUser;
}

export interface AnnouncementResponse {
  data: AnnouncementPost[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CreateAnnouncementData {
  schedule_id: number;
  title: string;
  content: string;
  is_active?: boolean;
  published_at?: string;
}

export const getAnnouncementsBySchedule = async (scheduleId: number): Promise<{ schedule: ScheduleData; announcements: AnnouncementPost[] }> => {
  try {
    const response = await api.get(`/api/admin/schedules/${scheduleId}/announcements`);
    return response.data;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
};

export const getAllAnnouncements = async (params?: {
  schedule_id?: number;
  active_only?: boolean;
  with_replies?: boolean;
  per_page?: number;
}): Promise<AnnouncementResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.schedule_id) queryParams.append('schedule_id', params.schedule_id.toString());
    if (params?.active_only !== undefined) queryParams.append('active_only', params.active_only.toString());
    if (params?.with_replies !== undefined) queryParams.append('with_replies', params.with_replies.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    
    const response = await api.get(`/api/announcements?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
};

export const createAnnouncement = async (data: CreateAnnouncementData): Promise<{ message: string; announcement: AnnouncementPost }> => {
  try {
    const response = await api.post('/api/admin/announcements', data);
    return response.data;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
};

export const getAnnouncementById = async (id: number): Promise<AnnouncementPost> => {
  try {
    const response = await api.get(`/api/announcements/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching announcement:', error);
    throw error;
  }
};

export const updateAnnouncement = async (id: number, data: Partial<CreateAnnouncementData>): Promise<{ message: string; announcement: AnnouncementPost }> => {
  try {
    const response = await api.put(`/api/announcements/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
};

export const deleteAnnouncement = async (id: number): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/api/announcements/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
};

export const toggleAnnouncementActive = async (id: number): Promise<{ message: string; announcement: AnnouncementPost }> => {
  try {
    const response = await api.patch(`/api/announcements/${id}/toggle-active`);
    return response.data;
  } catch (error) {
    console.error('Error toggling announcement status:', error);
    throw error;
  }
};