"use client";

import React from "react";
import { useParams, useSearchParams } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import Layout from "@/components/layout/Layout";
import AssessmentTaking from "@/src/components/trainee/AssessmentTaking";

export default function AssessmentTakingPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const assessmentId = Number(params.assessmentId);
  const attemptId = searchParams.get("attemptId")
    ? Number(searchParams.get("attemptId"))
    : undefined;

  return (
    <AuthGuard>
      <Layout>
        <AssessmentTaking assessmentId={assessmentId} attemptId={attemptId} />
      </Layout>
    </AuthGuard>
  );
}
