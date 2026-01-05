"use client";

import React from "react";
import Layout from "@/components/layout/Layout";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  TrophyIcon,
  ChartBarIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";

const stats = [
  {
    name: "Total Courses",
    value: "12",
    icon: BookOpenIcon,
    color: "bg-blue-500",
    change: "+2 this month",
    changeType: "positive",
  },
  {
    name: "Completed",
    value: "8",
    icon: CheckCircleIcon,
    color: "bg-green-500",
    change: "+3 this week",
    changeType: "positive",
  },
  {
    name: "In Progress",
    value: "3",
    icon: ClockIcon,
    color: "bg-yellow-500",
    change: "1 due soon",
    changeType: "neutral",
  },
  {
    name: "Certificates",
    value: "6",
    icon: AcademicCapIcon,
    color: "bg-purple-500",
    change: "+1 this month",
    changeType: "positive",
  },
];

const recentCourses = [
  {
    id: 1,
    name: "Maritime Safety Training",
    progress: 85,
    status: "In Progress",
    nextLesson: "Emergency Procedures",
    dueDate: "2024-11-20",
    instructor: "Capt. Johnson",
  },
  {
    id: 2,
    name: "Navigation Fundamentals",
    progress: 100,
    status: "Completed",
    completedDate: "2024-11-10",
    instructor: "Prof. Smith",
  },
  {
    id: 3,
    name: "Communication Protocols",
    progress: 60,
    status: "In Progress",
    nextLesson: "Radio Communication",
    dueDate: "2024-11-25",
    instructor: "Lt. Wilson",
  },
];

const announcements = [
  {
    id: 1,
    title: "New Course Available: Advanced Navigation",
    date: "2024-11-12",
    type: "info",
  },
  {
    id: 2,
    title: "Maintenance Schedule: System will be down Nov 15",
    date: "2024-11-11",
    type: "warning",
  },
  {
    id: 3,
    title: "Congratulations! You earned a new certificate",
    date: "2024-11-10",
    type: "success",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  Welcome back, {user?.f_name}! 👋
                </h1>
                <p className="text-blue-100 mt-2">
                  Ready to continue your learning journey? You have 2 pending
                  courses.
                </p>
              </div>
              <div className="hidden md:block">
                <TrophyIcon className="w-16 h-16 text-blue-200" />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p
                    className={`text-sm ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : stat.changeType === "negative"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Courses */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Courses
                  </h2>
                  <a
                    href="/courses"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View all
                  </a>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {recentCourses.map((course) => (
                  <div
                    key={course.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {course.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Instructor: {course.instructor}
                        </p>

                        {course.status === "In Progress" && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">
                                {course.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {course.nextLesson && (
                          <p className="text-sm text-blue-600 mt-2">
                            Next: {course.nextLesson}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end ml-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            course.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : course.status === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {course.status}
                        </span>

                        {course.status === "In Progress" && (
                          <button className="mt-2 flex items-center text-blue-600 hover:text-blue-700 text-sm">
                            <PlayIcon className="w-4 h-4 mr-1" />
                            Continue
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Announcements
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="border-l-4 pl-4 py-2 border-l-blue-500"
                  >
                    <h4 className="font-medium text-gray-900 text-sm">
                      {announcement.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {announcement.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <BookOpenIcon className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Browse Courses
                </span>
              </button>
              <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
                <ChartBarIcon className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  View Progress
                </span>
              </button>
              <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                <AcademicCapIcon className="w-8 h-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Certificates
                </span>
              </button>
              <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors">
                <ClockIcon className="w-8 h-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Schedule
                </span>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
