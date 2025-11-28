import { AdminCourse } from "@/src/services/courseService";

// Use AdminCourse from service and extend with frontend properties
export type Course = AdminCourse & {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  status: "Published" | "Draft" | "Archived";
  price?: number;
  tags: string[];
  syllabus?: string[];
  requirements?: string[];
  objectives?: string[];
};

export interface Student {
  id: number;
  name: string;
  email: string;
  enrolledAt: string;
  progress: number;
  status: "Active" | "Completed" | "Dropped";
  lastActivity: string;
}
