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
  getAnnouncementsBySchedule,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementReplies,
  createAnnouncementReply,
  updateAnnouncementReply,
  deleteAnnouncementReply,
  AnnouncementPost,
  CreateAnnouncementData,
  CreateReplyData,
  ReplyData,
} from "@/src/services/announcementService";
import { authService } from "@/src/services/authService";
import { useAuth } from "@/src/context/AuthContext";

interface AnnouncementFeedProps {
  scheduleId: number;
}

export default function AnnouncementFeed({
  scheduleId,
}: AnnouncementFeedProps) {
  const { user } = useAuth();
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
  const [editingAnnouncement, setEditingAnnouncement] = useState<{
    [key: number]: boolean;
  }>({});
  const [editAnnouncementData, setEditAnnouncementData] = useState<{
    [key: number]: { title: string; content: string };
  }>({});
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!scheduleId) return;

      setIsLoading(true);
      try {
        // Ensure CSRF is initialized before making requests
        await authService.initCSRF();
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
      // Ensure CSRF is initialized before making POST request
      await authService.initCSRF();

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
    user_type?: "admin" | "trainee";
  }) => {
    if (!user) return "Unknown User";

    // For admin users, they might have a 'name' field
    if (user.user_type === "admin" && user.name) {
      return user.name;
    }

    // For trainee users or admin users with separate name fields
    const firstName = user.f_name || "";
    const middleInitial = user.m_name ? ` ${user.m_name.charAt(0)}.` : "";
    const lastName = user.l_name ? ` ${user.l_name}` : "";
    const fullName = `${firstName}${middleInitial}${lastName}`.trim();

    return fullName || user.name || "Unknown User";
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

  const fetchReplies = async (announcementId: number) => {
    if (replies[announcementId]) return;

    setLoadingReplies({ ...loadingReplies, [announcementId]: true });
    try {
      await authService.initCSRF();
      const response = await getAnnouncementReplies(announcementId);
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
      };

      const response = await createAnnouncementReply(announcementId, replyData);

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

      const response = await updateAnnouncementReply(replyId, updateData);

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
      await deleteAnnouncementReply(replyId);

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
    return user && (user.id === reply.user_id || user.user_type === "admin");
  };

  const canEditAnnouncement = (announcement: AnnouncementPost) => {
    return (
      user &&
      (user.id === announcement.created_by_user_id ||
        user.user_type === "admin")
    );
  };

  const handleEditAnnouncement = (announcement: AnnouncementPost) => {
    setEditingAnnouncement({ ...editingAnnouncement, [announcement.id]: true });
    setEditAnnouncementData({
      ...editAnnouncementData,
      [announcement.id]: {
        title: announcement.title,
        content: announcement.content,
      },
    });
  };

  const handleCancelEditAnnouncement = (announcementId: number) => {
    setEditingAnnouncement({ ...editingAnnouncement, [announcementId]: false });
    setEditAnnouncementData({
      ...editAnnouncementData,
      [announcementId]: { title: "", content: "" },
    });
  };

  const handleUpdateAnnouncement = async (announcementId: number) => {
    const data = editAnnouncementData[announcementId];
    if (!data?.title.trim() || !data?.content.trim()) return;

    try {
      await authService.initCSRF();

      const updateData: Partial<CreateAnnouncementData> = {
        title: data.title.trim(),
        content: data.content.trim(),
      };

      const response = await updateAnnouncement(announcementId, updateData);

      setAnnouncements((prev) =>
        prev.map((announcement) =>
          announcement.id === announcementId
            ? response.announcement
            : announcement
        )
      );

      setEditingAnnouncement({
        ...editingAnnouncement,
        [announcementId]: false,
      });
      setEditAnnouncementData({
        ...editAnnouncementData,
        [announcementId]: { title: "", content: "" },
      });
    } catch (error) {
      console.error("Failed to update announcement:", error);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this announcement? This action cannot be undone."
      )
    )
      return;

    setDeletingAnnouncement({
      ...deletingAnnouncement,
      [announcementId]: true,
    });
    try {
      await authService.initCSRF();
      await deleteAnnouncement(announcementId);

      setAnnouncements((prev) =>
        prev.filter((announcement) => announcement.id !== announcementId)
      );

      // Clear any related replies from state
      if (replies[announcementId]) {
        const newReplies = { ...replies };
        delete newReplies[announcementId];
        setReplies(newReplies);
      }
    } catch (error) {
      console.error("Failed to delete announcement:", error);
    } finally {
      setDeletingAnnouncement({
        ...deletingAnnouncement,
        [announcementId]: false,
      });
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
        {/* Create post skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex-1">
              <Skeleton
                variant="rectangular"
                width="100%"
                height={44}
                sx={{ borderRadius: "12px" }}
              />
            </div>
          </div>
        </div>

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

  return (
    <div className="w-full space-y-6">
      {/* Create New Announcement */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {!showNewAnnouncementForm ? (
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-medium text-sm">
                  {user?.f_name?.charAt(0) || user?.name?.charAt(0) || "Y"}
                </span>
              </div>
              <button
                onClick={() => setShowNewAnnouncementForm(true)}
                className="flex-1 text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-all duration-200 group"
              >
                <div className="flex items-center space-x-2">
                  <MegaphoneIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm text-gray-500 group-hover:text-gray-700">
                    Share an announcement with your team...
                  </span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-start space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-medium text-sm">
                  {user?.f_name?.charAt(0) || user?.name?.charAt(0) || "Y"}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-sm mb-1">
                  Create Announcement
                </h3>
                <p className="text-xs text-gray-500">
                  Share important updates with your team
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter announcement title..."
                value={newAnnouncement.title}
                onChange={(e) =>
                  setNewAnnouncement({
                    ...newAnnouncement,
                    title: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 transition-all"
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
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm placeholder-gray-400 transition-all"
              />

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-400">
                  {newAnnouncement.content.length}/500 characters
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNewAnnouncementForm(false);
                      setNewAnnouncement({ title: "", content: "" });
                    }}
                    disabled={isCreating}
                    className="px-3 py-1 text-xs border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAnnouncement}
                    disabled={
                      isCreating ||
                      !newAnnouncement.title.trim() ||
                      !newAnnouncement.content.trim()
                    }
                    className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {isCreating ? (
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Publishing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <MegaphoneIcon className="w-3 h-3" />
                        <span>Publish</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
                      {getAuthorName(announcement.created_by_user).charAt(0)}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
                    <MegaphoneIcon className="w-2 h-2 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">
                      {getAuthorName(announcement.created_by_user)}
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
              {canEditAnnouncement(announcement) && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditAnnouncement(announcement)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                    disabled={
                      editingAnnouncement[announcement.id] ||
                      deletingAnnouncement[announcement.id]
                    }
                    title="Edit announcement"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
                    disabled={
                      editingAnnouncement[announcement.id] ||
                      deletingAnnouncement[announcement.id]
                    }
                    title="Delete announcement"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Announcement Content */}
            <div className="mb-4">
              {editingAnnouncement[announcement.id] ? (
                <div className="space-y-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                  <input
                    type="text"
                    placeholder="Enter announcement title..."
                    value={editAnnouncementData[announcement.id]?.title || ""}
                    onChange={(e) =>
                      setEditAnnouncementData({
                        ...editAnnouncementData,
                        [announcement.id]: {
                          ...editAnnouncementData[announcement.id],
                          title: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-white"
                  />
                  <textarea
                    placeholder="Update announcement content..."
                    value={editAnnouncementData[announcement.id]?.content || ""}
                    onChange={(e) =>
                      setEditAnnouncementData({
                        ...editAnnouncementData,
                        [announcement.id]: {
                          ...editAnnouncementData[announcement.id],
                          content: e.target.value,
                        },
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm bg-white"
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {editAnnouncementData[announcement.id]?.content?.length ||
                        0}
                      /500 characters
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleCancelEditAnnouncement(announcement.id)
                        }
                        className="px-3 py-1 text-xs border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() =>
                          handleUpdateAnnouncement(announcement.id)
                        }
                        disabled={
                          !editAnnouncementData[
                            announcement.id
                          ]?.title.trim() ||
                          !editAnnouncementData[announcement.id]?.content.trim()
                        }
                        className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs"
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
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
              )}
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
                              {getAuthorName(reply.user).charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-1">
                                <span className="font-medium text-gray-900 text-xs">
                                  {getAuthorName(reply.user)}
                                </span>
                                {getUserBadge(reply.user?.user_type)}
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
              Be the first to share important updates and news with your team.
              Start the conversation and keep everyone informed.
            </p>
            <Button
              onClick={() => setShowNewAnnouncementForm(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 text-sm shadow-md hover:shadow-lg transition-all duration-200"
            >
              <MegaphoneIcon className="w-4 h-4 mr-2" />
              Create First Announcement
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
