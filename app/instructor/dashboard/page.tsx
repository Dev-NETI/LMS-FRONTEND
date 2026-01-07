"use client";

import AuthGuard from "@/src/components/auth/AuthGuard";
import InsturctorLayout from "@/src/components/instructor/InstructorLayout";
import React, { useState } from "react";
import {
  PlayIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  BookOpenIcon,
  ArrowDownIcon,
  PauseIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

// ===== CONTENT CONFIGURATION =====
// Easily modify the video and documents here
const CONTENT_CONFIG = {
  video: {
    title: "LMS User Manual - Instructor Guide",
    description:
      "Complete guide on how to use the Learning Management System as an instructor",
    // Replace with your video URL - supports YouTube, Vimeo, or direct video files
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Sample YouTube video
    // For local videos, use: "/videos/lms-manual.mp4"
    thumbnail: "/api/placeholder/400/225", // Optional custom thumbnail
  },
  documents: [
    {
      id: 1,
      title: "LMS Familiarization Guide",
      description: "Getting started with the Learning Management System",
      type: "PDF",
      size: "2.5 MB",
      url: "/documents/lms-familiarization.pdf", // Replace with actual document path
      icon: DocumentTextIcon,
      color: "text-red-600 bg-red-100",
    },
    {
      id: 2,
      title: "Instructor Quick Reference",
      description: "Quick reference guide for common instructor tasks",
      type: "PDF",
      size: "1.8 MB",
      url: "/documents/instructor-quick-ref.pdf", // Replace with actual document path
      icon: BookOpenIcon,
      color: "text-blue-600 bg-blue-100",
    },
    {
      id: 3,
      title: "Course Creation Tutorial",
      description: "Step-by-step guide to creating and managing courses",
      type: "PDF",
      size: "3.2 MB",
      url: "/documents/course-creation.pdf", // Replace with actual document path
      icon: DocumentTextIcon,
      color: "text-green-600 bg-green-100",
    },
  ],
};
// ===== END CONFIGURATION =====

function Dashboard() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleDocumentDownload = (document: any) => {
    // You can implement custom download logic here
    window.open(document.url, "_blank");
  };

  const getVideoEmbedUrl = (url: string) => {
    // Handle YouTube URLs
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Handle Vimeo URLs
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  return (
    <>
      <AuthGuard>
        <InsturctorLayout>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                  Instructor Dashboard
                </h1>
                <p className="text-gray-600">
                  Welcome to your instructor portal. Access training materials
                  and documentation below.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Video Player Section */}
                <div className="xl:col-span-2">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <VideoCameraIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            {CONTENT_CONFIG.video.title}
                          </h2>
                          <p className="text-blue-100 text-sm">
                            {CONTENT_CONFIG.video.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="relative bg-gray-900 rounded-xl overflow-hidden">
                        <div className="aspect-video">
                          {!isVideoPlaying ? (
                            // Video Thumbnail/Placeholder
                            <div
                              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 cursor-pointer group"
                              onClick={() => setIsVideoPlaying(true)}
                            >
                              <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4 group-hover:bg-blue-700 transition-colors shadow-lg">
                                  <PlayIcon className="w-8 h-8 text-white ml-1" />
                                </div>
                                <h3 className="text-white font-semibold text-lg mb-2">
                                  Play User Manual Video
                                </h3>
                                <p className="text-gray-300 text-sm">
                                  Click to start the LMS instructor tutorial
                                </p>
                              </div>
                            </div>
                          ) : (
                            // Video Player
                            <div className="w-full h-full">
                              <iframe
                                src={getVideoEmbedUrl(CONTENT_CONFIG.video.url)}
                                title={CONTENT_CONFIG.video.title}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                          )}
                        </div>

                        {isVideoPlaying && (
                          <button
                            onClick={() => setIsVideoPlaying(false)}
                            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
                          >
                            <PauseIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="mt-4 text-sm text-gray-600">
                        <p>
                          📖 This video covers all essential features for
                          instructors including course management, student
                          tracking, assignment creation, and assessment tools.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="xl:col-span-1">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-fit">
                    <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <DocumentTextIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            Documentation
                          </h2>
                          <p className="text-green-100 text-sm">
                            LMS guides and references
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="space-y-4">
                        {CONTENT_CONFIG.documents.map((document) => {
                          const IconComponent = document.icon;
                          return (
                            <div
                              key={document.id}
                              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
                              onClick={() => handleDocumentDownload(document)}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`p-2 rounded-lg ${document.color}`}
                                >
                                  <IconComponent className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                                        {document.title}
                                      </h3>
                                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                        {document.description}
                                      </p>
                                    </div>
                                    <LinkIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors ml-2 flex-shrink-0" />
                                  </div>
                                  <div className="flex items-center gap-2 mt-3">
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                      {document.type}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {document.size}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowDownIcon className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            Quick Access
                          </span>
                        </div>
                        <p className="text-xs text-blue-700">
                          Click on any document to download or view. All
                          materials are updated regularly to reflect the latest
                          LMS features.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Need Additional Help?
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Our support team is here to assist you with any questions
                    about the LMS platform.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <a
                      href="mailto:support@lms.com"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Contact Support
                    </a>
                    <a
                      href="/help"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      Help Center
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </InsturctorLayout>
      </AuthGuard>
    </>
  );
}

export default Dashboard;
