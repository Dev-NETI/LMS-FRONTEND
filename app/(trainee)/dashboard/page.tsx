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
  MegaphoneIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  BellIcon,
  CalendarIcon,
  SparklesIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  BellIcon as BellIconSolid,
} from "@heroicons/react/24/solid";

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
    description: "Check out our latest course on advanced navigation techniques for maritime professionals.",
  },
  {
    id: 2,
    title: "Maintenance Schedule: System will be down Nov 15",
    date: "2024-11-11",
    type: "warning",
    description: "Please note that the system will undergo scheduled maintenance from 2 AM to 6 AM.",
  },
  {
    id: 3,
    title: "Congratulations! You earned a new certificate",
    date: "2024-11-10",
    type: "success",
    description: "You've successfully completed Navigation Fundamentals. Download your certificate now!",
  },
  {
    id: 4,
    title: "New Safety Regulations Updated",
    date: "2024-11-08",
    type: "info",
    description: "Important updates to maritime safety regulations are now available in the training materials.",
  },
];

const userManuals = [
  {
    id: 1,
    title: "Getting Started Guide",
    description: "Learn how to navigate the LMS platform and access your courses",
    icon: BookOpenIcon,
    color: "blue",
    link: "/help/getting-started",
  },
  {
    id: 2,
    title: "How to Enroll in Courses",
    description: "Step-by-step guide to enrolling in available training programs",
    icon: AcademicCapIcon,
    color: "green",
    link: "/help/enrollment",
  },
  {
    id: 3,
    title: "Certificate Download Guide",
    description: "Access and download your training certificates",
    icon: DocumentTextIcon,
    color: "purple",
    link: "/help/certificates",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <SparklesIcon className="w-6 h-6 text-yellow-300" />
                  <span className="text-sm font-semibold text-blue-100">Dashboard</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Welcome back, {user?.f_name}! 👋
                </h1>
                <p className="text-blue-100 mt-2 text-lg">
                  Ready to continue your learning journey? You have 2 pending courses.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="px-6 py-2.5 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2">
                    <PlayIcon className="w-5 h-5" />
                    Continue Learning
                  </button>
                  <button className="px-6 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center gap-2">
                    <BookOpenIcon className="w-5 h-5" />
                    Browse Courses
                  </button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full"></div>
                  <TrophyIcon className="w-32 h-32 text-yellow-300 relative" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className={`${stat.color} p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        {stat.name}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p
                    className={`text-sm font-medium flex items-center gap-1 ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : stat.changeType === "negative"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {stat.changeType === "positive" && (
                      <CheckCircleIconSolid className="w-4 h-4" />
                    )}
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
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpenIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      My Recent Courses
                    </h2>
                  </div>
                  <a
                    href="/courses"
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    View all
                    <ArrowRightIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {recentCourses.map((course) => (
                  <div
                    key={course.id}
                    className="border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer bg-gradient-to-r from-white to-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <BookmarkIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                              {course.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                              <AcademicCapIcon className="w-4 h-4" />
                              Instructor: {course.instructor}
                            </p>

                            {course.status === "In Progress" && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <span className="text-gray-600 font-medium">Progress</span>
                                  <span className="font-bold text-blue-600">
                                    {course.progress}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                                    style={{ width: `${course.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {course.nextLesson && (
                              <div className="mt-3 flex items-center gap-2 text-sm">
                                <ClockIcon className="w-4 h-4 text-orange-500" />
                                <span className="text-gray-700">
                                  Next: <span className="font-semibold text-blue-600">{course.nextLesson}</span>
                                </span>
                              </div>
                            )}

                            {course.dueDate && course.status === "In Progress" && (
                              <div className="mt-2 flex items-center gap-2 text-sm text-orange-600">
                                <CalendarIcon className="w-4 h-4" />
                                Due: {course.dueDate}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end ml-4 gap-3">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                            course.status === "Completed"
                              ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                              : course.status === "In Progress"
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {course.status}
                        </span>

                        {course.status === "In Progress" && (
                          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors shadow-sm">
                            <PlayIcon className="w-4 h-4" />
                            Continue
                          </button>
                        )}

                        {course.status === "Completed" && (
                          <button className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors">
                            <CheckCircleIconSolid className="w-4 h-4" />
                            View
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
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <MegaphoneIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Announcements
                  </h2>
                </div>
              </div>
              <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`rounded-lg p-4 border-l-4 hover:shadow-md transition-all cursor-pointer ${
                      announcement.type === "success"
                        ? "border-l-green-500 bg-green-50 hover:bg-green-100"
                        : announcement.type === "warning"
                        ? "border-l-orange-500 bg-orange-50 hover:bg-orange-100"
                        : "border-l-blue-500 bg-blue-50 hover:bg-blue-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        announcement.type === "success"
                          ? "bg-green-200"
                          : announcement.type === "warning"
                          ? "bg-orange-200"
                          : "bg-blue-200"
                      }`}>
                        <BellIconSolid className={`w-4 h-4 ${
                          announcement.type === "success"
                            ? "text-green-700"
                            : announcement.type === "warning"
                            ? "text-orange-700"
                            : "text-blue-700"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          {announcement.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {announcement.description}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {announcement.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Manuals & Quick Help */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    User Manuals & Help Center
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Get started with helpful guides and tutorials
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {userManuals.map((manual) => (
                <a
                  key={manual.id}
                  href={manual.link}
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -mr-10 -mt-10 opacity-50 group-hover:scale-150 transition-transform"></div>
                  <div className="relative">
                    <div className={`p-3 bg-${manual.color}-100 rounded-xl w-fit group-hover:scale-110 transition-transform`}>
                      <manual.icon className={`w-8 h-8 text-${manual.color}-600`} />
                    </div>
                    <h3 className="font-bold text-gray-900 mt-4 text-lg group-hover:text-blue-600 transition-colors">
                      {manual.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      {manual.description}
                    </p>
                    <div className="mt-4 flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                      Read More
                      <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <SparklesIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Quick Actions
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                  <BookOpenIcon className="w-8 h-8 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700 mt-3 group-hover:text-blue-600 transition-colors">
                  Browse Courses
                </span>
              </button>
              <button className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all group">
                <div className="p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform">
                  <ChartBarIcon className="w-8 h-8 text-green-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700 mt-3 group-hover:text-green-600 transition-colors">
                  View Progress
                </span>
              </button>
              <button className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all group">
                <div className="p-3 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform">
                  <AcademicCapIcon className="w-8 h-8 text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700 mt-3 group-hover:text-purple-600 transition-colors">
                  Certificates
                </span>
              </button>
              <button className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all group">
                <div className="p-3 bg-orange-100 rounded-xl group-hover:scale-110 transition-transform">
                  <CalendarIcon className="w-8 h-8 text-orange-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700 mt-3 group-hover:text-orange-600 transition-colors">
                  My Schedule
                </span>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
