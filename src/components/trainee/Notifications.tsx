"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import {
  BellIcon,
  CheckCircleIcon,
  SpeakerWaveIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { BellIcon as BellSolidIcon } from "@heroicons/react/24/solid";
import {
  getTraineeNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  Notification,
  NotificationResponse,
} from "@/src/services/notificationService";
import { authService } from "@/src/services/authService";
import { useRouter } from "next/navigation";

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, [showUnreadOnly]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      await authService.initCSRF();
      const response: NotificationResponse = await getTraineeNotifications(
        20,
        showUnreadOnly
      );
      setNotifications(response.notifications || []);
      setUnreadCount(response.unread_count || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.is_read) return;

    try {
      await authService.initCSRF();
      await markNotificationAsRead(notification.id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read first
    await handleMarkAsRead(notification);

    // Navigate to course overview if schedule_id is available
    if (notification.schedule_id) {
      router.push(`/courses/${notification.schedule_id}/overview/`);
    } else if (notification.announcement?.schedule_id) {
      // Fallback to announcement's schedule_id
      router.push(
        `/courses/${notification.announcement.schedule_id}/overview/`
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    setIsMarkingAllRead(true);
    try {
      await authService.initCSRF();
      await markAllNotificationsAsRead();

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const handleDelete = async (notificationId: number) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    try {
      await authService.initCSRF();
      await deleteNotification(notificationId);

      const deletedNotification = notifications.find(
        (n) => n.id === notificationId
      );
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return <SpeakerWaveIcon className="w-6 h-6 text-blue-600" />;
      default:
        return <BellIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-300 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-300 rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-full">
            {unreadCount > 0 ? (
              <BellSolidIcon className="w-6 h-6 text-blue-600" />
            ) : (
              <BellIcon className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {unreadCount} unread
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Stay updated with course announcements and updates
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllRead}
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <CheckCircleIcon className="w-4 h-4 mr-2" />
            {isMarkingAllRead ? "Marking..." : "Mark All Read"}
          </Button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowUnreadOnly(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            !showUnreadOnly
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Notifications
        </button>
        <button
          onClick={() => setShowUnreadOnly(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            showUnreadOnly
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <BellIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications found
            </h3>
            <p className="text-gray-600">
              {showUnreadOnly
                ? "You have no unread notifications."
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
                !notification.is_read
                  ? "border-l-4 border-l-blue-500 bg-blue-50/30"
                  : ""
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div
                    className={`p-2 rounded-full ${
                      !notification.is_read ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3
                      className={`text-sm font-medium ${
                        !notification.is_read
                          ? "text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      {notification.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {!notification.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification);
                          }}
                          className="p-1 rounded-full text-blue-600 hover:bg-blue-100"
                          title="Mark as read"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        className="p-1 rounded-full text-red-600 hover:bg-red-100"
                        title="Delete notification"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p
                    className={`text-sm mb-3 ${
                      !notification.is_read ? "text-gray-700" : "text-gray-600"
                    }`}
                  >
                    {notification.message}
                  </p>

                  {notification.announcement && (
                    <div className="bg-gray-50 rounded-md p-3 mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">
                        Related Announcement:
                      </p>
                      <p className="text-sm text-gray-600">
                        {notification.announcement.title}
                      </p>
                      {notification.announcement.schedule?.course_name && (
                        <p className="text-xs text-gray-500 mt-1">
                          Course:{" "}
                          {notification.announcement.schedule.course_name}
                        </p>
                      )}
                    </div>
                  )}

                  {(notification.schedule_id ||
                    notification.announcement?.schedule_id) && (
                    <div className="bg-blue-50 rounded-md p-2 mb-3 border border-blue-200">
                      <p className="text-xs text-blue-700 font-medium flex items-center">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                        Click to view course overview
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formatDate(notification.created_at)}
                    </span>
                    {!notification.is_read && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        New
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
