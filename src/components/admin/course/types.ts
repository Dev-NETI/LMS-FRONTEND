export interface Course {
  courseid: number;
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  category: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  coursename?: string;
  coursedescription?: string;
  coursecategory?: string;
  coursecreationdate?: string;
  courseupdateddate?: string;
}

export interface CourseFormData {
  title: string;
  description: string;
  course_code: string;
  duration: string;
}