"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@mui/material";
import {
  PlusIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  EllipsisVerticalIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

interface Announcement {
  id: number;
  title: string;
  content: string;
  author: string;
  authorRole: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  isLiked: boolean;
  replies: Reply[];
}

interface Reply {
  id: number;
  content: string;
  author: string;
  authorRole: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

interface AnnouncementFeedProps {
  scheduleId: number;
}

export default function AnnouncementFeed({ scheduleId }: AnnouncementFeedProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [showNewAnnouncementForm, setShowNewAnnouncementForm] = useState(false);
  const [replyContent, setReplyContent] = useState<{ [key: number]: string }>({});
  const [showReplies, setShowReplies] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockAnnouncements: Announcement[] = [
          {
            id: 1,
            title: "Welcome to Maritime Safety Training!",
            content: "Welcome everyone to our comprehensive maritime safety training program. Please make sure you have all required materials and are ready for an intensive learning experience. Don't forget to check your schedules and attendance requirements.",
            author: "Captain Johnson",
            authorRole: "Chief Instructor",
            createdAt: "2024-11-25T10:00:00Z",
            updatedAt: "2024-11-25T10:00:00Z",
            likes: 8,
            isLiked: false,
            replies: [
              {
                id: 1,
                content: "Thank you for the warm welcome! Looking forward to learning.",
                author: "John Doe",
                authorRole: "Trainee",
                createdAt: "2024-11-25T10:30:00Z",
                likes: 3,
                isLiked: true,
              },
              {
                id: 2,
                content: "Excited to start the training program!",
                author: "Sarah Johnson",
                authorRole: "Trainee",
                createdAt: "2024-11-25T11:00:00Z",
                likes: 2,
                isLiked: false,
              }
            ]
          },
          {
            id: 2,
            title: "Updated Training Schedule",
            content: "Please note that tomorrow's practical session has been moved to 2:00 PM due to weather conditions. Make sure to bring your safety equipment.",
            author: "Maritime Academy",
            authorRole: "Administrator",
            createdAt: "2024-11-24T15:30:00Z",
            updatedAt: "2024-11-24T15:30:00Z",
            likes: 12,
            isLiked: true,
            replies: [
              {
                id: 3,
                content: "Understood. Will adjust my schedule accordingly.",
                author: "Mike Wilson",
                authorRole: "Trainee",
                createdAt: "2024-11-24T16:00:00Z",
                likes: 1,
                isLiked: false,
              }
            ]
          }
        ];

        await new Promise(resolve => setTimeout(resolve, 800));
        setAnnouncements(mockAnnouncements);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, [scheduleId]);

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) return;

    const announcement: Announcement = {
      id: Date.now(),
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      author: "Current User",
      authorRole: "Instructor",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      replies: []
    };

    setAnnouncements([announcement, ...announcements]);
    setNewAnnouncement({ title: "", content: "" });
    setShowNewAnnouncementForm(false);
  };

  const handleLike = (announcementId: number) => {
    setAnnouncements(announcements.map(ann => 
      ann.id === announcementId 
        ? { ...ann, isLiked: !ann.isLiked, likes: ann.isLiked ? ann.likes - 1 : ann.likes + 1 }
        : ann
    ));
  };

  const handleReply = (announcementId: number) => {
    const content = replyContent[announcementId];
    if (!content.trim()) return;

    const reply: Reply = {
      id: Date.now(),
      content,
      author: "Current User",
      authorRole: "Trainee",
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };

    setAnnouncements(announcements.map(ann =>
      ann.id === announcementId
        ? { ...ann, replies: [...ann.replies, reply] }
        : ann
    ));

    setReplyContent({ ...replyContent, [announcementId]: "" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <Skeleton variant="circular" width={48} height={48} />
              <div className="flex-1">
                <Skeleton variant="text" width={200} height={20} />
                <Skeleton variant="text" width={300} height={16} sx={{ mt: 1 }} />
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
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <textarea
              placeholder="What would you like to announce?"
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <div className="flex gap-3">
              <Button onClick={handleCreateAnnouncement}>Post Announcement</Button>
              <Button variant="outline" onClick={() => setShowNewAnnouncementForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Announcements List */}
      {announcements.map((announcement) => (
        <div key={announcement.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* Announcement Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {announcement.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{announcement.author}</span>
                    <span>•</span>
                    <span>{announcement.authorRole}</span>
                    <span>•</span>
                    <span>{formatDate(announcement.createdAt)}</span>
                  </div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <EllipsisVerticalIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Announcement Content */}
            <div className="mb-4">
              <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between py-3 border-t border-gray-100">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => handleLike(announcement.id)}
                  className={`flex items-center space-x-2 ${
                    announcement.isLiked ? "text-red-600" : "text-gray-500 hover:text-red-600"
                  }`}
                >
                  {announcement.isLiked ? (
                    <HeartSolidIcon className="w-5 h-5" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                  <span className="text-sm">{announcement.likes}</span>
                </button>
                <button
                  onClick={() => setShowReplies({ ...showReplies, [announcement.id]: !showReplies[announcement.id] })}
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-600"
                >
                  <ChatBubbleLeftIcon className="w-5 h-5" />
                  <span className="text-sm">{announcement.replies.length} replies</span>
                </button>
              </div>
            </div>

            {/* Reply Section */}
            {showReplies[announcement.id] && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                {/* Existing Replies */}
                <div className="space-y-4 mb-4">
                  {announcement.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                          {reply.author.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                            <span className="font-medium text-gray-900">{reply.author}</span>
                            <span>•</span>
                            <span>{reply.authorRole}</span>
                            <span>•</span>
                            <span>{formatDate(reply.createdAt)}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{reply.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">U</span>
                  </div>
                  <div className="flex-1 flex space-x-2">
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      value={replyContent[announcement.id] || ""}
                      onChange={(e) => setReplyContent({ ...replyContent, [announcement.id]: e.target.value })}
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => e.key === "Enter" && handleReply(announcement.id)}
                    />
                    <Button
                      onClick={() => handleReply(announcement.id)}
                      size="sm"
                      className="px-3"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {announcements.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <ChatBubbleLeftIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements yet</h3>
          <p className="text-gray-600">Create the first announcement to start the conversation.</p>
        </div>
      )}
    </div>
  );
}