# ERIFY™ Logflare Dashboard Layout Configuration

This document provides dashboard layout suggestions grouped into Health, Reliability, Traffic, and Operations sections for comprehensive OAuth flow monitoring.

## Dashboard Overview

The ERIFY™ Logflare dashboard is organized into four main sections to provide comprehensive observability:

1. **🟢 Health Section** - Overall system health and availability
2. **🔵 Reliability Section** - Error rates, latency, and performance metrics  
3. **🟡 Traffic Section** - Request volume, geographic distribution, and usage patterns
4. **🟠 Operations Section** - Detailed error analysis and operational insights

---

## 🟢 Health Section

### Primary Health Metrics (Top Row)

#### 1. Overall Success Rate Gauge
- **Query**: Overall OAuth Success Rate (Last 24h)
- **Visualization**: Gauge/Speedometer
- **Thresholds**: 
  - Green: >95%
  - Yellow: 90-95%
  - Red: <90%
- **Refresh**: 1 minute

#### 2. Current Error Rate
- **Query**: OAuth Error Rate Over Time (Last 1 hour)
- **Visualization**: Single Value with trend
- **Thresholds**:
  - Green: <2%
  - Yellow: 2-5%
  - Red: >5%
- **Refresh**: 30 seconds

#### 3. Average Response Time
- **Query**: OAuth Latency Distribution Over Time (Last 1 hour)
- **Visualization**: Single Value with trend
- **Thresholds**:
  - Green: <2000ms
  - Yellow: 2000-5000ms
  - Red: >5000ms
- **Refresh**: 1 minute

#### 4. Active Sessions
- **Query**: Request Volume Trends (Last 1 hour)
- **Visualization**: Single Value
- **Description**: Current active OAuth sessions
- **Refresh**: 1 minute

### Health Trends (Second Row)

#### 5. Success Rate Trend (24h)
- **Query**: Success Rate Trend (Hourly)
- **Visualization**: Line Chart
- **Time Range**: Last 24 hours
- **Y-Axis**: Success Rate Percentage
- **Refresh**: 5 minutes

#### 6. Error Rate Heatmap
- **Query**: OAuth Error Rate Over Time (Last 24h) 
- **Visualization**: Heatmap
- **Dimensions**: Hour of day vs Error Rate
- **Refresh**: 10 minutes

---

## 🔵 Reliability Section

### Error Analysis (Top Row)

#### 7. Top Error Types
- **Query**: Top OAuth Error Types
- **Visualization**: Horizontal Bar Chart
- **Limit**: Top 10 error types
- **Refresh**: 2 minutes

#### 8. Provider Error Comparison
- **Query**: OAuth Errors by Provider
- **Visualization**: Donut Chart
- **Description**: Error distribution by OAuth provider
- **Refresh**: 2 minutes

#### 9. Stripe Error Alerts
- **Query**: Stripe Error Spike Detection
- **Visualization**: Alert Table
- **Alert Threshold**: >5 errors per minute
- **Refresh**: 30 seconds

### Performance Metrics (Second Row)

#### 10. Latency Percentiles
- **Query**: Average OAuth Latency by Provider
- **Visualization**: Multi-line Chart
- **Lines**: P50, P95, P99 latency
- **Refresh**: 2 minutes

#### 11. Slow Request Analysis
- **Query**: Slow OAuth Requests (>3 seconds)
- **Visualization**: Table
- **Columns**: Timestamp, Provider, Duration, Country
- **Refresh**: 1 minute

#### 12. Performance by Operation
- **Query**: Slowest OAuth Operations
- **Visualization**: Grouped Bar Chart
- **Grouping**: Operation type vs Duration
- **Refresh**: 5 minutes

---

## 🟡 Traffic Section

### Volume Metrics (Top Row)

#### 13. Request Volume Timeline
- **Query**: Request Volume Trends (Last 4 hours)
- **Visualization**: Area Chart
- **Y-Axis**: Requests per minute
- **Refresh**: 1 minute

#### 14. Geographic Distribution
- **Query**: OAuth Requests by Country
- **Visualization**: World Map
- **Color Scale**: Request volume
- **Refresh**: 5 minutes

#### 15. Provider Usage Distribution
- **Query**: Provider Success Rate Comparison
- **Visualization**: Stacked Bar Chart
- **Stacking**: Success vs Error counts
- **Refresh**: 2 minutes

### Traffic Analysis (Second Row)

#### 16. Peak Traffic Hours
- **Query**: Success Rate Trend (Hourly) - Last 7 days
- **Visualization**: Heatmap
- **Dimensions**: Day of week vs Hour of day
- **Refresh**: 1 hour

#### 17. Device Type Breakdown
- **Query**: Mobile vs Desktop OAuth Success Rate
- **Visualization**: Pie Chart
- **Segments**: Mobile, Desktop, Tablet
- **Refresh**: 10 minutes

#### 18. Session Distribution
- **Query**: Request Volume Trends with unique sessions
- **Visualization**: Dual-axis Line Chart
- **Primary Axis**: Total requests
- **Secondary Axis**: Unique sessions
- **Refresh**: 2 minutes

