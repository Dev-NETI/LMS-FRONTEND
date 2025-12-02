"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@mui/material";
import {
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";
import {
  AnnouncementPost,
  getAnnouncementsByScheduleTrainee,
  getAnnouncementRepliesTrainee,
  createAnnouncementReplyTrainee,
  updateAnnouncementReplyTrainee,
  deleteAnnouncementReplyTrainee,
  CreateReplyData,
  ReplyData,
} from "@/src/services/announcementService";
import { authService } from "@/src/services/authService";
import { useAuth } from "@/src/context/AuthContext";

interface TraineeAnnouncementFeedProps {
  scheduleId: number;
}

export default function TraineeAnnouncementFeed({
  scheduleId,
}: TraineeAnnouncementFeedProps) {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReplies, setShowReplies] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [replyContent, setReplyContent] = useState<{ [key: number]: string }>(
    {}
  );
  const [loadingReplies, setLoadingReplies] = useState<{
    [key: number]: boolean;
  }>({});
  const [creatingReply, setCreatingReply] = useState<{
    [key: number]: boolean;
  }>({});
  const [replies, setReplies] = useState<{ [key: number]: ReplyData[] }>({});
  const [editingReply, setEditingReply] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [editContent, setEditContent] = useState<{ [key: number]: string }>({});
  const [deletingReply, setDeletingReply] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!scheduleId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await getAnnouncementsByScheduleTrainee(scheduleId);
        if (response && response.announcements) {
          setAnnouncements(response.announcements);

          console.log(response);
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

  const getAuthorName = (user?: {
    name?: string;
    f_name?: string;
    m_name?: string;
    l_name?: string;
    user_type?: "admin" | "trainee";
  }) => {
    if (!user) return "Unknown User";

    // Try to construct name from f_name and l_name first (works for both admin and trainee)
    const firstName = user.f_name?.trim() || "";
    const lastName = user.l_name?.trim() || "";

    if (firstName || lastName) {
      const middleInitial = user.m_name?.trim()
        ? ` ${user.m_name.charAt(0)}.`
        : "";
      const fullName = `${firstName}${middleInitial} ${lastName}`.trim();
      if (fullName) return fullName;
    }

    // Fallback to 'name' field (mainly for admin users who might have this)
    if (user.name?.trim()) {
      return user.name.trim();
    }

    // Final fallback based on user type
    if (user.user_type === "admin") {
      return "Admin User";
    } else if (user.user_type === "trainee") {
      return "Trainee User";
    }

    return "Unknown User";
  };

  const getUserBadge = (userType?: "admin" | "trainee") => {
    if (!userType) return null;

    return (
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
          userType === "admin"
            ? "bg-blue-100 text-blue-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {userType === "admin" ? "Admin" : "Trainee"}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchReplies = async (announcementId: number) => {
    if (replies[announcementId]) return;

    setLoadingReplies({ ...loadingReplies, [announcementId]: true });
    try {
      await authService.initCSRF();
      const response = await getAnnouncementRepliesTrainee(announcementId);
      setReplies({ ...replies, [announcementId]: response.replies.data });
    } catch (error) {
      console.error("Failed to fetch replies:", error);
    } finally {
      setLoadingReplies({ ...loadingReplies, [announcementId]: false });
    }
  };

  const handleToggleReplies = async (announcementId: number) => {
    const isCurrentlyShowing = showReplies[announcementId];
    setShowReplies({
      ...showReplies,
      [announcementId]: !isCurrentlyShowing,
    });

    if (!isCurrentlyShowing && !replies[announcementId]) {
      await fetchReplies(announcementId);
    }
  };

  const handleCreateReply = async (announcementId: number) => {
    const content = replyContent[announcementId];
    if (!content?.trim()) return;

    setCreatingReply({ ...creatingReply, [announcementId]: true });
    try {
      await authService.initCSRF();

      const replyData: CreateReplyData = {
        content: content.trim(),
        user_type: "trainee",
      };

      const response = await createAnnouncementReplyTrainee(
        announcementId,
        replyData
      );

      const currentReplies = replies[announcementId] || [];
      setReplies({
        ...replies,
        [announcementId]: [...currentReplies, response.reply],
      });

      setReplyContent({ ...replyContent, [announcementId]: "" });

      setAnnouncements((prev) =>
        prev.map((announcement) =>
          announcement.id === announcementId
            ? {
                ...announcement,
                replies_count: (announcement.replies_count || 0) + 1,
              }
            : announcement
        )
      );
    } catch (error) {
      console.error("Failed to create reply:", error);
    } finally {
      setCreatingReply({ ...creatingReply, [announcementId]: false });
    }
  };

  const handleEditReply = (replyId: number, currentContent: string) => {
    setEditingReply({ ...editingReply, [replyId]: true });
    setEditContent({ ...editContent, [replyId]: currentContent });
  };

  const handleCancelEdit = (replyId: number) => {
    setEditingReply({ ...editingReply, [replyId]: false });
    setEditContent({ ...editContent, [replyId]: "" });
  };

  const handleUpdateReply = async (replyId: number, announcementId: number) => {
    const content = editContent[replyId];
    if (!content?.trim()) return;

    try {
      await authService.initCSRF();

      const updateData: CreateReplyData = {
        content: content.trim(),
      };

      const response = await updateAnnouncementReplyTrainee(
        replyId,
        updateData
      );

      setReplies((prev) => ({
        ...prev,
        [announcementId]: prev[announcementId].map((reply) =>
          reply.id === replyId ? response.reply : reply
        ),
      }));

      setEditingReply({ ...editingReply, [replyId]: false });
      setEditContent({ ...editContent, [replyId]: "" });
    } catch (error) {
      console.error("Failed to update reply:", error);
    }
  };

  const handleDeleteReply = async (replyId: number, announcementId: number) => {
    if (!confirm("Are you sure you want to delete this reply?")) return;

    setDeletingReply({ ...deletingReply, [replyId]: true });
    try {
      await authService.initCSRF();
      await deleteAnnouncementReplyTrainee(replyId);

      setReplies((prev) => ({
        ...prev,
        [announcementId]: prev[announcementId].filter(
          (reply) => reply.id !== replyId
        ),
      }));

      setAnnouncements((prev) =>
        prev.map((announcement) =>
          announcement.id === announcementId
            ? {
                ...announcement,
                replies_count: Math.max(
                  (announcement.replies_count || 1) - 1,
                  0
                ),
              }
            : announcement
        )
      );
    } catch (error) {
      console.error("Failed to delete reply:", error);
    } finally {
      setDeletingReply({ ...deletingReply, [replyId]: false });
    }
  };

  const canEditReply = (reply: ReplyData) => {
    return user && user.id === reply.user_id;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Post skeletons */}
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start space-x-4 mb-4">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Skeleton variant="text" width={120} height={20} />
                    <Skeleton
                      variant="rectangular"
                      width={60}
                      height={20}
                      sx={{ borderRadius: "12px" }}
                    />
                  </div>
                  <Skeleton variant="text" width={80} height={16} />
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <Skeleton variant="text" width="90%" height={24} />
                <Skeleton variant="text" width="100%" height={16} />
                <Skeleton variant="text" width="95%" height={16} />
                <Skeleton variant="text" width="75%" height={16} />
              </div>

              <div className="flex items-center space-x-6">
                <Skeleton
                  variant="rectangular"
                  width={80}
                  height={32}
                  sx={{ borderRadius: "8px" }}
                />
                <Skeleton
                  variant="rectangular"
                  width={80}
                  height={32}
                  sx={{ borderRadius: "8px" }}
                />
                <Skeleton
                  variant="rectangular"
                  width={80}
                  height={32}
                  sx={{ borderRadius: "8px" }}
                />
              </div>
            </div>
          </div>
        ))}
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
    <div className="w-full space-y-6">
      {/* Announcements List */}
      {announcements.map((announcement) => (
        <article
          key={announcement.id}
          className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
        >
          <div className="p-4">
            {/* Announcement Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm ring-1 ring-blue-100">
                    <span className="text-white font-medium text-sm">
                      {announcement.created_by_user?.f_name?.charAt(0)}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
                    <MegaphoneIcon className="w-2 h-2 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">
                      {announcement.created_by_user?.f_name}{" "}
                      {announcement.created_by_user?.l_name}
                    </span>
                    {getUserBadge(announcement.created_by_user?.user_type)}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>
                      {formatDate(
                        announcement.published_at ||
                          announcement.created_at ||
                          ""
                      )}
                    </span>
                    {announcement.updated_at &&
                      announcement.updated_at !== announcement.created_at && (
                        <>
                          <span>•</span>
                          <span className="text-amber-600 font-medium">
                            edited
                          </span>
                        </>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Announcement Content */}
            <div className="mb-4">
              <div className="space-y-2">
                <h2 className="text-lg font-medium text-gray-900 leading-tight">
                  {announcement.title}
                </h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleToggleReplies(announcement.id)}
                  disabled={loadingReplies[announcement.id]}
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors duration-200 group"
                >
                  <div className="p-1.5 rounded-md group-hover:bg-blue-50 transition-colors">
                    <ChatBubbleLeftIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium">
                    {loadingReplies[announcement.id] ? (
                      "Loading..."
                    ) : (
                      <>
                        {announcement.replies_count ||
                          replies[announcement.id]?.length ||
                          0}{" "}
                        {(announcement.replies_count ||
                          replies[announcement.id]?.length ||
                          0) === 1
                          ? "Reply"
                          : "Replies"}
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Reply Section */}
            {showReplies[announcement.id] && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                {/* Existing Replies */}
                {replies[announcement.id] &&
                  replies[announcement.id].length > 0 && (
                    <div className="space-y-3">
                      {replies[announcement.id].map((reply) => (
                        <div
                          key={reply.id}
                          className="flex items-start space-x-2 bg-gray-50 rounded-lg p-3"
                        >
                          <div className="w-7 h-7 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white text-xs font-medium">
                              {reply.user_type === "admin"
                                ? getAuthorName(reply.user).charAt(0)
                                : getAuthorName(reply.trainee_user).charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-1">
                                <span className="font-medium text-gray-900 text-xs">
                                  {reply.user_type === "admin"
                                    ? getAuthorName(reply.user)
                                    : getAuthorName(reply.trainee_user)}
                                </span>
                                {getUserBadge(reply.user_type)}
                                <span className="text-gray-400 text-xs">•</span>
                                <span className="text-gray-500 text-xs">
                                  {formatDate(reply.created_at)}
                                </span>
                                {reply.updated_at &&
                                  reply.updated_at !== reply.created_at && (
                                    <>
                                      <span className="text-gray-400 text-xs">
                                        •
                                      </span>
                                      <span className="text-amber-600 font-medium text-xs">
                                        edited
                                      </span>
                                    </>
                                  )}
                              </div>
                              {canEditReply(reply) && (
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() =>
                                      handleEditReply(reply.id, reply.content)
                                    }
                                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    disabled={
                                      editingReply[reply.id] ||
                                      deletingReply[reply.id]
                                    }
                                  >
                                    <PencilIcon className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteReply(
                                        reply.id,
                                        announcement.id
                                      )
                                    }
                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    disabled={
                                      editingReply[reply.id] ||
                                      deletingReply[reply.id]
                                    }
                                  >
                                    <TrashIcon className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                            {editingReply[reply.id] ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editContent[reply.id] || ""}
                                  onChange={(e) =>
                                    setEditContent({
                                      ...editContent,
                                      [reply.id]: e.target.value,
                                    })
                                  }
                                  rows={2}
                                  className="w-full px-2 py-1 border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                                />
                                <div className="flex gap-1">
                                  <Button
                                    onClick={() =>
                                      handleUpdateReply(
                                        reply.id,
                                        announcement.id
                                      )
                                    }
                                    disabled={!editContent[reply.id]?.trim()}
                                    size="sm"
                                    className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleCancelEdit(reply.id)}
                                    size="sm"
                                    className="px-2 py-1 text-xs border-gray-200"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-700 text-xs leading-relaxed">
                                {reply.content}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                {/* Reply Form */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-medium">
                        {user?.f_name?.charAt(0) ||
                          user?.name?.charAt(0) ||
                          "Y"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <textarea
                        placeholder="Write a thoughtful reply..."
                        value={replyContent[announcement.id] || ""}
                        onChange={(e) =>
                          setReplyContent({
                            ...replyContent,
                            [announcement.id]: e.target.value,
                          })
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 resize-none bg-white placeholder-gray-400"
                        disabled={creatingReply[announcement.id]}
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {replyContent[announcement.id]?.length || 0}/200
                          characters
                        </div>
                        <Button
                          onClick={() => handleCreateReply(announcement.id)}
                          disabled={
                            !replyContent[announcement.id]?.trim() ||
                            creatingReply[announcement.id]
                          }
                          className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs"
                        >
                          {creatingReply[announcement.id] ? (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Posting...</span>
                            </div>
                          ) : (
                            "Reply"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </article>
      ))}

      {announcements.length === 0 && !isLoading && (
        <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-gray-200 rounded-lg p-8 text-center shadow-sm">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <MegaphoneIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No announcements yet
            </h3>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Your instructor will post announcements here when they have
              updates to share. Check back regularly for important course
              information.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
