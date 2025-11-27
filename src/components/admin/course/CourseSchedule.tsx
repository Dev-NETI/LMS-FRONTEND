"use client";

import React from "react";
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { ScheduleEvent } from "./types";

interface CourseScheduleProps {
  schedule: ScheduleEvent[];
}

export default function CourseSchedule({ schedule }: CourseScheduleProps) {
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "Lecture":
        return "bg-blue-100 text-blue-800";
      case "Workshop":
        return "bg-green-100 text-green-800";
      case "Quiz":
        return "bg-yellow-100 text-yellow-800";
      case "Exam":
        return "bg-red-100 text-red-800";
      case "Assignment":
        return "bg-purple-100 text-purple-800";
      case "Discussion":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatEventTime = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  const isEventToday = (dateString: string) => {
    const today = new Date().toDateString();
    const eventDate = new Date(dateString).toDateString();
    return today === eventDate;
  };

  const isEventUpcoming = (dateString: string) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    return eventDate > today;
  };

  const sortedSchedule = [...schedule].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Schedule Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">
                Total Events
              </p>
              <p className="text-lg font-bold text-gray-900">
                {schedule.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">
                Completed
              </p>
              <p className="text-lg font-bold text-gray-900">
                {
                  schedule.filter(
                    (event) => event.status === "Completed"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">
                Upcoming
              </p>
              <p className="text-lg font-bold text-gray-900">
                {
                  schedule.filter((event) =>
                    isEventUpcoming(event.date)
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UsersIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">
                Avg Attendance
              </p>
              <p className="text-lg font-bold text-gray-900">
                {schedule.length > 0 ? Math.round(
                  schedule.reduce(
                    (acc, event) => acc + (event.attendees || 0),
                    0
                  ) / schedule.length
                ) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Events */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Course Schedule
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            All scheduled events, lectures, and assessments for this
            course
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {sortedSchedule.map((event) => (
              <div
                key={`schedule-event-${event.id}`}
                className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                  isEventToday(event.date)
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-base font-semibold text-gray-900">
                        {event.title}
                      </h4>
                      {isEventToday(event.date) && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 font-medium">
                          Date & Time
                        </p>
                        <p className="text-gray-900">
                          {formatEventDate(event.date)}
                        </p>
                        <p className="text-gray-700">
                          {formatEventTime(
                            event.startTime,
                            event.endTime
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600 font-medium">
                          Location
                        </p>
                        <p className="text-gray-900">
                          {event.location || "TBD"}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600 font-medium">
                          Instructor
                        </p>
                        <p className="text-gray-900">
                          {event.instructor}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600 font-medium">
                          Attendance
                        </p>
                        <p className="text-gray-900">
                          {event.attendees || 0}/
                          {event.maxAttendees || "No limit"}
                        </p>
                        {event.maxAttendees && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  ((event.attendees || 0) /
                                    event.maxAttendees) *
                                    100
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {event.description && (
                      <div className="mt-3">
                        <p className="text-gray-600 font-medium text-sm mb-1">
                          Description
                        </p>
                        <p className="text-gray-700 text-sm">
                          {event.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(
                          event.type
                        )}`}
                      >
                        {event.type}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getEventStatusColor(
                          event.status
                        )}`}
                      >
                        {event.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Empty state for schedule */}
      {schedule.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No events scheduled
          </h3>
          <p className="text-gray-600">
            There are no events scheduled for this course yet.
          </p>
        </div>
      )}
    </div>
  );
}