import api from '@/lib/api';

export interface SecurityLogData {
  activity: string;
  timestamp: string;
  attempt_id?: number;
}

export interface SecurityEventTypes {
  TAB_SWITCH: 'tab_switch';
  RIGHT_CLICK_BLOCKED: 'right_click_blocked';
  SHORTCUT_BLOCKED: 'shortcut_blocked';
  FULLSCREEN_DENIED: 'fullscreen_denied';
  WINDOW_FOCUS_LOST: 'window_focus_lost';
  ASSESSMENT_STARTED: 'assessment_started';
  ASSESSMENT_COMPLETED: 'assessment_completed';
  SUSPICIOUS_ACTIVITY: 'suspicious_activity';
}

export const SECURITY_EVENTS: SecurityEventTypes = {
  TAB_SWITCH: 'tab_switch',
  RIGHT_CLICK_BLOCKED: 'right_click_blocked',
  SHORTCUT_BLOCKED: 'shortcut_blocked',
  FULLSCREEN_DENIED: 'fullscreen_denied',
  WINDOW_FOCUS_LOST: 'window_focus_lost',
  ASSESSMENT_STARTED: 'assessment_started',
  ASSESSMENT_COMPLETED: 'assessment_completed',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
};

class SecurityLoggingService {
  private assessmentId: number | null = null;
  private attemptId: number | null = null;
  private isEnabled: boolean = true;

  /**
   * Initialize the security logging service with assessment and attempt IDs
   */
  initialize(assessmentId: number, attemptId?: number): void {
    this.assessmentId = assessmentId;
    this.attemptId = attemptId || null;
    this.isEnabled = true;
  }

  /**
   * Enable or disable security logging
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Log a security event with automatic timestamp
   */
  async logEvent(activity: string, additionalData?: any): Promise<void> {
    if (!this.isEnabled || !this.assessmentId) {
      console.warn('Security logging not initialized or disabled');
      return;
    }

    try {
      const logData: SecurityLogData = {
        activity,
        timestamp: new Date().toISOString(),
        attempt_id: this.attemptId || undefined,
        ...additionalData
      };

      await api.post(`/api/trainee/assessments/${this.assessmentId}/security-log`, logData);
      console.log(`Security event logged: ${activity}`);
    } catch (err) {
      console.error('Failed to log security event:', err);
      // Don't throw error to avoid breaking assessment flow
    }
  }

  /**
   * Log tab switch event
   */
  async logTabSwitch(): Promise<void> {
    await this.logEvent(`${SECURITY_EVENTS.TAB_SWITCH} at ${new Date().toISOString()}`);
  }

  /**
   * Log blocked right-click attempt
   */
  async logRightClickBlocked(): Promise<void> {
    await this.logEvent(`${SECURITY_EVENTS.RIGHT_CLICK_BLOCKED} at ${new Date().toISOString()}`);
  }

  /**
   * Log blocked keyboard shortcut
   */
  async logShortcutBlocked(shortcut: string): Promise<void> {
    await this.logEvent(`${SECURITY_EVENTS.SHORTCUT_BLOCKED}: ${shortcut} at ${new Date().toISOString()}`);
  }

  /**
   * Log fullscreen denied
   */
  async logFullscreenDenied(): Promise<void> {
    await this.logEvent(`${SECURITY_EVENTS.FULLSCREEN_DENIED} at ${new Date().toISOString()}`);
  }

  /**
   * Log window focus lost
   */
  async logWindowFocusLost(): Promise<void> {
    await this.logEvent(`${SECURITY_EVENTS.WINDOW_FOCUS_LOST} at ${new Date().toISOString()}`);
  }

  /**
   * Log assessment start
   */
  async logAssessmentStarted(): Promise<void> {
    await this.logEvent(`${SECURITY_EVENTS.ASSESSMENT_STARTED} at ${new Date().toISOString()}`);
  }

  /**
   * Log assessment completion with summary
   */
  async logAssessmentCompleted(summary: {
    tabSwitches: number;
    suspiciousActivities: number;
    completionTime: number;
  }): Promise<void> {
    await this.logEvent(
      `${SECURITY_EVENTS.ASSESSMENT_COMPLETED} - Tab switches: ${summary.tabSwitches}, Suspicious activities: ${summary.suspiciousActivities}, Completion time: ${summary.completionTime}ms`,
      summary
    );
  }

  /**
   * Log custom suspicious activity
   */
  async logSuspiciousActivity(activity: string, details?: any): Promise<void> {
    await this.logEvent(`${SECURITY_EVENTS.SUSPICIOUS_ACTIVITY}: ${activity}`, details);
  }

  /**
   * Bulk log multiple events
   */
  async logBulkEvents(events: Array<{ activity: string; additionalData?: any }>): Promise<void> {
    const promises = events.map(event => this.logEvent(event.activity, event.additionalData));
    await Promise.allSettled(promises); // Use allSettled to not fail if one log fails
  }

  /**
   * Reset the service (clear assessment/attempt IDs)
   */
  reset(): void {
    this.assessmentId = null;
    this.attemptId = null;
    this.isEnabled = false;
  }

  /**
   * Get current configuration
   */
  getConfig(): { assessmentId: number | null; attemptId: number | null; isEnabled: boolean } {
    return {
      assessmentId: this.assessmentId,
      attemptId: this.attemptId,
      isEnabled: this.isEnabled
    };
  }
}

// Export singleton instance
export const securityLogger = new SecurityLoggingService();

// Export the service class for testing or multiple instances
export { SecurityLoggingService };

// Convenience export for direct function access
export const logSecurityEvent = (activity: string, additionalData?: any) => 
  securityLogger.logEvent(activity, additionalData);