---

## 🟠 Operations Section

### Operational Insights (Top Row)

#### 19. High Error Rate Countries
- **Query**: High Error Rate Countries
- **Visualization**: Table with conditional formatting
- **Alert**: Error rate >10%
- **Refresh**: 5 minutes

#### 20. User Agent Error Analysis
- **Query**: Top User Agents for OAuth Errors
- **Visualization**: Table
- **Columns**: User Agent, Error Count, Unique Sessions
- **Refresh**: 5 minutes

#### 21. Correlation ID Lookup
- **Custom Input**: Search by correlation ID
- **Visualization**: Detailed log view
- **Purpose**: Debug specific user sessions
- **Refresh**: Manual

### Detailed Analytics (Second Row)

#### 22. Error Timeline
- **Query**: OAuth Error Rate Over Time (Last 6 hours)
- **Visualization**: Time Series with annotations
- **Annotations**: Deployment markers
- **Refresh**: 1 minute

#### 23. Provider Health Matrix
- **Query**: Provider Success Rate Comparison + Latency
- **Visualization**: Scatter Plot
- **X-Axis**: Success Rate
- **Y-Axis**: Average Latency
- **Bubble Size**: Request Volume
- **Refresh**: 5 minutes

#### 24. Recent Critical Errors
- **Query**: Recent high-impact errors (custom)
- **Visualization**: Alert Feed
- **Filters**: Critical errors only
- **Refresh**: 30 seconds

---

## Dashboard Configuration Settings

### Layout Specifications
```json
{
  "dashboard": {
    "title": "ERIFY™ OAuth Monitoring Dashboard",
    "layout": "grid",
    "columns": 3,
    "refresh_interval": "auto",
    "time_range": "last_4h",
    "theme": "dark"
  },
  "sections": [
    {
      "name": "Health",
      "color": "#28a745",
      "widgets": [1, 2, 3, 4, 5, 6]
    },
    {
      "name": "Reliability", 
      "color": "#007bff",
      "widgets": [7, 8, 9, 10, 11, 12]
    },
    {
      "name": "Traffic",
      "color": "#ffc107", 
      "widgets": [13, 14, 15, 16, 17, 18]
    },
    {
      "name": "Operations",
      "color": "#fd7e14",
      "widgets": [19, 20, 21, 22, 23, 24]
    }
  ]
}
```

### Widget Size Guidelines
- **Gauges/Single Values**: 1x1 grid
- **Charts/Graphs**: 2x1 or 2x2 grid
- **Tables**: 3x1 or 3x2 grid  
- **Maps**: 2x2 grid
- **Heatmaps**: 3x2 grid

### Color Scheme
- **Success/Healthy**: #28a745 (Green)
- **Warning**: #ffc107 (Yellow)
- **Error/Critical**: #dc3545 (Red)
- **Info**: #007bff (Blue)
- **Background**: #1a1a1a (Dark Gray)
- **Text**: #ffffff (White)

### Alert Thresholds
- **Error Rate**: >5% (Warning), >10% (Critical)
- **Latency**: >3000ms (Warning), >5000ms (Critical)  
- **Success Rate**: <95% (Warning), <90% (Critical)
- **Stripe Errors**: >5/min (Warning), >10/min (Critical)

---

## Setup Instructions

### 1. Create Dashboard Sections
1. Create new dashboard in Logflare
2. Set up four sections with the specified colors
3. Configure grid layout (3 columns)
4. Set default time range to 4 hours

### 2. Add Widgets
1. Start with Health section widgets (1-6)
2. Import saved queries for each widget
3. Configure visualizations as specified
4. Set appropriate refresh intervals
5. Repeat for other sections

### 3. Configure Alerts
1. Set up alert rules for critical metrics
2. Configure Slack/email notifications
3. Test alert thresholds
4. Document escalation procedures

### 4. Customize for Environment
1. Adjust service name filters
2. Set environment-specific thresholds
3. Add deployment annotations
4. Configure user access permissions

### 5. Maintenance Schedule
- **Daily**: Review error trends and top errors
- **Weekly**: Analyze performance trends and capacity
- **Monthly**: Update thresholds and add new metrics
- **Quarterly**: Review dashboard effectiveness and user feedback

---

## Dashboard Best Practices

### Visual Design
- Use consistent color coding across all widgets
- Maintain logical widget grouping by function
- Ensure readability at different screen sizes
- Minimize visual clutter with clean layouts

### Data Presentation
- Show trends over time where relevant
- Use appropriate chart types for data
- Include context with historical comparisons
- Highlight actionable insights

### Performance Optimization
- Set reasonable refresh intervals
- Use efficient queries with proper indexing
- Implement query result caching
- Monitor dashboard load times

### User Experience
- Provide drill-down capabilities
- Enable easy time range selection
- Support search and filtering
- Include helpful tooltips and descriptions

This dashboard configuration provides comprehensive visibility into ERIFY™ OAuth flows while maintaining operational efficiency and clarity.