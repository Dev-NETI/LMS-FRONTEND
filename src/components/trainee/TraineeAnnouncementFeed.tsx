"use client";

import React, { useState, useEffect } from "react";
import {
  MegaphoneIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import {
  AnnouncementPost,
  getAnnouncementsByScheduleTrainee,
} from "@/src/services/announcementService";

interface TraineeAnnouncementFeedProps {
  scheduleId: number;
}

export default function TraineeAnnouncementFeed({
  scheduleId,
}: TraineeAnnouncementFeedProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedAnnouncements, setLikedAnnouncements] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!scheduleId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await getAnnouncementsByScheduleTrainee(scheduleId);
        if (response && response.announcements) {
          setAnnouncements(response.announcements);
        } else {
          setError("Failed to fetch announcements");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch announcements";
        setError(errorMessage);
        console.error("Error fetching announcements:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, [scheduleId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const toggleLike = (announcementId: number) => {
    const newLikedAnnouncements = new Set(likedAnnouncements);
    if (newLikedAnnouncements.has(announcementId)) {
      newLikedAnnouncements.delete(announcementId);
    } else {
      newLikedAnnouncements.add(announcementId);
    }
    setLikedAnnouncements(newLikedAnnouncements);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-green-500 bg-green-50";
      default:
        return "border-l-blue-500 bg-blue-50";
    }
  };

  const getPriorityBadgeColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gray-300 rounded animate-pulse mr-3"></div>
            <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="border-l-4 border-gray-200 p-4 animate-pulse"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-5 bg-gray-300 rounded w-64"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="flex space-x-4">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <MegaphoneIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load announcements
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-blue-100 rounded-full mr-3">
            <MegaphoneIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Course Announcements
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Stay updated with the latest news and information
            </p>
          </div>
        </div>

        {announcements.length === 0 ? (
          <div className="text-center py-12">
            <MegaphoneIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No announcements yet
            </h3>
            <p className="text-gray-600">
              Your instructor will post announcements here when they have
              updates to share.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`border-l-4 border-l-blue-500 bg-blue-50 rounded-lg p-6 transition-all duration-200 hover:shadow-md`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {announcement.title}
                      </h3>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Announcement
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <UserIcon className="w-4 h-4" />
                        <span>
                          {announcement.created_by_user?.f_name}{" "}
                          {announcement.created_by_user?.l_name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{formatDate(announcement.created_at || "")}</span>
                      </div>
                      {announcement.is_active && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      Posted on{" "}
                      {announcement.created_at &&
                        new Date(announcement.created_at).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                    </span>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => toggleLike(announcement.id)}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        likedAnnouncements.has(announcement.id)
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {likedAnnouncements.has(announcement.id) ? (
                        <HeartSolid className="w-4 h-4" />
                      ) : (
                        <HeartIcon className="w-4 h-4" />
                      )}
                      <span>
                        {likedAnnouncements.has(announcement.id)
                          ? "Liked"
                          : "Like"}
                      </span>
                    </button>

                    <button className="flex items-center space-x-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
