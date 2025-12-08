"use client";

import React from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import Layout from "@/components/layout/Layout";
import AssessmentList from "@/src/components/trainee/AssessmentList";

export default function AssessmentsPage() {
  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">My Assessments</h1>
                <p className="text-blue-100">
                  View and take assessments for your enrolled courses
                </p>
              </div>
            </div>
          </div>

          {/* Assessment List */}
          <AssessmentList />
        </div>
      </Layout>
    </AuthGuard>
  );
}