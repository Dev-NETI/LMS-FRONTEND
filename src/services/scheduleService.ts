import api from '@/lib/api';

export interface CourseSchedule {
  scheduleid: number;
  courseid: number;
  course?: Course;
  batchno: string;
  startdateformat: string;
  enddateformat: string;
  instructor?: string;
  location?: string;
  description?: string;
  attendees?: number;
  maxAttendees?: number;
  total_enrolled?: number;
  active_enrolled?: number;
  enrolled_students?: EnrolledStudent[];
  modeofdeliveryid?: number;
}

export interface Course {
  courseid: number;
  coursename: string;
  modeofdeliveryid?: number;
}

export interface EnrolledStudent {
  enrollment_id: number;
  trainee_id: number;
  trainee_name: string;
  date_confirmed: string;
  status: string | any;
  email?: string;
  phone?: string;
  department?: string;
  rank?: string;
  rankacronym?: string;
  contact_num?: string;
}

export interface CourseScheduleResponse {
  success: boolean;
  data: CourseSchedule[];
  message: string;
}

export const getCourseSchedule = async (id: number): Promise<CourseScheduleResponse> => {
  try {
    const response = await api.get(`/api/admin/courses-schedule/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course schedule:', error);
    throw error;
  }
};

export const getCourseScheduleById = async (id: number): Promise<CourseScheduleResponse> => {
  try {
    const response = await api.get(`/api/admin/courses/schedules/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course schedule:', error);
    throw error;
  }
};