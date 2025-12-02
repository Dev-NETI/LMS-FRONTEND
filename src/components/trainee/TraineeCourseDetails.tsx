"use client";

import React, { useState, useEffect } from "react";
import {
  getCourseDetailsByCourseTrainee,
  CourseDetail,
  CourseDetailsByType,
} from "@/src/services/courseDetailService";
import { authService } from "@/src/services/authService";

interface TraineeCourseDetailsProps {
  courseId: number;
}

export default function TraineeCourseDetails({
  courseId,
}: TraineeCourseDetailsProps) {
  const [courseDetails, setCourseDetails] = useState<CourseDetailsByType>({
    descriptions: [],
    learning_objectives: [],
    prerequisites: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    if (!courseId) return;

    setIsLoading(true);
    try {
      const response = await getCourseDetailsByCourseTrainee(courseId);
      setCourseDetails({
        descriptions: response.descriptions,
        learning_objectives: response.learning_objectives,
        prerequisites: response.prerequisites,
      });
    } catch (error) {
      console.error("Failed to fetch course details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    items: CourseDetail[]
  ) => (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">{icon}</div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      </div>

      <div className="p-4">
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-start space-x-3 p-3 border border-gray-100 rounded-lg bg-gray-50"
              >
                <span className="text-sm text-blue-600 font-medium mt-1 w-6">
                  {index + 1}.
                </span>
                <p className="text-gray-700 text-sm leading-relaxed flex-1">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">{icon}</div>
            <p className="text-gray-500 text-sm">
              No {title.toLowerCase()} available for this course.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderSection(
        "Course Descriptions",
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>,
        courseDetails.descriptions
      )}

      {renderSection(
        "Learning Objectives",
        <svg
          className="w-6 h-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>,
        courseDetails.learning_objectives
      )}

      {renderSection(
        "Prerequisites",
        <svg
          className="w-6 h-6 text-orange-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>,
        courseDetails.prerequisites
      )}
    </div>
  );
}
