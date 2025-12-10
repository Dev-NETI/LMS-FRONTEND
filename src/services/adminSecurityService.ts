import api from '@/lib/api';

export interface SecurityLogEntry {
  id: number;
  trainee_id: number;
  assessment_id: number;
  attempt_id?: number;
  activity: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip_address: string;
  user_agent: string;
  additional_data?: any;
  event_timestamp: string;
  created_at: string;
  updated_at: string;
  trainee?: {
    id: number;
    firstname: string;
    lastname: string;
  };
  assessment?: {
    id: number;
    title: string;
  };
}

export interface SecurityLogsResponse {
  success: boolean;
  data: SecurityLogEntry[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

/**
 * Admin Security Logs Service
 * For viewing and monitoring assessment security events
 */
class AdminSecurityService {
  /**
   * Get all security logs with pagination
   */
  async getAllSecurityLogs(page: number = 1, perPage: number = 50): Promise<SecurityLogsResponse> {
    try {
      const response = await api.get('/api/admin/security/logs', {
        params: { page, per_page: perPage }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching security logs:', error);
      throw error;
    }
  }

  /**
   * Get security logs for a specific assessment
   */
  async getAssessmentSecurityLogs(assessmentId: number): Promise<SecurityLogsResponse> {
    try {
      const response = await api.get(`/api/admin/assessments/${assessmentId}/security/logs`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessment security logs:', error);
      throw error;
    }
  }

  /**
   * Get security logs for a specific trainee
   */
  async getTraineeSecurityLogs(traineeId: number): Promise<SecurityLogsResponse> {
    try {
      const response = await api.get(`/api/admin/trainees/${traineeId}/security/logs`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trainee security logs:', error);
      throw error;
    }
  }

  /**
   * Filter security logs by activity type
   */
  filterLogsByActivity(logs: SecurityLogEntry[], activityType: string): SecurityLogEntry[] {
    return logs.filter(log => 
      log.activity.toLowerCase().includes(activityType.toLowerCase()) ||
      log.event_type.toLowerCase().includes(activityType.toLowerCase())
    );
  }

  /**
   * Get logs by severity (suspicious activities)
   */
  getSuspiciousActivities(logs: SecurityLogEntry[]): SecurityLogEntry[] {
    const suspiciousEventTypes = [
      'tab_switch',
      'right_click_blocked', 
      'shortcut_blocked',
      'fullscreen_denied',
      'window_focus_lost',
      'copy_attempt',
      'paste_attempt',
      'developer_tools',
      'multiple_tabs',
      'suspicious_activity'
    ];
    
    return logs.filter(log => 
      suspiciousEventTypes.includes(log.event_type) || 
      ['medium', 'high', 'critical'].includes(log.severity)
    );
  }

  /**
   * Get summary statistics from logs
   */
  getLogsSummary(logs: SecurityLogEntry[]): {
    totalEvents: number;
    suspiciousEvents: number;
    uniqueTrainees: number;
    uniqueAssessments: number;
    topActivities: { [activity: string]: number };
  } {
    const suspiciousEvents = this.getSuspiciousActivities(logs);
    const uniqueTrainees = new Set(logs.map(log => log.trainee_id)).size;
    const uniqueAssessments = new Set(logs.map(log => log.assessment_id)).size;
    
    const topActivities: { [activity: string]: number } = {};
    logs.forEach(log => {
      const activityType = log.activity.split(' at ')[0]; // Remove timestamp
      topActivities[activityType] = (topActivities[activityType] || 0) + 1;
    });

    return {
      totalEvents: logs.length,
      suspiciousEvents: suspiciousEvents.length,
      uniqueTrainees,
      uniqueAssessments,
      topActivities
    };
  }

  /**
   * Format log entry for display
   */
  formatLogEntry(log: SecurityLogEntry): {
    formattedTime: string;
    activityType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  } {
    const date = new Date(log.event_timestamp);
    const formattedTime = date.toLocaleString();
    
    const activityType = log.event_type.replace('_', ' ');

    return {
      formattedTime,
      activityType,
      severity: log.severity,
      description: log.activity
    };
  }
}

// Export singleton instance
export const adminSecurityService = new AdminSecurityService();

// Export class for testing or multiple instances
export { AdminSecurityService };