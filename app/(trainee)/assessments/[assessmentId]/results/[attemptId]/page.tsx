"use client";

import React from "react";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import Layout from "@/components/layout/Layout";
import AssessmentResults from "@/src/components/trainee/AssessmentResults";

export default function AssessmentResultsPage() {
  const params = useParams();
  const assessmentId = Number(params.assessmentId);
  const attemptId = Number(params.attemptId);

  return (
    <AuthGuard>
      <Layout>
        <AssessmentResults 
          attemptId={attemptId} 
          assessmentId={assessmentId} 
        />
      </Layout>
    </AuthGuard>
  );
}