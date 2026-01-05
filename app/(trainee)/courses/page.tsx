"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  PlayIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/src/context/AuthContext";
import {
  getEnrolledCourses,
  type EnrolledCourse,
} from "@/src/services/courseService";
import toast from "react-hot-toast";

export default function CoursesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        const response = await getEnrolledCourses();

        console.log(response);
        if (response.success) {
          setEnrolledCourses(response.data);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Failed to fetch enrolled courses:", error);
        toast.error("Failed to load enrolled courses");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const filteredCourses = enrolledCourses.filter((course) => {
    return (
      course.courseid.toString().includes(searchTerm) ||
      course.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Enrolled Courses
              </h1>
              <p className="text-gray-600 mt-1">Track your learning progress</p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by course ID or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            {loading ? (
              "Loading courses..."
            ) : (
              <>
                Showing {filteredCourses.length} of {enrolledCourses.length}{" "}
                enrolled courses
              </>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">
                Loading your courses...
              </span>
            </div>
          )}

          {/* Enrolled Courses Grid */}
          {!loading && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((enrolledCourse) => (
                  <div
                    key={`enrolled-${enrolledCourse.enroledid}`}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Course Thumbnail */}
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <AcademicCapIcon className="w-16 h-16 text-white opacity-80" />
                    </div>

                    {/* Course Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {enrolledCourse.course.coursename}
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {/* Course Info */}
                        <div className="text-sm text-gray-600">
                          <p className="mb-2">
                            <strong>Batch Number:</strong>{" "}
                            {enrolledCourse.schedule.batchno}
                          </p>
                          <p className="mb-2">
                            <strong>Training date:</strong>{" "}
                            {new Date(
                              enrolledCourse.schedule.startdateformat
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                            {" to "}{" "}
                            {new Date(
                              enrolledCourse.schedule.enddateformat
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() =>
                            router.push(
                              `/courses/${enrolledCourse.scheduleid}/overview`
                            )
                          }
                          className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-4"
                        >
                          <PlayIcon className="w-4 h-4" />
                          <span>Open Course</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {filteredCourses.length === 0 && !loading && (
                  <div className="col-span-full text-center py-12">
                    <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No enrolled courses found
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm
                        ? "Try adjusting your search criteria"
                        : "You haven't enrolled in any courses yet"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
}
