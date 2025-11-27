import { useQuery } from '@tanstack/react-query';
import { courseService, type EnrolledCoursesResponse } from '@/services/courseService';

export const useEnrolledCourses = () => {
  return useQuery<EnrolledCoursesResponse>({
    queryKey: ['enrolled-courses'],
    queryFn: () => courseService.getEnrolledCourses(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};