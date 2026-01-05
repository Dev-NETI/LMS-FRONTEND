"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  CourseSchedule,
  getAllTraineeSchedules,
} from "@/src/services/scheduleService";

interface ScheduleEvent {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  schedule: CourseSchedule;
}

const ScheduleCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(
    null
  );
  const [view, setView] = useState<"month" | "week">("month");

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await getAllTraineeSchedules();
      if (response.success) {
        setSchedules(response.data);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getScheduleForDate = (date: Date | null) => {
    if (!date) return null;
    const result = schedules.find((schedule) => {
      const startDate = new Date(schedule.startdateformat);
      const endDate = new Date(schedule.enddateformat);

      // Normalize dates to compare only year, month, day (ignore time)
      const targetDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const scheduleStart = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );
      const scheduleEnd = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      );

      const isMatch = targetDate >= scheduleStart && targetDate <= scheduleEnd;

      return isMatch;
    });
    return result;
  };

  const getScheduleSpanInfo = (
    date: Date | null,
    schedule: any,
    allDaysInMonth: (Date | null)[]
  ) => {
    if (!date || !schedule) return null;

    const startDate = new Date(schedule.startdateformat);
    const endDate = new Date(schedule.enddateformat);

    // Calculate which day of the course this is
    const daysDiff = Math.floor(
      (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalDays =
      Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    // Find the index of this date in the calendar grid
    const dateIndex = allDaysInMonth.findIndex(
      (d) => d && d.toDateString() === date.toDateString()
    );
    if (dateIndex === -1) return null;

    // Calculate which row this date is in (0-based)
    const rowIndex = Math.floor(dateIndex / 7);
    const colIndex = dateIndex % 7;

    // Check if this is the first day of this schedule in this row
    let isFirstInRow = true;
    for (let i = rowIndex * 7; i < dateIndex; i++) {
      const checkDate = allDaysInMonth[i];
      if (checkDate) {
        const checkSchedule = getScheduleForDate(checkDate);
        if (checkSchedule && checkSchedule.scheduleid === schedule.scheduleid) {
          isFirstInRow = false;
          break;
        }
      }
    }

    // Calculate how many consecutive days this schedule spans in this row
    let spanDays = 1;
    for (
      let i = dateIndex + 1;
      i < (rowIndex + 1) * 7 && i < allDaysInMonth.length;
      i++
    ) {
      const checkDate = allDaysInMonth[i];
      if (checkDate) {
        const checkSchedule = getScheduleForDate(checkDate);
        if (checkSchedule && checkSchedule.scheduleid === schedule.scheduleid) {
          spanDays++;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return {
      dayNumber: daysDiff + 1,
      totalDays,
      isFirstInRow,
      spanDays,
      colIndex,
      rowIndex,
    };
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = getDaysInMonth(currentDate);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100">
      {/* Enhanced Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{monthName}</h3>
            <p className="text-sm text-gray-600 mt-1">Schedule Calendar</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-lg hover:shadow-xl"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth("next")}
              className="p-2 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-xl overflow-hidden">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="bg-gray-50 p-3 text-center text-xs font-semibold text-gray-700 border-b border-gray-200"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((day, index) => {
            const scheduleForDay = getScheduleForDate(day);
            const isToday =
              day && day.toDateString() === new Date().toDateString();
            const spanInfo = getScheduleSpanInfo(day, scheduleForDay, days);

            return (
              <div
                key={index}
                className={`min-h-[100px] p-3 border-b border-r border-gray-200 relative ${
                  day ? "bg-white" : "bg-gray-50"
                }`}
              >
                {day && (
                  <>
                    {/* Date number */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                        isToday ? "bg-blue-600 text-white" : "text-gray-700"
                      }`}
                    >
                      {day.getDate()}
                    </div>
                    {/* Spanning Course Card - only show on first day of row for this schedule */}
                    {scheduleForDay &&
                      spanInfo &&
                      spanInfo.isFirstInRow &&
                      spanInfo.spanDays > 1 && (
                        <div
                          className="absolute top-8 left-3 right-3 z-10"
                          style={{
                            width: `calc(${spanInfo.spanDays * 80}% + ${
                              (spanInfo.spanDays - 1) * 12
                            }px)`,
                          }}
                        >
                          <div
                            onClick={() =>
                              setSelectedEvent({
                                id: scheduleForDay.scheduleid,
                                title:
                                  scheduleForDay.course?.coursename || "Course",
                                startDate: new Date(
                                  scheduleForDay.startdateformat
                                ),
                                endDate: new Date(scheduleForDay.enddateformat),
                                schedule: scheduleForDay,
                                type: "ongoing",
                              })
                            }
                            className="relative text-xs p-3 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:scale-[1.01] group overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg border-2 border-white"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-bold text-white mb-1 text-sm">
                                    {scheduleForDay.course?.coursename}
                                  </div>
                                  <div className="text-blue-100 text-xs">
                                    {scheduleForDay.batchno} •{" "}
                                    {spanInfo.spanDays} days
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-2 bg-white bg-opacity-20 rounded-full h-1">
                              <div
                                className="bg-white h-1 rounded-full transition-all duration-300"
                                style={{
                                  width: `${
                                    (spanInfo.dayNumber / spanInfo.totalDays) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Single day course indicator */}
                    {scheduleForDay && spanInfo && spanInfo.totalDays === 1 && (
                      <div className="mt-2">
                        <div
                          className="relative text-xs p-3 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:scale-[1.01] group overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg border-2 border-white"
                          onClick={() =>
                            setSelectedEvent({
                              id: scheduleForDay.scheduleid,
                              title:
                                scheduleForDay.course?.coursename || "Course",
                              startDate: new Date(
                                scheduleForDay.startdateformat
                              ),
                              endDate: new Date(scheduleForDay.enddateformat),
                              schedule: scheduleForDay,
                            })
                          }
                        >
                          <div className="space-y-2">
                            <div>
                              <div className="text-small text-white mb-1 text-sm">
                                {scheduleForDay.course?.coursename}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white mb-2">
                {selectedEvent.schedule.course?.coursename}
              </h3>
            </div>

            <div className="p-6">
              {/* Date Timeline */}
              <div className="space-y-4">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200"></div>

                  {/* Start Date */}
                  <div className="flex items-start space-x-4 relative mb-2">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg z-10">
                      <span className="text-white text-lg">🎯</span>
                    </div>
                    <div className="flex-1 bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
                      <div className="font-bold text-emerald-800 text-sm uppercase tracking-wide mb-1">
                        Start Date
                      </div>
                      <div className="text-emerald-900 font-semibold text-lg">
                        {formatTime(selectedEvent.schedule.startdateformat)}
                      </div>
                      <div className="text-emerald-700 text-sm mt-1">
                        {
                          formatDate(
                            new Date(selectedEvent.schedule.startdateformat)
                          ).split(", ")[0]
                        }
                      </div>
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="flex items-start space-x-4 relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-red-500 rounded-full flex items-center justify-center shadow-lg z-10">
                      <span className="text-white text-lg">🎓</span>
                    </div>
                    <div className="flex-1 bg-gradient-to-r from-rose-50 to-red-50 p-4 rounded-xl border border-rose-200 shadow-sm">
                      <div className="font-bold text-rose-800 text-sm uppercase tracking-wide mb-1">
                        End Date
                      </div>
                      <div className="text-rose-900 font-semibold text-lg">
                        {formatTime(selectedEvent.schedule.enddateformat)}
                      </div>
                      <div className="text-rose-700 text-sm mt-1">
                        {
                          formatDate(
                            new Date(selectedEvent.schedule.enddateformat)
                          ).split(", ")[0]
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full mt-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleCalendar;
