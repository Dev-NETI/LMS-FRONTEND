"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@mui/material";
import {
  PlusIcon,
  ChatBubbleLeftIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
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
    <div className="w-full space-y-4">
      {/* Create New Announcement */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {!showNewAnnouncementForm ? (
          <div className="p-4">
            <Button
              onClick={() => setShowNewAnnouncementForm(true)}
              variant="outline"
              className="w-full text-left justify-start text-gray-500 bg-gray-50 hover:bg-gray-100 border-gray-200 rounded-lg py-3"
            >
              <PlusIcon className="w-4 h-4 mr-3" />
              What's new? Share an announcement...
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <input
              type="text"
              placeholder="Title"
              value={newAnnouncement.title}
              onChange={(e) =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  title: e.target.value,
                })
              }
              className="w-full p-3 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
              className="w-full p-3 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleCreateAnnouncement}
                disabled={
                  isCreating ||
                  !newAnnouncement.title.trim() ||
                  !newAnnouncement.content.trim()
                }
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                {isCreating ? "Posting..." : "Post"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowNewAnnouncementForm(false)}
                disabled={isCreating}
                size="sm"
                className="text-sm"
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
          className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200"
        >
          <div className="p-4">
            {/* Announcement Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {getAuthorName(announcement.created_by_user).charAt(0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 text-sm">
                      {getAuthorName(announcement.created_by_user)}
                    </span>
                    {getUserBadge(announcement.created_by_user?.user_type)}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
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
                          <span>edited</span>
                        </>
                      )}
                  </div>
                </div>
              </div>
              {canEditAnnouncement(announcement) && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditAnnouncement(announcement)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
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
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
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
                <div className="space-y-3 bg-gray-50 rounded-lg p-3">
                  <input
                    type="text"
                    placeholder="Title"
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
                    className="w-full p-2 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                  />
                  <textarea
                    placeholder="Content"
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
                    className="w-full p-2 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdateAnnouncement(announcement.id)}
                      disabled={
                        !editAnnouncementData[announcement.id]?.title.trim() ||
                        !editAnnouncementData[announcement.id]?.content.trim()
                      }
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleCancelEditAnnouncement(announcement.id)
                      }
                      size="sm"
                      className="text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 text-sm">
                    {announcement.title}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center pt-3 border-t border-gray-100">
              <button
                onClick={() => handleToggleReplies(announcement.id)}
                disabled={loadingReplies[announcement.id]}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 text-sm"
              >
                <ChatBubbleLeftIcon className="w-4 h-4" />
                <span>
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
                        ? "reply"
                        : "replies"}
                    </>
                  )}
                </span>
              </button>
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
                          className="flex items-start space-x-3 pb-3"
                        >
                          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {getAuthorName(reply.user).charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-xs">
                                <span className="font-medium text-gray-900">
                                  {getAuthorName(reply.user)}
                                </span>
                                {getUserBadge(reply.user?.user_type)}
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500">
                                  {formatDate(reply.created_at)}
                                </span>
                                {reply.updated_at &&
                                  reply.updated_at !== reply.created_at && (
                                    <>
                                      <span className="text-gray-400">•</span>
                                      <span className="text-blue-600">
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
                                    className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
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
                                    className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
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
                              <div className="mt-2 space-y-2">
                                <textarea
                                  value={editContent[reply.id] || ""}
                                  onChange={(e) =>
                                    setEditContent({
                                      ...editContent,
                                      [reply.id]: e.target.value,
                                    })
                                  }
                                  rows={2}
                                  className="w-full p-2 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 resize-none"
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
                                    className="text-xs h-6 px-2"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleCancelEdit(reply.id)}
                                    size="sm"
                                    className="text-xs h-6 px-2"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-700 text-xs mt-1 leading-relaxed">
                                {reply.content}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                {/* Reply Form */}
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {user?.f_name?.charAt(0) || user?.name?.charAt(0) || "Y"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="Write a reply..."
                      value={replyContent[announcement.id] || ""}
                      onChange={(e) =>
                        setReplyContent({
                          ...replyContent,
                          [announcement.id]: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full p-2 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 resize-none"
                      disabled={creatingReply[announcement.id]}
                    />
                    <div className="mt-2 flex justify-end">
                      <Button
                        onClick={() => handleCreateReply(announcement.id)}
                        disabled={
                          !replyContent[announcement.id]?.trim() ||
                          creatingReply[announcement.id]
                        }
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-6 px-3"
                      >
                        {creatingReply[announcement.id]
                          ? "Posting..."
                          : "Reply"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {announcements.length === 0 && !isLoading && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <ChatBubbleLeftIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No announcements yet
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            Create the first announcement to start the conversation.
          </p>
          <Button
            onClick={() => setShowNewAnnouncementForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Announcement
          </Button>
        </div>
      )}
    </div>
  );
}
