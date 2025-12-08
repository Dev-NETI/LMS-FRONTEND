"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BookOpenIcon,
  MegaphoneIcon,
  DocumentTextIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import {
  CourseSchedule,
  getScheduleForTrainee,
} from "@/src/services/scheduleService";

interface TraineeScheduleOverviewProps {
  scheduleId: number;
  onTabChange: (tab: string) => void;
  activeTab: string;
}

export default function TraineeScheduleOverview({
  scheduleId,
  onTabChange,
  activeTab,
}: TraineeScheduleOverviewProps) {
  const [schedule, setSchedule] = useState<CourseSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScheduleDetails = async () => {
      if (!scheduleId) return;

      setIsLoading(true);
      setError(null);

      try {
        const scheduleResponse = await getScheduleForTrainee(scheduleId);
        if (scheduleResponse.success && scheduleResponse.data) {
          const scheduleData = Array.isArray(scheduleResponse.data)
            ? scheduleResponse.data[0]
            : scheduleResponse.data;
          setSchedule(scheduleData);
        } else {
          setError(
            scheduleResponse.message || "Failed to fetch schedule details"
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch schedule details";
        setError(errorMessage);
        console.error("Error fetching schedule:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheduleDetails();
  }, [scheduleId]);

  const getDurationInDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const isScheduleActive = () => {
    if (!schedule?.startdateformat || !schedule?.enddateformat) return false;
    const now = new Date();
    const startDate = new Date(schedule.startdateformat);
    const endDate = new Date(schedule.enddateformat);
    return now >= startDate && now <= endDate;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-96 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs skeleton */}
        <div className="bg-white border-b border-gray-200 animate-pulse">
          <div className="flex space-x-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-12 bg-gray-200 rounded w-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 text-red-500 mb-4">
          <CalendarIcon className="w-16 h-16" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {error ? "Failed to load schedule" : "Schedule not found"}
        </h2>
        <p className="text-gray-600 mb-4">
          {error || "The schedule you're looking for doesn't exist."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {schedule.batchno} - {schedule.course?.coursename}
            </h1>
            <p className="text-blue-100 mb-4">
              Your training schedule and progress overview
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5" />
                <span className="text-sm">
                  {schedule.startdateformat &&
                    new Date(
                      schedule.startdateformat
                    ).toLocaleDateString()}{" "}
                  -{" "}
                  {schedule.enddateformat &&
                    new Date(schedule.enddateformat).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Start Date</p>
              <p className="text-xl font-bold text-gray-900">
                {schedule.startdateformat
                  ? new Date(schedule.startdateformat).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">End Date</p>
              <p className="text-xl font-bold text-gray-900">
                {schedule.enddateformat
                  ? new Date(schedule.enddateformat).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Duration</p>
              <p className="text-xl font-bold text-gray-900">
                {schedule.startdateformat && schedule.enddateformat
                  ? getDurationInDays(
                      schedule.startdateformat,
                      schedule.enddateformat
                    )
                  : "0"}{" "}
                days
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <AcademicCapIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Course Mode</p>
              <p className="text-xl font-bold text-gray-900">
                {schedule.course?.modeofdeliveryid === 4
                  ? "Self-Paced"
                  : "Scheduled"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 rounded-lg">
        <nav className="flex space-x-0">
          <button
            onClick={() => onTabChange("announcements")}
            className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center transition-colors ${
              activeTab === "announcements"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <MegaphoneIcon className="w-5 h-5 mr-2" />
            Announcements
          </button>

          <button
            onClick={() => onTabChange("course_overview")}
            className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center transition-colors ${
              activeTab === "course_overview"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <AcademicCapIcon className="w-5 h-5 mr-2" />
            Course Overview
          </button>

          {schedule.course?.modeofdeliveryid === 4 && (
            <button
              onClick={() => onTabChange("progress")}
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center transition-colors ${
                activeTab === "progress"
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ChartBarIcon className="w-5 h-5 mr-2" />
              My Progress
            </button>
          )}

          <button
            onClick={() => onTabChange("materials")}
            className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center transition-colors ${
              activeTab === "materials"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Training Materials
          </button>

          <button
            onClick={() => onTabChange("assessments")}
            className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center transition-colors ${
              activeTab === "assessments"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <PencilSquareIcon className="w-5 h-5 mr-2" />
            My Assessment
          </button>
        </nav>
      </div>

      {/* Quick Stats Banner */}
      {isScheduleActive() && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white bg-opacity-20 rounded-full">
                <BookOpenIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Training In Progress</p>
                <p className="text-green-100 text-sm">
                  Keep up the great work! Stay engaged with course materials and
                  announcements.
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-100">Days Remaining</div>
              <div className="text-2xl font-bold">
                {schedule.enddateformat &&
                  Math.max(
                    0,
                    Math.ceil(
                      (new Date(schedule.enddateformat).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
