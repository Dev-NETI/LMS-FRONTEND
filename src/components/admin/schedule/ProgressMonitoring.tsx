"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@mui/material";
import {
  ChartBarIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface TraineeProgress {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  overallProgress: number;
  modules: ModuleProgress[];
  lastActivity: string;
  status: "On Track" | "Behind" | "At Risk" | "Completed";
  timeSpent: number; // in hours
  completedAssignments: number;
  totalAssignments: number;
}

interface ModuleProgress {
  id: number;
  name: string;
  progress: number;
  status: "Not Started" | "In Progress" | "Completed" | "Overdue";
  dueDate: string;
  timeSpent: number;
}

interface ProgressMonitoringProps {
  scheduleId: number;
}

export default function ProgressMonitoring({ scheduleId }: ProgressMonitoringProps) {
  const [trainees, setTrainees] = useState<TraineeProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedTrainee, setSelectedTrainee] = useState<TraineeProgress | null>(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      setIsLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockTrainees: TraineeProgress[] = [
          {
            id: 1,
            name: "John Doe",
            email: "john.doe@maritime.com",
            overallProgress: 85,
            lastActivity: "2024-11-27T14:30:00Z",
            status: "On Track",
            timeSpent: 42.5,
            completedAssignments: 8,
            totalAssignments: 10,
            modules: [
              {
                id: 1,
                name: "Safety Fundamentals",
                progress: 100,
                status: "Completed",
                dueDate: "2024-11-20T23:59:59Z",
                timeSpent: 12.5,
              },
              {
                id: 2,
                name: "Emergency Procedures",
                progress: 75,
                status: "In Progress",
                dueDate: "2024-11-30T23:59:59Z",
                timeSpent: 18.0,
              },
              {
                id: 3,
                name: "Navigation Basics",
                progress: 60,
                status: "In Progress",
                dueDate: "2024-12-05T23:59:59Z",
                timeSpent: 12.0,
              },
            ],
          },
          {
            id: 2,
            name: "Sarah Johnson",
            email: "sarah.j@shipping.com",
            overallProgress: 95,
            lastActivity: "2024-11-27T16:45:00Z",
            status: "On Track",
            timeSpent: 48.0,
            completedAssignments: 9,
            totalAssignments: 10,
            modules: [
              {
                id: 1,
                name: "Safety Fundamentals",
                progress: 100,
                status: "Completed",
                dueDate: "2024-11-20T23:59:59Z",
                timeSpent: 10.5,
              },
              {
                id: 2,
                name: "Emergency Procedures",
                progress: 90,
                status: "In Progress",
                dueDate: "2024-11-30T23:59:59Z",
                timeSpent: 22.0,
              },
              {
                id: 3,
                name: "Navigation Basics",
                progress: 85,
                status: "In Progress",
                dueDate: "2024-12-05T23:59:59Z",
                timeSpent: 15.5,
              },
            ],
          },
          {
            id: 3,
            name: "Mike Wilson",
            email: "m.wilson@oceanline.com",
            overallProgress: 45,
            lastActivity: "2024-11-25T08:20:00Z",
            status: "Behind",
            timeSpent: 28.0,
            completedAssignments: 4,
            totalAssignments: 10,
            modules: [
              {
                id: 1,
                name: "Safety Fundamentals",
                progress: 80,
                status: "In Progress",
                dueDate: "2024-11-20T23:59:59Z",
                timeSpent: 15.0,
              },
              {
                id: 2,
                name: "Emergency Procedures",
                progress: 30,
                status: "Behind",
                dueDate: "2024-11-30T23:59:59Z",
                timeSpent: 8.0,
              },
              {
                id: 3,
                name: "Navigation Basics",
                progress: 0,
                status: "Not Started",
                dueDate: "2024-12-05T23:59:59Z",
                timeSpent: 0,
              },
            ],
          },
        ];

        await new Promise(resolve => setTimeout(resolve, 1000));
        setTrainees(mockTrainees);
      } catch (error) {
        console.error("Failed to fetch progress data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgressData();
  }, [scheduleId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "On Track":
        return "bg-green-100 text-green-800";
      case "Behind":
        return "bg-yellow-100 text-yellow-800";
      case "At Risk":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-yellow-500";
    if (progress >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const filteredTrainees = trainees.filter(trainee => {
    const matchesSearch = trainee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trainee.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || trainee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton variant="text" width={80} height={32} sx={{ mt: 1 }} />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b">
            <Skeleton variant="text" width={200} height={24} />
          </div>
          <div className="divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton variant="circular" width={40} height={40} />
                    <div>
                      <Skeleton variant="text" width={150} height={20} />
                      <Skeleton variant="text" width={100} height={16} />
                    </div>
                  </div>
                  <Skeleton variant="rectangular" width={100} height={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">On Track</p>
              <p className="text-2xl font-bold text-gray-900">
                {trainees.filter(t => t.status === "On Track").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Behind</p>
              <p className="text-2xl font-bold text-gray-900">
                {trainees.filter(t => t.status === "Behind").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">At Risk</p>
              <p className="text-2xl font-bold text-gray-900">
                {trainees.filter(t => t.status === "At Risk").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <AcademicCapIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(trainees.reduce((acc, t) => acc + t.overallProgress, 0) / trainees.length)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trainees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All Status</option>
            <option value="On Track">On Track</option>
            <option value="Behind">Behind</option>
            <option value="At Risk">At Risk</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Trainees Progress Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Trainee Progress</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trainee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrainees.map((trainee) => (
                <tr key={trainee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {trainee.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {trainee.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {trainee.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(trainee.overallProgress)}`}
                          style={{ width: `${trainee.overallProgress}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {trainee.overallProgress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {trainee.completedAssignments}/{trainee.totalAssignments}
                    </div>
                    <div className="text-sm text-gray-500">
                      {Math.round((trainee.completedAssignments / trainee.totalAssignments) * 100)}% complete
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trainee.timeSpent}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trainee.status)}`}>
                      {trainee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(trainee.lastActivity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTrainee(trainee)}
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Progress Modal/Panel */}
      {selectedTrainee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedTrainee.name} - Detailed Progress
                </h3>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTrainee(null)}
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedTrainee.overallProgress}%
                  </div>
                  <div className="text-sm text-gray-500">Overall Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedTrainee.timeSpent}h
                  </div>
                  <div className="text-sm text-gray-500">Time Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedTrainee.completedAssignments}/{selectedTrainee.totalAssignments}
                  </div>
                  <div className="text-sm text-gray-500">Assignments</div>
                </div>
              </div>

              <h4 className="text-lg font-medium text-gray-900 mb-4">Module Progress</h4>
              <div className="space-y-4">
                {selectedTrainee.modules.map((module) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{module.name}</h5>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(module.status)}`}>
                        {module.status}
                      </span>
                    </div>
                    <div className="flex items-center mb-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(module.progress)}`}
                          style={{ width: `${module.progress}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {module.progress}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Time spent: {module.timeSpent}h</span>
                      <span>Due: {formatDate(module.dueDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredTrainees.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trainees found</h3>
          <p className="text-gray-600">
            {searchQuery || statusFilter !== "All"
              ? "Try adjusting your filters to see more results."
              : "No trainees are enrolled in this schedule yet."}
          </p>
        </div>
      )}
    </div>
  );
}