"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/src/components/admin/AdminLayout";
import AuthGuard from "@/src/components/auth/AuthGuard";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@mui/material";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  CalendarIcon,
  UsersIcon,
  ChartBarIcon,
  MegaphoneIcon,
  ClockIcon,
  AcademicCapIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import AnnouncementFeed from "@/src/components/admin/schedule/AnnouncementFeed";
import ProgressMonitoring from "@/src/components/admin/schedule/ProgressMonitoring";
import TrainingMaterials from "@/src/components/admin/schedule/TrainingMaterials";

interface ScheduleDetails {
  scheduleid: number;
  batchno: string;
  courseid: number;
  coursename: string;
  modeofdeliveryid: number;
  startdateformat: string;
  enddateformat: string;
  total_enrolled: number;
  active_enrolled: number;
  status: "Scheduled" | "In Progress" | "Completed";
}

export default function ScheduleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [schedule, setSchedule] = useState<ScheduleDetails | null>(null);
  const [activeTab, setActiveTab] = useState<
    "announcements" | "progress" | "materials"
  >("announcements");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScheduleDetails = async () => {
      if (!params.id) return;

      setIsLoading(true);
      setError(null);

      try {
        // Mock data - replace with actual API call
        const mockSchedule: ScheduleDetails = {
          scheduleid: Number(params.id),
          batchno: `BATCH-${params.id}`,
          courseid: 1,
          coursename: "Maritime Safety Training",
          modeofdeliveryid: 1,
          startdateformat: "2024-12-01",
          enddateformat: "2024-12-15",
          total_enrolled: 25,
          active_enrolled: 22,
          status: "In Progress",
        };

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSchedule(mockSchedule);

        // Set default active tab based on mode of delivery
        // For self-paced distance learning (mode 4), only announcements are available
        if (mockSchedule.modeofdeliveryid === 4) {
          setActiveTab("announcements");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch schedule details";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheduleDetails();
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDurationInDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <AdminLayout>
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton variant="rectangular" width={120} height={32} />
                <div>
                  <Skeleton variant="text" width={300} height={32} />
                  <Skeleton variant="text" width={200} height={20} />
                </div>
              </div>
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 p-6"
                >
                  <div className="flex items-center">
                    <Skeleton variant="rounded" width={40} height={40} />
                    <div className="ml-4 flex-1">
                      <Skeleton variant="text" width={80} height={14} />
                      <Skeleton variant="text" width={60} height={24} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Content skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <Skeleton variant="text" width={200} height={24} />
              <div className="mt-4 space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index}>
                    <Skeleton variant="text" width="100%" height={16} />
                    <Skeleton variant="text" width="80%" height={16} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  if (error || !schedule) {
    return (
      <AuthGuard>
        <AdminLayout>
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
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/admin/courses")}
              >
                Back to Courses
              </Button>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {schedule.batchno} - {schedule.coursename}
                </h1>
                <p className="text-gray-600 mt-1">
                  Schedule Details and Training Management
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                schedule.status
              )}`}
            >
              {schedule.status}
            </span>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Active Trainees
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {schedule.active_enrolled}/{schedule.total_enrolled}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Duration</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {getDurationInDays(
                      schedule.startdateformat,
                      schedule.enddateformat
                    )}{" "}
                    days
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Avg Progress
                  </p>
                  <p className="text-2xl font-bold text-gray-900">75%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <AcademicCapIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Attendance Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900">92%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("announcements")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "announcements"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <MegaphoneIcon className="w-5 h-5 mr-2" />
                Announcements
              </button>

              {/* Only show Progress Monitoring if mode of delivery is NOT 4 (self-paced distance learning) */}
              {schedule.modeofdeliveryid === 4 && (
                <button
                  onClick={() => setActiveTab("progress")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === "progress"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <ChartBarIcon className="w-5 h-5 mr-2" />
                  Progress Monitoring
                </button>
              )}

              {/* Training Materials tab - available for all modes */}
              <button
                onClick={() => setActiveTab("materials")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "materials"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Training Materials
              </button>

            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "announcements" && (
            <AnnouncementFeed scheduleId={schedule.scheduleid} />
          )}

          {activeTab === "progress" && schedule.modeofdeliveryid !== 4 && (
            <ProgressMonitoring scheduleId={schedule.scheduleid} />
          )}

          {activeTab === "materials" && (
            <TrainingMaterials scheduleId={schedule.scheduleid} />
          )}

        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
