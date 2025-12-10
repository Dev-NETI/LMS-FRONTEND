# Security Logs Access Guide

This document outlines how to check and monitor security logs in the LMS Assessment System.

## Overview

The LMS Assessment System implements comprehensive security logging to monitor assessment-taking activities and detect potential cheating or suspicious behavior. Security logs are automatically generated during assessment sessions and can be accessed through multiple methods.

## What Gets Logged

The security logging system tracks the following events:

### High Severity Events
- **Blocked keyboard shortcuts** (Ctrl+C, Ctrl+V, F12, etc.)
- **Right-click attempts** (context menu blocking)
- **Fullscreen denial** events

### Medium Severity Events
- **Tab switches** (when user navigates away from assessment)
- **Window focus lost** (when assessment loses focus)

### Normal Events
- **Assessment started** (when trainee begins assessment)
- **Assessment completed** (when trainee submits assessment)
- **Custom suspicious activities** (flagged by system)

Each log entry includes:
- Timestamp (ISO format)
- Trainee ID
- Assessment ID
- Attempt ID (if applicable)
- Activity description
- IP address
- User agent string

## Access Methods

### 1. Admin Web Interface

Use the `SecurityLogsViewer` React component to view logs through the admin dashboard:

```tsx
import SecurityLogsViewer from '@/components/admin/SecurityLogsViewer';

// View all security logs
<SecurityLogsViewer />

// View logs for specific assessment
<SecurityLogsViewer assessmentId={123} />

// View logs for specific trainee
<SecurityLogsViewer traineeId={456} />
```

**Features:**
- Real-time filtering by activity type
- Search by IP address or activity description
- Severity-based color coding
- Pagination for large datasets
- Summary statistics dashboard

### 2. API Endpoints

Direct API access for programmatic log retrieval:

#### Get All Security Logs
```http
GET /api/admin/security/logs?page=1&per_page=50
Authorization: Bearer {admin_token}
```

#### Get Assessment-Specific Logs
```http
GET /api/admin/assessments/{assessmentId}/security/logs
Authorization: Bearer {admin_token}
```

#### Get Trainee-Specific Logs
```http
GET /api/admin/trainees/{traineeId}/security/logs
Authorization: Bearer {admin_token}
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "trainee_id": 123,
      "assessment_id": 456,
      "attempt_id": 789,
      "activity": "tab_switch at 2024-01-15T10:30:00Z",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "event_timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 50,
    "total": 150,
    "last_page": 3
  }
}
```

### 3. Service Layer Access

Use the admin security service in your TypeScript/JavaScript code:

```typescript
import { adminSecurityService } from '@/services/adminSecurityService';

// Get paginated logs
const response = await adminSecurityService.getAllSecurityLogs(1, 100);

// Get assessment logs
const assessmentLogs = await adminSecurityService.getAssessmentSecurityLogs(123);

// Get trainee logs
const traineeLogs = await adminSecurityService.getTraineeSecurityLogs(456);

// Filter suspicious activities
const suspiciousLogs = adminSecurityService.getSuspiciousActivities(response.data);

// Get summary statistics
const summary = adminSecurityService.getLogsSummary(response.data);
```

### 4. Database Direct Access (Advanced)

For database administrators with direct access:

```sql
-- View recent security logs
SELECT * FROM security_logs 
ORDER BY created_at DESC 
LIMIT 100;

-- Count suspicious activities by trainee
SELECT trainee_id, COUNT(*) as suspicious_count
FROM security_logs 
WHERE activity LIKE '%tab_switch%' 
   OR activity LIKE '%blocked%'
   OR activity LIKE '%focus_lost%'
GROUP BY trainee_id
ORDER BY suspicious_count DESC;

-- Assessment security summary
SELECT 
  assessment_id,
  COUNT(*) as total_events,
  COUNT(CASE WHEN activity LIKE '%blocked%' THEN 1 END) as blocked_attempts,
  COUNT(CASE WHEN activity LIKE '%tab_switch%' THEN 1 END) as tab_switches
FROM security_logs 
GROUP BY assessment_id;
```

## Log Analysis Features

### Severity Classification

The system automatically classifies events by severity:

- **High**: Blocked shortcuts, right-click attempts
- **Medium**: Tab switches, window focus loss
- **Low**: Normal assessment events

### Filtering Options

Available filters in the admin interface:

- **All Events**: Show all logged activities
- **Suspicious Only**: Show high and medium severity events
- **Normal Only**: Show routine assessment events
- **Tab Switches**: Show only tab navigation events
- **Blocked Actions**: Show only blocked user attempts
- **Assessment Events**: Show start/completion events

### Summary Statistics

The system provides real-time statistics:

- Total events count
- Suspicious events count
- Unique trainees involved
- Unique assessments monitored
- Top activity types breakdown

## Security Best Practices

### For Administrators

1. **Regular Monitoring**: Check security logs daily for unusual patterns
2. **Threshold Alerts**: Set up alerts for excessive suspicious activities
3. **Investigation Process**: Establish procedures for investigating flagged activities
4. **Data Retention**: Define log retention policies per institutional requirements

### For Developers

1. **Access Control**: Ensure only authorized admin users can access logs
2. **Data Privacy**: Anonymize logs when sharing for debugging
3. **Performance**: Use pagination for large log datasets
4. **Rate Limiting**: Implement rate limiting on log API endpoints

## Troubleshooting

### Common Issues

**Q: No logs appearing for recent assessments**
- Verify security logging is enabled in assessment settings
- Check that `securityLogger.initialize()` is called properly
- Ensure API routes are properly configured

**Q: High volume of "suspicious" activities**
- Review detection sensitivity settings
- Check for legitimate user behavior patterns
- Consider adjusting severity thresholds

**Q: Performance issues with large log datasets**
- Use pagination parameters to limit results
- Implement date range filtering
- Consider archiving old logs

### Log File Locations

If using file-based logging (backup):
```
/var/log/lms/security/
├── security-{YYYY-MM-DD}.log
└── suspicious-activities-{YYYY-MM-DD}.log
```

## Integration Examples

### Custom Dashboard Integration

```typescript
// Create a custom security dashboard
const SecurityDashboard = () => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    const fetchSecurityStats = async () => {
      const logs = await adminSecurityService.getAllSecurityLogs(1, 1000);
      const summary = adminSecurityService.getLogsSummary(logs.data);
      setStats(summary);
    };
    
    fetchSecurityStats();
  }, []);
  
  return (
    <div>
      <h2>Security Overview</h2>
      <p>Suspicious Events: {stats?.suspiciousEvents}</p>
      <p>Total Events: {stats?.totalEvents}</p>
    </div>
  );
};
```

### Automated Alerting

```typescript
// Check for suspicious patterns
const checkSuspiciousPatterns = async () => {
  const logs = await adminSecurityService.getAllSecurityLogs(1, 500);
  const suspicious = adminSecurityService.getSuspiciousActivities(logs.data);
  
  // Alert if too many suspicious activities in recent timeframe
  const recentSuspicious = suspicious.filter(log => 
    new Date(log.timestamp) > new Date(Date.now() - 60 * 60 * 1000) // Last hour
  );
  
  if (recentSuspicious.length > 10) {
    // Trigger alert system
    console.warn('High suspicious activity detected!');
  }
};
```

## Support

For additional support with security logging:

1. Check the API documentation for endpoint details
2. Review the `SecurityLogsViewer` component source for UI customization
3. Examine the `adminSecurityService` for service layer integration
4. Contact the development team for custom logging requirements