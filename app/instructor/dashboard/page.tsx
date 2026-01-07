import AuthGuard from "@/src/components/auth/AuthGuard";
import InsturctorLayout from "@/src/components/instructor/InstructorLayout";
import React from "react";

function Dashboard() {
  return (
    <>
      <AuthGuard>
        <InsturctorLayout>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                  Instructor Dashboard
                </h1>
              </div>
            </div>
          </div>
        </InsturctorLayout>
      </AuthGuard>
    </>
  );
}

export default Dashboard;
