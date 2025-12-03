import api from '@/lib/api';

export interface Notification {
  id: number;
  user_id: number;
  user_type: 'admin' | 'trainee';
  type: 'announcement' | 'reply' | 'general';
  title: string;
  message: string;
  related_id?: number; // announcement_id or other related entity
  schedule_id?: number; // schedule_id for navigation to course overview
  is_read: boolean;
  created_at: string;
  updated_at: string;
  announcement?: {
    id: number;
    title: string;
    schedule_id: number;
    schedule?: {
      scheduleid: number;
      course_name?: string;
    };
  };
}

export interface NotificationResponse {
  notifications: Notification[];
  unread_count: number;
  total: number;
}

// Get notifications for trainee
export const getTraineeNotifications = async (limit: number = 10, unreadOnly: boolean = false): Promise<NotificationResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (unreadOnly) params.append('unread_only', 'true');
    
    const response = await api.get(`/api/trainee/notifications?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trainee notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: number): Promise<{ message: string; notification: Notification }> => {
  try {
    const response = await api.patch(`/api/trainee/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<{ message: string; updated_count: number }> => {
  try {
    const response = await api.patch('/api/trainee/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId: number): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/api/trainee/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (): Promise<{ count: number }> => {
  try {
    const response = await api.get('/api/trainee/notifications/unread-count');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    throw error;
  }
};

// Note: Announcement notifications are automatically created by the backend
// when admins create announcements through the AnnouncementController