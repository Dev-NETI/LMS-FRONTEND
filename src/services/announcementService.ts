import api from '@/lib/api';

export interface AnnouncementPost {
  id: number;
  schedule_id: number;
  created_by_user_id?: number;
  user_type?: 'admin' | 'trainee';
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
  id?: number;
  user_id?: number;
  traineeid?: number;
  name?: string;
  f_name?: string;
  m_name?: string;
  l_name?: string;
  suffix?: string;
  email?: string;
  user_type: 'admin' | 'trainee';
}

export interface ScheduleData {
  scheduleid: number;
  course_name?: string;
}

export interface ReplyData {
  id: number;
  announcement_id: number;
  user_id: number;
  user_type?: 'admin' | 'trainee';
  content: string;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
  user?: AnnouncementUser;
  trainee_user?: AnnouncementUser;
}

export interface ReplyResponse {
  announcement: AnnouncementPost;
  replies: {
    data: ReplyData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CreateReplyData {
  content: string;
  user_type?  : 'admin' | 'trainee';
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
  user_type?: 'admin' | 'trainee';
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

export const getAnnouncementsByScheduleTrainee = async (scheduleId: number): Promise<{ schedule: ScheduleData; announcements: AnnouncementPost[] }> => {
  try {
    const response = await api.get(`/api/trainee/schedules/${scheduleId}/announcements`);
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
    const response = await api.put(`/api/admin/announcements/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
};

export const deleteAnnouncement = async (id: number): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/api/admin/announcements/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
};

export const toggleAnnouncementActive = async (id: number): Promise<{ message: string; announcement: AnnouncementPost }> => {
  try {
    const response = await api.patch(`/api/admin/announcements/${id}/toggle-active`);
    return response.data;
  } catch (error) {
    console.error('Error toggling announcement status:', error);
    throw error;
  }
};

// Admin Reply functions
export const getAnnouncementReplies = async (announcementId: number, activeOnly: boolean = true): Promise<ReplyResponse> => {
  try {
    const response = await api.get(`/api/admin/announcements/${announcementId}/replies?active_only=${activeOnly}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching announcement replies:', error);
    throw error;
  }
};

export const createAnnouncementReply = async (announcementId: number, data: CreateReplyData): Promise<{ message: string; reply: ReplyData }> => {
  try {
    const response = await api.post(`/api/admin/announcements/${announcementId}/replies`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating reply:', error);
    throw error;
  }
};

export const updateAnnouncementReply = async (replyId: number, data: CreateReplyData): Promise<{ message: string; reply: ReplyData }> => {
  try {
    const response = await api.put(`/api/admin/replies/${replyId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating reply:', error);
    throw error;
  }
};

export const deleteAnnouncementReply = async (replyId: number): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/api/admin/replies/${replyId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting reply:', error);
    throw error;
  }
};

// Trainee Reply functions
export const getAnnouncementRepliesTrainee = async (announcementId: number, activeOnly: boolean = true): Promise<ReplyResponse> => {
  try {
    const response = await api.get(`/api/trainee/announcements/${announcementId}/replies?active_only=${activeOnly}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching announcement replies:', error);
    throw error;
  }
};

export const createAnnouncementReplyTrainee = async (announcementId: number, data: CreateReplyData): Promise<{ message: string; reply: ReplyData }> => {
  try {
    const response = await api.post(`/api/trainee/announcements/${announcementId}/replies`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating reply:', error);
    throw error;
  }
};

export const updateAnnouncementReplyTrainee = async (replyId: number, data: CreateReplyData): Promise<{ message: string; reply: ReplyData }> => {
  try {
    const response = await api.put(`/api/trainee/replies/${replyId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating reply:', error);
    throw error;
  }
};

export const deleteAnnouncementReplyTrainee = async (replyId: number): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/api/trainee/replies/${replyId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting reply:', error);
    throw error;
  }
};

export const toggleReplyActive = async (replyId: number): Promise<{ message: string; reply: ReplyData }> => {
  try {
    const response = await api.patch(`/api/admin/replies/${replyId}/toggle-active`);
    return response.data;
  } catch (error) {
    console.error('Error toggling reply status:', error);
    throw error;
  }
};