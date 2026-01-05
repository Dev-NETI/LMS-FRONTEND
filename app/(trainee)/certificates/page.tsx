"use client";

import React from "react";
import {
  AcademicCapIcon,
  CogIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import AuthGuard from "@/src/components/auth/AuthGuard";
import Layout from "@/src/components/layout/Layout";

const CertificatesPage = () => {
  return (
    <AuthGuard>
      <Layout>
        <div className="min-h-screen p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <AcademicCapIcon className="w-12 h-12 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Certificates
                </h1>
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                View and download your course completion certificates
              </p>
            </div>

            {/* Under Development Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Warning Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
                <div className="flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-white mr-2" />
                  <span className="text-white font-semibold">
                    Under Development
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CogIcon className="w-12 h-12 text-blue-600 animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Certificates Feature Coming Soon
                  </h2>
                  <p className="text-gray-600 text-lg">
                    We're working hard to bring you a comprehensive certificate
                    management system.
                  </p>
                </div>

                {/* Features Preview */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <AcademicCapIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Digital Certificates
                    </h3>
                    <p className="text-sm text-gray-600">
                      Download official course completion certificates in PDF
                      format
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <ClockIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Certificate History
                    </h3>
                    <p className="text-sm text-gray-600">
                      View all your earned certificates in one organized
                      location
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <CogIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Verification
                    </h3>
                    <p className="text-sm text-gray-600">
                      Verify certificate authenticity with unique certificate
                      IDs
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 font-medium">
                    🚀 This feature is currently in development and will be
                    available soon!
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    Check back later or contact your administrator for updates.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center mt-6">
              <p className="text-gray-500 text-sm">
                Need immediate access to your certificates? Contact your course
                administrator.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default CertificatesPage;
