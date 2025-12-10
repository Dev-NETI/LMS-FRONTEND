"use client";

import React, { useState, useEffect } from "react";
import {
  adminSecurityService,
  SecurityLogEntry,
} from "@/services/adminSecurityService";

interface SecurityLogsViewerProps {
  assessmentId?: number;
  traineeId?: number;
}

export default function SecurityLogsViewer({
  assessmentId,
  traineeId,
}: SecurityLogsViewerProps) {
  const [logs, setLogs] = useState<SecurityLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const fetchLogs = async (page: number = 1) => {
    setLoading(true);
    try {
      let response;
      if (assessmentId) {
        response = await adminSecurityService.getAssessmentSecurityLogs(
          assessmentId
        );
      } else if (traineeId) {
        response = await adminSecurityService.getTraineeSecurityLogs(traineeId);
      } else {
        response = await adminSecurityService.getAllSecurityLogs(page, 50);
      }

      if (response.success) {
        setLogs(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error fetching security logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage, assessmentId, traineeId]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address.includes(searchTerm);

    if (filter === "all") return matchesSearch;

    const suspiciousActivities = adminSecurityService.getSuspiciousActivities([
      log,
    ]);
    const isSuspicious = suspiciousActivities.length > 0;

    if (filter === "suspicious") return matchesSearch && isSuspicious;
    if (filter === "normal") return matchesSearch && !isSuspicious;

    return matchesSearch && log.activity.toLowerCase().includes(filter);
  });

  const summary = adminSecurityService.getLogsSummary(logs);

  const getSeverityBadge = (log: SecurityLogEntry) => {
    const formatted = adminSecurityService.formatLogEntry(log);
    const colorClass =
      formatted.severity === "high"
        ? "bg-red-100 text-red-800 border-red-200"
        : formatted.severity === "medium"
        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
        : "bg-gray-100 text-gray-800 border-gray-200";

    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ml-2 ${colorClass}`}
      >
        {formatted.severity}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {summary.totalEvents}
          </div>
          <div className="text-sm text-gray-600">Total Events</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {summary.suspiciousEvents}
          </div>
          <div className="text-sm text-gray-600">Suspicious Events</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {summary.uniqueTrainees}
          </div>
          <div className="text-sm text-gray-600">Unique Trainees</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {summary.uniqueAssessments}
          </div>
          <div className="text-sm text-gray-600">Unique Assessments</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-6">
          <svg
            className="w-5 h-5 text-gray-600 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900">Security Logs</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by activity or IP address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
          >
            <option value="all">All Events</option>
            <option value="suspicious">Suspicious Only</option>
            <option value="normal">Normal Only</option>
            <option value="tab switch">Tab Switches</option>
            <option value="blocked">Blocked Actions</option>
            <option value="assessment">Assessment Events</option>
          </select>

          <button
            onClick={() => fetchLogs(currentPage)}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trainee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assessment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log, index) => {
                const formatted = adminSecurityService.formatLogEntry(log);
                return (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition-colors duration-150`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatted.formattedTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.trainee_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.assessment_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="truncate max-w-xs">
                          {formatted.description}
                        </span>
                        {getSeverityBadge(log)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {log.ip_address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          formatted.severity === "high"
                            ? "bg-red-100 text-red-800"
                            : formatted.severity === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {formatted.severity}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <svg
                className="w-12 h-12 text-blue-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-blue-800 text-sm font-medium">
                No security logs found matching your criteria.
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="text-sm text-gray-600">
              Showing {pagination.per_page * (pagination.current_page - 1) + 1}{" "}
              to{" "}
              {Math.min(
                pagination.per_page * pagination.current_page,
                pagination.total
              )}{" "}
              of {pagination.total} entries
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page Numbers */}
              {Array.from(
                { length: Math.min(5, pagination.last_page) },
                (_, i) => {
                  let pageNum;
                  if (pagination.last_page <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.current_page <= 3) {
                    pageNum = i + 1;
                  } else if (
                    pagination.current_page >=
                    pagination.last_page - 2
                  ) {
                    pageNum = pagination.last_page - 4 + i;
                  } else {
                    pageNum = pagination.current_page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        pagination.current_page === pageNum
                          ? "bg-blue-600 text-white border border-blue-600"
                          : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}

              <button
                onClick={() => setCurrentPage(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
