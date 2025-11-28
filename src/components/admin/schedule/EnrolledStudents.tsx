"use client";

import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@mui/material";
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  UserIcon,
  CheckBadgeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon as CheckBadgeSolidIcon } from "@heroicons/react/24/solid";
import { EnrolledStudent } from "@/src/services/scheduleService";
interface EnrolledStudentsProps {
  students: EnrolledStudent[];
  isLoading?: boolean;
}

export default function EnrolledStudents({
  students,
  isLoading = false,
}: EnrolledStudentsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  // Debug log to see the data structure
  React.useEffect(() => {
    if (students && students.length > 0) {
      console.log("Enrolled Students Data:", students);
      console.log(
        "First student status type:",
        typeof students[0].status,
        students[0].status
      );
    }
  }, [students]);

  const getStatusIcon = (status: string | any) => {
    const statusStr = String(status).toLowerCase();
    switch (statusStr) {
      case "enrolled":
        return <CheckBadgeSolidIcon className="w-5 h-5 text-green-600" />;
      case "pending":
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case "suspended":
      case "inactive":
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <UserIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string | any) => {
    const statusStr = String(status).toLowerCase();
    switch (statusStr) {
      case "enrolled":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter and sort students
  const filteredStudents = students
    .filter((student) => {
      const matchesSearch = student.trainee_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (typeof student.status === "string" &&
          student.status.toLowerCase() === statusFilter.toLowerCase());
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.trainee_name.localeCompare(b.trainee_name);
        case "date":
          return (
            new Date(b.date_confirmed).getTime() -
            new Date(a.date_confirmed).getTime()
          );
        case "status":
          return String(a.status).localeCompare(String(b.status));
        default:
          return 0;
      }
    });

  const statusCounts = {
    all: students.length,
    active: students.filter(
      (s) =>
        typeof s.status === "string" && s.status.toLowerCase() === "enrolled"
    ).length,
    pending: students.filter(
      (s) =>
        typeof s.status === "string" && s.status.toLowerCase() === "pending"
    ).length,
  };

  const handleExportCSV = () => {
    const csvContent = [
      [
        "Name",
        "Email",
        "Phone",
        "Rank",
        "Position",
        "Status",
        "Date Confirmed",
      ].join(","),
      ...filteredStudents.map((student) =>
        [
          student.trainee_name,
          student.email || "N/A",
          student.phone || "N/A",
          student.rank || "N/A",
          student.status,
          formatDate(student.date_confirmed),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enrolled-students.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="rectangular" width={120} height={36} />
        </div>

        <div className="flex gap-4">
          <Skeleton variant="rectangular" width={300} height={40} />
          <Skeleton variant="rectangular" width={150} height={40} />
          <Skeleton variant="rectangular" width={120} height={40} />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <th key={index} className="px-6 py-3">
                      <Skeleton variant="text" width={80} height={16} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.from({ length: 8 }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {Array.from({ length: 6 }).map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        <Skeleton
                          variant="text"
                          width={colIndex === 0 ? 120 : 80}
                          height={16}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Enrolled Students
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage and view all students enrolled in this training schedule
          </p>
        </div>
        <Button onClick={handleExportCSV} className="flex items-center">
          <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Total Students
              </p>
              <p className="text-xl font-bold text-gray-900">
                {statusCounts.all}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckBadgeIcon className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-xl font-bold text-gray-900">
                {statusCounts.active}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">
                {statusCounts.pending}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="enrolled">Enrolled</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trainee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department/Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Confirmed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.enrollment_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {student.trainee_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.trainee_name}
                        </div>
                        <div className="text-sm text-gray-500 italic">
                          Trainee ID: {student.trainee_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {student.email && (
                        <div className="flex items-center mb-1">
                          <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
                          {student.email}
                        </div>
                      )}
                      {student.contact_num && (
                        <div className="flex items-center">
                          <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                          {student.contact_num}
                        </div>
                      )}
                      {!student.email && !student.phone && (
                        <span className="text-gray-500">No contact info</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>{student.rankacronym || "N/A"}</div>
                      <div className="text-gray-500">
                        {student.rank || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(student.status)}
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          student.status
                        )}`}
                      >
                        {student.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                      {formatDate(student.date_confirmed)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        title="View Profile"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        title="Send Message"
                        disabled={!student.email}
                      >
                        <EnvelopeIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== "all"
                ? "No students found"
                : "No enrolled students"}
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No students have enrolled in this training schedule yet."}
            </p>
          </div>
        )}

        {/* Results Summary */}
        {filteredStudents.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              Showing {filteredStudents.length} of {students.length} students
              {searchTerm && ` matching "${searchTerm}"`}
              {statusFilter !== "all" && ` with ${statusFilter} status`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
