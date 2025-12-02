"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import AuthGuard from "@/components/auth/AuthGuard";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/src/context/AuthContext";
import TraineeScheduleOverview from "@/src/components/trainee/TraineeScheduleOverview";
import TraineeAnnouncementFeed from "@/src/components/trainee/TraineeAnnouncementFeed";
import TraineeProgressTracking from "@/src/components/trainee/TraineeProgressTracking";
import TraineeTrainingMaterials from "@/src/components/trainee/TraineeTrainingMaterials";
import TraineeCourseDetails from "@/src/components/trainee/TraineeCourseDetails";
import {
  CourseSchedule,
  getScheduleForTrainee,
} from "@/src/services/scheduleService";

export default function CourseOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<CourseSchedule | null>(null);
  const [activeTab, setActiveTab] = useState<string>("announcements");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScheduleDetails = async () => {
      if (!params.scheduleId) return;

      setLoading(true);
      setError(null);

      try {
        const scheduleResponse = await getScheduleForTrainee(
          Number(params.scheduleId)
        );
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
        setLoading(false);
      }
    };

    fetchScheduleDetails();
  }, [params.scheduleId]);

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">
              Loading schedule details...
            </span>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  if (error || !schedule) {
    return (
      <AuthGuard>
        <Layout>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error ? "Failed to load schedule" : "Schedule not found"}
            </h3>
            <p className="text-gray-600">
              {error || "The requested schedule could not be loaded."}
            </p>
            <button
              onClick={() => router.push("/courses")}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Courses
            </button>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          {/* Back Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/courses")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Schedule Overview Header and Tabs */}
          <TraineeScheduleOverview
            scheduleId={Number(params.scheduleId)}
            onTabChange={setActiveTab}
            activeTab={activeTab}
          />

          {/* Tab Content */}
          {activeTab === "announcements" && (
            <TraineeAnnouncementFeed scheduleId={Number(params.scheduleId)} />
          )}

          {activeTab === "course_overview" && schedule && (
            <TraineeCourseDetails courseId={schedule.courseid} />
          )}

          {activeTab === "progress" &&
            schedule?.course?.modeofdeliveryid === 4 && (
              <TraineeProgressTracking
                scheduleId={Number(params.scheduleId)}
                courseId={schedule.courseid}
              />
            )}

          {activeTab === "materials" && schedule && (
            <TraineeTrainingMaterials courseId={schedule.courseid} />
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
}
