"use client";

import React, { useState } from "react";
import AdminLayout from "@/src/components/admin/AdminLayout";
import AuthGuard from "@/src/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import {
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  PlayCircleIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  BookmarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  VideoCameraIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
} from "@heroicons/react/24/solid";
import { Button } from "@/src/components/ui/button";

type FeedItemType = "manual" | "procedure" | "tutorial";

interface FeedItem {
  id: number;
  type: FeedItemType;
  title: string;
  author: string;
  authorRole: string;
  timestamp: string;
  description: string;
  thumbnail?: string;
  likes: number;
  comments: number;
  views: number;
  isLiked: boolean;
  isSaved: boolean;
  category: string;
  duration?: string;
  fileSize?: string;
  tags: string[];
}

const feedData: FeedItem[] = [
  {
    id: 1,
    type: "manual",
    title: "LMS User Manual - Getting Started Guide",
    author: "Admin Team",
    authorRole: "System Administrator",
    timestamp: "2 hours ago",
    description:
      "Complete guide for new users to navigate the Learning Management System. Includes step-by-step instructions for course enrollment, progress tracking, and certificate downloads.",
    thumbnail: "/docs/manual-thumb.jpg",
    likes: 45,
    comments: 12,
    views: 234,
    isLiked: false,
    isSaved: true,
    category: "User Manual",
    fileSize: "2.4 MB",
    tags: ["Getting Started", "Beginner", "Essential"],
  },
  {
    id: 2,
    type: "tutorial",
    title: "How to Create and Manage Courses",
    author: "Sarah Johnson",
    authorRole: "Training Manager",
    timestamp: "5 hours ago",
    description:
      "Learn how to create engaging courses, add learning materials, set up assessments, and manage student enrollments. This video tutorial covers all essential features for course creators.",
    thumbnail: "/tutorials/course-creation.jpg",
    likes: 128,
    comments: 34,
    views: 567,
    isLiked: true,
    isSaved: false,
    category: "Video Tutorial",
    duration: "15:30",
    tags: ["Course Creation", "Admin", "Advanced"],
  },
  {
    id: 3,
    type: "procedure",
    title: "Quality Assurance Procedures for Course Content",
    author: "Quality Assurance Team",
    authorRole: "QA Department",
    timestamp: "1 day ago",
    description:
      "Standard operating procedures for reviewing and approving course content. Includes quality checklist, review criteria, and approval workflow.",
    thumbnail: "/procedures/qa-thumb.jpg",
    likes: 89,
    comments: 21,
    views: 412,
    isLiked: false,
    isSaved: true,
    category: "Quality Procedure",
    fileSize: "1.8 MB",
    tags: ["Quality Assurance", "SOP", "Compliance"],
  },
  {
    id: 4,
    type: "tutorial",
    title: "Student Assessment and Grading Best Practices",
    author: "Michael Chen",
    authorRole: "Senior Instructor",
    timestamp: "2 days ago",
    description:
      "Master the art of creating effective assessments and fair grading systems. This tutorial demonstrates how to use the assessment tools, set grading criteria, and provide meaningful feedback.",
    thumbnail: "/tutorials/assessment.jpg",
    likes: 156,
    comments: 45,
    views: 789,
    isLiked: true,
    isSaved: true,
    category: "Video Tutorial",
    duration: "22:15",
    tags: ["Assessment", "Grading", "Best Practices"],
  },
  {
    id: 5,
    type: "manual",
    title: "Administrator Dashboard Manual",
    author: "Admin Team",
    authorRole: "System Administrator",
    timestamp: "3 days ago",
    description:
      "Comprehensive manual for understanding and utilizing the administrator dashboard. Learn about analytics, user management, system configuration, and reporting features.",
    thumbnail: "/docs/admin-manual.jpg",
    likes: 67,
    comments: 18,
    views: 345,
    isLiked: false,
    isSaved: false,
    category: "User Manual",
    fileSize: "3.1 MB",
    tags: ["Admin Dashboard", "Analytics", "Management"],
  },
  {
    id: 6,
    type: "procedure",
    title: "Data Privacy and Security Procedures",
    author: "IT Security Team",
    authorRole: "Security Department",
    timestamp: "4 days ago",
    description:
      "Essential procedures for maintaining data privacy and security compliance. Covers user data handling, access controls, audit logs, and incident response protocols.",
    thumbnail: "/procedures/security.jpg",
    likes: 201,
    comments: 56,
    views: 892,
    isLiked: true,
    isSaved: true,
    category: "Quality Procedure",
    fileSize: "2.2 MB",
    tags: ["Security", "Privacy", "Compliance", "GDPR"],
  },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<"all" | FeedItemType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [feedItems, setFeedItems] = useState<FeedItem[]>(feedData);

  const handleLike = (id: number) => {
    setFeedItems(
      feedItems.map((item) =>
        item.id === id
          ? {
              ...item,
              isLiked: !item.isLiked,
              likes: item.isLiked ? item.likes - 1 : item.likes + 1,
            }
          : item
      )
    );
  };

  const handleSave = (id: number) => {
    setFeedItems(
      feedItems.map((item) =>
        item.id === id ? { ...item, isSaved: !item.isSaved } : item
      )
    );
  };

  const filteredItems =
    activeFilter === "all"
      ? feedItems
      : feedItems.filter((item) => item.type === activeFilter);

  const getTypeIcon = (type: FeedItemType) => {
    switch (type) {
      case "manual":
        return <DocumentTextIcon className="w-5 h-5" />;
      case "procedure":
        return <ClipboardDocumentCheckIcon className="w-5 h-5" />;
      case "tutorial":
        return <PlayCircleIcon className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: FeedItemType) => {
    switch (type) {
      case "manual":
        return "bg-blue-100 text-blue-700";
      case "procedure":
        return "bg-green-100 text-green-700";
      case "tutorial":
        return "bg-purple-100 text-purple-700";
    }
  };

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Learning Resources
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.f_name}. Explore manuals, procedures, and
              tutorials.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <FunnelIcon className="w-5 h-5 mr-2" />
                  Filter Content
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveFilter("all")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeFilter === "all"
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    All Resources
                  </button>
                  <button
                    onClick={() => setActiveFilter("manual")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center ${
                      activeFilter === "manual"
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    User Manuals
                  </button>
                  <button
                    onClick={() => setActiveFilter("procedure")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center ${
                      activeFilter === "procedure"
                        ? "bg-green-100 text-green-700 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" />
                    Quality Procedures
                  </button>
                  <button
                    onClick={() => setActiveFilter("tutorial")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center ${
                      activeFilter === "tutorial"
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <VideoCameraIcon className="w-4 h-4 mr-2" />
                    Video Tutorials
                  </button>
                </div>

                <hr className="my-6" />

                <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                  Quick Stats
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Documents</span>
                    <span className="font-medium">142</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Views</span>
                    <span className="font-medium">12.4K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saved Items</span>
                    <span className="font-medium">28</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-4">
              {/* Search Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search manuals, procedures, or tutorials..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Feed Items */}
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Post Header */}
                  <div className="p-4 flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {item.author.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {item.author}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.authorRole} • {item.timestamp}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getTypeColor(
                        item.type
                      )}`}
                    >
                      {getTypeIcon(item.type)}
                      <span className="ml-1 capitalize">{item.type}</span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="px-4 pb-3">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {item.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Thumbnail/Preview */}
                  {item.thumbnail && (
                    <div className="relative bg-gray-100 h-64 flex items-center justify-center">
                      {item.type === "tutorial" ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600">
                          <PlayCircleIcon className="w-20 h-20 text-white opacity-90" />
                          {item.duration && (
                            <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
                              {item.duration}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          {item.type === "manual" ? (
                            <DocumentTextIcon className="w-20 h-20 text-gray-400" />
                          ) : (
                            <ClipboardDocumentCheckIcon className="w-20 h-20 text-gray-400" />
                          )}
                          {item.fileSize && (
                            <div className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
                              {item.fileSize}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stats Bar */}
                  <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <HeartIconSolid className="w-4 h-4 text-red-500 mr-1" />
                        {item.likes}
                      </span>
                      <span className="flex items-center">
                        <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
                        {item.comments}
                      </span>
                      <span className="flex items-center">
                        <EyeIcon className="w-4 h-4 mr-1" />
                        {item.views}
                      </span>
                    </div>
                    <span className="text-xs">{item.category}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-around">
                    <button
                      onClick={() => handleLike(item.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        item.isLiked
                          ? "text-red-600 bg-red-50"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {item.isLiked ? (
                        <HeartIconSolid className="w-5 h-5" />
                      ) : (
                        <HeartIcon className="w-5 h-5" />
                      )}
                      <span className="font-medium text-sm">Like</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                      <ChatBubbleLeftIcon className="w-5 h-5" />
                      <span className="font-medium text-sm">Comment</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                      <ShareIcon className="w-5 h-5" />
                      <span className="font-medium text-sm">Share</span>
                    </button>
                    <button
                      onClick={() => handleSave(item.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        item.isSaved
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {item.isSaved ? (
                        <BookmarkIconSolid className="w-5 h-5" />
                      ) : (
                        <BookmarkIcon className="w-5 h-5" />
                      )}
                      <span className="font-medium text-sm">Save</span>
                    </button>
                  </div>

                  {/* View/Download Button */}
                  <div className="px-4 pb-4">
                    <Button className="w-full flex items-center justify-center space-x-2">
                      {item.type === "tutorial" ? (
                        <>
                          <PlayCircleIcon className="w-5 h-5" />
                          <span>Watch Tutorial</span>
                        </>
                      ) : (
                        <>
                          <DocumentArrowDownIcon className="w-5 h-5" />
                          <span>View Document</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Sidebar - Trending & Saved */}
            <div className="lg:col-span-1">
              <div className="space-y-4 sticky top-6">
                {/* Trending Topics */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">
                    Trending Topics
                  </h2>
                  <div className="space-y-3">
                    {[
                      { tag: "Getting Started", count: "1.2K views" },
                      { tag: "Quality Assurance", count: "890 views" },
                      { tag: "Assessment", count: "756 views" },
                      { tag: "Security", count: "654 views" },
                      { tag: "Course Creation", count: "543 views" },
                    ].map((topic, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-medium text-sm text-gray-900">
                            #{topic.tag}
                          </div>
                          <div className="text-xs text-gray-500">
                            {topic.count}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Updates */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">
                    Recent Updates
                  </h2>
                  <div className="space-y-4">
                    {[
                      {
                        title: "New Security Guidelines",
                        time: "1 hour ago",
                        type: "procedure",
                      },
                      {
                        title: "Updated User Manual",
                        time: "3 hours ago",
                        type: "manual",
                      },
                      {
                        title: "Assessment Tutorial",
                        time: "1 day ago",
                        type: "tutorial",
                      },
                    ].map((update, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors"
                      >
                        <div
                          className={`p-2 rounded-lg ${getTypeColor(
                            update.type as FeedItemType
                          )}`}
                        >
                          {getTypeIcon(update.type as FeedItemType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {update.title}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            {update.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
                  <h2 className="font-semibold mb-2">Need Help?</h2>
                  <p className="text-sm text-blue-100 mb-4">
                    Contact support or browse our help center for assistance.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full bg-white text-blue-600 hover:bg-blue-50 border-0"
                  >
                    Get Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
