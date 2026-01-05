import React from "react";
import ScheduleCalendar from "@/src/components/trainee/ScheduleCalendar";
import AuthGuard from "@/src/components/auth/AuthGuard";
import Layout from "@/src/components/layout/Layout";

function Schedule() {
  return (
    <>
      <AuthGuard>
        <Layout>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                  Course Schedule
                </h1>
                <p className="text-gray-600">
                  View your enrolled course schedules in a calendar format
                </p>
              </div>

              <ScheduleCalendar />
            </div>
          </div>
        </Layout>
      </AuthGuard>
    </>
  );
}

export default Schedule;
