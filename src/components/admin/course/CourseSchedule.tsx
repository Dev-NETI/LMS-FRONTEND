"use client";

import React from "react";
import { CalendarIcon, UsersIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { CourseSchedule } from "@/src/services/scheduleService";

interface CourseScheduleProps {
  schedule: CourseSchedule[];
}

export default function CourseSchedulePage({ schedule }: CourseScheduleProps) {
  const sortedSchedule = [...schedule].sort(
    (a, b) =>
      new Date(a.startdateformat).getTime() -
      new Date(b.startdateformat).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Schedule Events Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Course Schedule
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            All scheduled training, lectures, and assessments for this course
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedSchedule.map((scheduleItem) => {
                const startDate = new Date(scheduleItem.startdateformat);
                const endDate = new Date(scheduleItem.enddateformat);
                const today = new Date();

                // Determine status based on dates
                let status = "Scheduled";
                let statusColor = "bg-blue-100 text-blue-800";

                if (endDate < today) {
                  status = "Completed";
                  statusColor = "bg-green-100 text-green-800";
                } else if (startDate <= today && endDate >= today) {
                  status = "In Progress";
                  statusColor = "bg-yellow-100 text-yellow-800";
                }

                // Calculate duration in days
                const durationMs = endDate.getTime() - startDate.getTime();
                const durationDays = Math.max(
                  1,
                  Math.ceil(durationMs / (1000 * 60 * 60 * 24))
                );

                return (
                  <tr
                    key={`schedule-event-${scheduleItem.scheduleid}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <CalendarIcon className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {scheduleItem.batchno}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {startDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {startDate.toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {endDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {endDate.toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {durationDays === 1 ? "1 day" : `${durationDays} days`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {scheduleItem.active_enrolled || 0}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            / {scheduleItem.total_enrolled || 0}
                          </span>
                        </div>
                        {(scheduleItem.active_enrolled || 0) > 0 && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      {scheduleItem.enrolled_students &&
                        scheduleItem.enrolled_students.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Latest:{" "}
                            {scheduleItem.enrolled_students[0]?.trainee_name}
                            {scheduleItem.enrolled_students.length > 1 &&
                              ` +${
                                scheduleItem.enrolled_students.length - 1
                              } more`}
                          </div>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/schedules/${scheduleItem.scheduleid}`}
                      >
                        <button className="text-blue-600 hover:text-blue-900 mr-4">
                          View
                        </button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
