"use client";

import React from "react";
import { Course } from "./types";

interface CourseContentProps {
  course: Course;
}

export default function CourseContentPage({ course }: CourseContentProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Course Syllabus
      </h3>
      <div className="space-y-4">
        {course.syllabus?.map((item, index) => (
          <div
            key={`syllabus-${index}`}
            className="flex items-center p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">
                {index + 1}
              </span>
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-900">{item}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
