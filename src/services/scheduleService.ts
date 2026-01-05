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

// Trainee-specific function to get all schedules from enrolled courses
export const getAllTraineeSchedules = async (): Promise<CourseScheduleResponse> => {
  try {
    // Get all enrolled courses for the trainee
    const enrolledResponse = await api.get('/api/trainee/enrolled-courses');
    
    if (enrolledResponse.data.success && enrolledResponse.data.data) {
      // Transform all enrolled course data to match CourseSchedule interface
      const scheduleData: CourseSchedule[] = enrolledResponse.data.data.map((enrolledCourse: any) => ({
        scheduleid: enrolledCourse.scheduleid,
        courseid: enrolledCourse.courseid,
        course: {
          courseid: enrolledCourse.courseid,
          coursename: enrolledCourse.course?.coursename || '',
          modeofdeliveryid: enrolledCourse.course?.modeofdeliveryid,
        },
        batchno: enrolledCourse.schedule?.batchno || '',
        startdateformat: enrolledCourse.schedule?.startdateformat || '',
        enddateformat: enrolledCourse.schedule?.enddateformat || '',
        total_enrolled: 0, // We don't have this data in enrolled courses
      }));
      
      return {
        success: true,
        data: scheduleData,
        message: 'Schedules retrieved successfully'
      };
    } else {
      throw new Error('Failed to fetch enrolled courses');
    }
  } catch (error) {
    console.error('Error fetching trainee schedules:', error);
    throw error;
  }
};

// Trainee-specific function to get schedule details from enrolled courses
export const getScheduleForTrainee = async (scheduleId: number): Promise<CourseScheduleResponse> => {
  try {
    // Get all enrolled courses for the trainee
    const enrolledResponse = await api.get('/api/trainee/enrolled-courses');
    
    if (enrolledResponse.data.success && enrolledResponse.data.data) {
      // Find the specific schedule from enrolled courses
      const enrolledCourse = enrolledResponse.data.data.find(
        (course: any) => course.scheduleid === scheduleId
      );
      
      if (enrolledCourse) {
        // Transform the enrolled course data to match CourseSchedule interface
        const scheduleData: CourseSchedule = {
          scheduleid: enrolledCourse.scheduleid,
          courseid: enrolledCourse.courseid,
          course: {
            courseid: enrolledCourse.courseid,
            coursename: enrolledCourse.course?.coursename || '',
            modeofdeliveryid: enrolledCourse.course?.modeofdeliveryid,
          },
          batchno: enrolledCourse.schedule?.batchno || '',
          startdateformat: enrolledCourse.schedule?.startdateformat || '',
          enddateformat: enrolledCourse.schedule?.enddateformat || '',
          total_enrolled: 0, // We don't have this data in enrolled courses
        };
        
        return {
          success: true,
          data: [scheduleData],
          message: 'Schedule retrieved successfully'
        };
      } else {
        throw new Error('Schedule not found in enrolled courses');
      }
    } else {
      throw new Error('Failed to fetch enrolled courses');
    }
  } catch (error) {
    console.error('Error fetching trainee schedule:', error);
    throw error;
  }
};