"use client";

import React from "react";
import AdminLayout from "@/src/components/admin/AdminLayout";
import AuthGuard from "@/src/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import {
  UsersIcon,
  BookOpenIcon,
  ChartBarIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  UserGroupIcon,
  TrophyIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EllipsisHorizontalIcon,
  PlayCircleIcon,
  PlusIcon,
  CogIcon,
  BellIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/button";

const adminStats = [
  {
    name: "Total Users",
    value: "1,247",
    icon: UsersIcon,
    color: "bg-blue-500",
    change: "+12%",
    changeValue: "+156",
    changeType: "positive",
    period: "vs last month",
  },
  {
    name: "Active Courses",
    value: "24",
    icon: BookOpenIcon,
    color: "bg-green-500",
    change: "+8%",
    changeValue: "+2",
    changeType: "positive",
    period: "vs last month",
  },
  {
    name: "Completion Rate",
    value: "87.5%",
    icon: ChartBarIcon,
    color: "bg-purple-500",
    change: "+2.3%",
    changeValue: "+2.3%",
    changeType: "positive",
    period: "vs last month",
  },
  {
    name: "Certificates Issued",
    value: "892",
    icon: AcademicCapIcon,
    color: "bg-orange-500",
    change: "-3%",
    changeValue: "-27",
    changeType: "negative",
    period: "vs last month",
  },
];

const recentActivity = [
  {
    id: 1,
    user: "John Smith",
    action: "completed",
    target: "Maritime Safety Training",
    time: "2 minutes ago",
    type: "completion",
  },
  {
    id: 2,
    user: "Sarah Johnson",
    action: "enrolled in",
    target: "Navigation Fundamentals",
    time: "15 minutes ago",
    type: "enrollment",
  },
  {
    id: 3,
    user: "Mike Wilson",
    action: "submitted",
    target: "Final Assessment - Communications",
    time: "1 hour ago",
    type: "submission",
  },
  {
    id: 4,
    user: "Emma Davis",
    action: "started",
    target: "Advanced Navigation Techniques",
    time: "2 hours ago",
    type: "start",
  },
  {
    id: 5,
    user: "Robert Chen",
    action: "achieved certification in",
    target: "Emergency Response Protocols",
    time: "3 hours ago",
    type: "certification",
  },
];

const systemAlerts = [
  {
    id: 1,
    title: "Server Maintenance Scheduled",
    message:
      "System maintenance window scheduled for Nov 20, 2024 at 2:00 AM EST",
    type: "info",
    time: "1 hour ago",
  },
  {
    id: 2,
    title: "High Course Enrollment",
    message: "Maritime Safety Training has reached 95% capacity",
    type: "warning",
    time: "3 hours ago",
  },
  {
    id: 3,
    title: "Certificate Template Updated",
    message: "New certificate template has been approved and deployed",
    type: "success",
    time: "5 hours ago",
  },
];

const topCourses = [
  {
    id: 1,
    name: "Maritime Safety Training",
    students: 324,
    completion: 92,
    rating: 4.8,
    trend: "up",
  },
  {
    id: 2,
    name: "Navigation Fundamentals",
    students: 287,
    completion: 85,
    rating: 4.6,
    trend: "up",
  },
  {
    id: 3,
    name: "Communication Protocols",
    students: 198,
    completion: 78,
    rating: 4.4,
    trend: "down",
  },
  {
    id: 4,
    name: "Emergency Response",
    students: 156,
    completion: 90,
    rating: 4.7,
    trend: "up",
  },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.f_name}. Here's what's happening with your
                LMS.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button variant="outline" className="flex items-center">
                <BellIcon className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button className="flex items-center">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminStats.map((stat) => (
              <div
                key={stat.name}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
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
                </div>
                <div className="mt-4 flex items-center">
                  <div
                    className={`flex items-center ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.changeType === "positive" ? (
                      <ArrowUpIcon className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 mr-1" />
                    )}
                    <span className="text-sm font-medium">{stat.change}</span>
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    {stat.period}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Activity
                  </h2>
                  <Button variant="ghost" className="text-sm">
                    View all
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {recentActivity.map((activity, activityIdx) => (
                      <li key={activity.id}>
                        <div className="relative pb-8">
                          {activityIdx !== recentActivity.length - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span
                                className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                  activity.type === "completion"
                                    ? "bg-green-500"
                                    : activity.type === "enrollment"
                                    ? "bg-blue-500"
                                    : activity.type === "submission"
                                    ? "bg-yellow-500"
                                    : activity.type === "start"
                                    ? "bg-purple-500"
                                    : "bg-orange-500"
                                }`}
                              >
                                {activity.type === "completion" ? (
                                  <CheckCircleIcon className="w-5 h-5 text-white" />
                                ) : activity.type === "enrollment" ? (
                                  <UserGroupIcon className="w-5 h-5 text-white" />
                                ) : activity.type === "submission" ? (
                                  <PaperAirplaneIcon className="w-5 h-5 text-white" />
                                ) : activity.type === "start" ? (
                                  <PlayCircleIcon className="w-5 h-5 text-white" />
                                ) : (
                                  <TrophyIcon className="w-5 h-5 text-white" />
                                )}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <div className="text-sm">
                                  <span className="font-medium text-gray-900">
                                    {activity.user}
                                  </span>{" "}
                                  <span className="text-gray-500">
                                    {activity.action}
                                  </span>{" "}
                                  <span className="font-medium text-gray-900">
                                    {activity.target}
                                  </span>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500">
                                  {activity.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* System Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  System Alerts
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {systemAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border-l-4 pl-4 py-3 ${
                      alert.type === "info"
                        ? "border-l-blue-500 bg-blue-50"
                        : alert.type === "warning"
                        ? "border-l-yellow-500 bg-yellow-50"
                        : "border-l-green-500 bg-green-50"
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {alert.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {alert.time}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-gray-400"
                      >
                        <EllipsisHorizontalIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Courses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Top Performing Courses
                </h2>
                <Button variant="ghost" className="text-sm">
                  Manage Courses
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {topCourses.map((course) => (
                  <div
                    key={course.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {course.name}
                      </h3>
                      <div
                        className={`p-1 rounded ${
                          course.trend === "up"
                            ? "text-green-600 bg-green-100"
                            : "text-red-600 bg-red-100"
                        }`}
                      >
                        {course.trend === "up" ? (
                          <ArrowUpIcon className="w-3 h-3" />
                        ) : (
                          <ArrowDownIcon className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Students</span>
                        <span className="font-medium">{course.students}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Completion</span>
                        <span className="font-medium">
                          {course.completion}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Rating</span>
                        <span className="font-medium">{course.rating}/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${course.completion}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
