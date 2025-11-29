"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@mui/material";
import {
  PlusIcon,
  ChatBubbleLeftIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import {
  getAnnouncementsBySchedule,
  createAnnouncement,
  AnnouncementPost,
  CreateAnnouncementData,
} from "@/src/services/announcementService";

interface AnnouncementFeedProps {
  scheduleId: number;
}

export default function AnnouncementFeed({
  scheduleId,
}: AnnouncementFeedProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
  });
  const [showNewAnnouncementForm, setShowNewAnnouncementForm] = useState(false);
  const [showReplies, setShowReplies] = useState<{ [key: number]: boolean }>(
    {}
  );

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!scheduleId) return;

      setIsLoading(true);
      try {
        const response = await getAnnouncementsBySchedule(scheduleId);
        setAnnouncements(response.announcements || []);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, [scheduleId]);

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim())
      return;

    setIsCreating(true);
    try {
      const createData: CreateAnnouncementData = {
        schedule_id: scheduleId,
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        is_active: true,
      };

      const response = await createAnnouncement(createData);
      setAnnouncements([response.announcement, ...announcements]);
      setNewAnnouncement({ title: "", content: "" });
      setShowNewAnnouncementForm(false);
    } catch (error) {
      console.error("Failed to create announcement:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const getAuthorName = (user?: {
    name?: string;
    f_name?: string;
    m_name?: string;
    l_name?: string;
  }) => {
    if (!user) return "Unknown User";
    
    // If name field exists, use it, otherwise construct from f_name/l_name
    if (user.name) return user.name;
    
    const firstName = user.f_name || "";
    const middleInitial = user.m_name ? ` ${user.m_name.charAt(0)}.` : "";
    const lastName = user.l_name ? ` ${user.l_name}` : "";
    return `${firstName}${middleInitial}${lastName}`.trim() || "Unknown User";
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
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-start space-x-4">
              <Skeleton variant="circular" width={48} height={48} />
              <div className="flex-1">
                <Skeleton variant="text" width={200} height={20} />
                <Skeleton
                  variant="text"
                  width={300}
                  height={16}
                  sx={{ mt: 1 }}
                />
                <div className="mt-4 space-y-2">
                  <Skeleton variant="text" width="100%" height={16} />
                  <Skeleton variant="text" width="80%" height={16} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Announcement */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {!showNewAnnouncementForm ? (
          <Button
            onClick={() => setShowNewAnnouncementForm(true)}
            className="w-full flex items-center justify-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create New Announcement
          </Button>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Announcement title..."
              value={newAnnouncement.title}
              onChange={(e) =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  title: e.target.value,
                })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <textarea
              placeholder="What would you like to announce?"
              value={newAnnouncement.content}
              onChange={(e) =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  content: e.target.value,
                })
              }
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <div className="flex gap-3">
              <Button onClick={handleCreateAnnouncement} disabled={isCreating}>
                {isCreating ? "Creating..." : "Post Announcement"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowNewAnnouncementForm(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Announcements List */}
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        >
          <div className="p-6">
            {/* Announcement Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {getAuthorName(announcement.created_by_user).charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {announcement.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{getAuthorName(announcement.created_by_user)}</span>
                    <span>•</span>
                    <span>
                      {formatDate(
                        announcement.published_at ||
                          announcement.created_at ||
                          ""
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <EllipsisVerticalIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Announcement Content */}
            <div className="mb-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {announcement.content}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between py-3 border-t border-gray-100">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() =>
                    setShowReplies({
                      ...showReplies,
                      [announcement.id]: !showReplies[announcement.id],
                    })
                  }
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-600"
                >
                  <ChatBubbleLeftIcon className="w-5 h-5" />
                  <span className="text-sm">
                    {announcement.replies_count ||
                      announcement.active_replies?.length ||
                      0}{" "}
                    replies
                  </span>
                </button>
              </div>
            </div>

            {/* Reply Section */}
            {showReplies[announcement.id] &&
              announcement.active_replies &&
              announcement.active_replies.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {/* Existing Replies */}
                  <div className="space-y-4 mb-4">
                    {announcement.active_replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="flex items-start space-x-3"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium text-sm">
                            {getAuthorName(reply.user).charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                              <span className="font-medium text-gray-900">
                                {getAuthorName(reply.user)}
                              </span>
                              <span>•</span>
                              <span>{formatDate(reply.created_at)}</span>
                            </div>
                            <p className="text-gray-700 text-sm">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      ))}

      {announcements.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <ChatBubbleLeftIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No announcements yet
          </h3>
          <p className="text-gray-600">
            Create the first announcement to start the conversation.
          </p>
        </div>
      )}
    </div>
  );
}
