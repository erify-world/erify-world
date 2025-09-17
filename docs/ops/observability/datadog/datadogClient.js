/**
 * ERIFY™ Datadog Client
 * Non-blocking, sampled log streaming to Datadog for observability
 */

import crypto from 'node:crypto';

class DatadogClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.DATADOG_API_KEY;
    this.hostname = options.hostname || process.env.HOSTNAME || 'erify-service';
    this.service = options.service || 'erify-oauth';
    this.environment = options.environment || process.env.NODE_ENV || 'production';
    this.sampleRate = options.sampleRate || 0.1; // 10% sampling by default
    this.endpoint = options.endpoint || 'https://http-intake.logs.datadoghq.com/v1/input';
    this.enabled = options.enabled !== false && !!this.apiKey;
    this.maxBatchSize = options.maxBatchSize || 100;
    this.flushInterval = options.flushInterval || 5000; // 5 seconds
    
    this.logBuffer = [];
    this.flushTimer = null;
    
    if (this.enabled) {
      this.startPeriodicFlush();
    }
  }

  /**
   * Log OAuth-related events with structured data
   * @param {string} level - Log level (info, warn, error, debug)
   * @param {string} message - Log message
   * @param {Object} metadata - Additional structured data
   */
  log(level, message, metadata = {}) {
    if (!this.enabled || !this.shouldSample()) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      hostname: this.hostname,
      service: this.service,
      environment: this.environment,
      source: 'nodejs',
      ...metadata,
      // Add correlation ID for tracing
      correlation_id: metadata.correlation_id || this.generateCorrelationId(),
      // OAuth-specific tags
      tags: {
        oauth_flow: metadata.oauth_flow || 'unknown',
        provider: metadata.provider || 'unknown',
        user_agent: metadata.user_agent,
        geo_country: metadata.geo_country,
        ...metadata.tags
      }
    };

    this.addToBuffer(logEntry);
  }

  /**
   * Log OAuth success events
   */
  logOAuthSuccess(metadata = {}) {
    this.log('info', 'OAuth authentication successful', {
      event_type: 'oauth_success',
      oauth_flow: metadata.flow,
      provider: metadata.provider,
      user_id: metadata.user_id ? this.hashUserId(metadata.user_id) : null,
      duration_ms: metadata.duration_ms,
      geo_country: metadata.geo_country,
      user_agent: metadata.user_agent,
      ...metadata
    });
  }

  /**
   * Log OAuth error events
   */
  logOAuthError(error, metadata = {}) {
    this.log('error', 'OAuth authentication failed', {
      event_type: 'oauth_error',
      error_type: error.type || 'unknown',
      error_code: error.code,
      error_message: this.truncateErrorMessage(error.message),
      oauth_flow: metadata.flow,
      provider: metadata.provider,
      user_id: metadata.user_id ? this.hashUserId(metadata.user_id) : null,
      geo_country: metadata.geo_country,
      user_agent: metadata.user_agent,
      stack_trace: error.stack ? this.truncateErrorMessage(error.stack) : null,
      ...metadata
    });
  }

  /**
   * Log Stripe-related errors for alerting
   */
  logStripeError(error, metadata = {}) {
    this.log('error', 'Stripe payment error', {
      event_type: 'stripe_error',
      error_type: error.type || 'unknown',
      error_code: error.code,
      error_message: this.truncateErrorMessage(error.message),
      charge_id: metadata.charge_id,
      customer_id: metadata.customer_id ? this.hashUserId(metadata.customer_id) : null,
      amount: metadata.amount,
      currency: metadata.currency,
      ...metadata
    });
  }

  /**
   * Log performance metrics
   */
  logPerformance(operation, durationMs, metadata = {}) {
    this.log('info', `Performance metric: ${operation}`, {
      event_type: 'performance',
      operation,
      duration_ms: durationMs,
      ...metadata
    });
  }

  /**
   * Check if log should be sampled
   */
  shouldSample() {
    return Math.random() < this.sampleRate;
  }

  /**
   * Generate correlation ID for request tracing
   */
  generateCorrelationId() {
    return crypto.randomBytes(8).toString('hex');
  }

  /**
   * Hash user ID for privacy
   */
  hashUserId(userId) {
    return crypto.createHash('sha256').update(userId.toString()).digest('hex').substring(0, 16);
  }

  /**
   * Truncate error messages to prevent log bloat
   */
  truncateErrorMessage(message, maxLength = 500) {
    if (!message || message.length <= maxLength) {
      return message;
    }
    return message.substring(0, maxLength) + '... [truncated]';
  }

  /**
   * Add log entry to buffer
   */
  addToBuffer(logEntry) {
    this.logBuffer.push(logEntry);
    
    if (this.logBuffer.length >= this.maxBatchSize) {
      this.flush();
    }
  }

  /**
   * Start periodic flush of log buffer
   */
  startPeriodicFlush() {
    this.flushTimer = setInterval(() => {
      if (this.logBuffer.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  /**
   * Flush log buffer to Datadog (non-blocking)
   */
  async flush() {
    if (this.logBuffer.length === 0) {
      return;
    }

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      // Non-blocking fire-and-forget approach
      this.sendToDatadog(logsToSend).catch(error => {
        // Silently handle errors to prevent blocking application
        if (process.env.NODE_ENV === 'development') {
          console.warn('Datadog logging failed:', error.message);
        }
      });
    } catch (error) {
      // Silently handle errors
      if (process.env.NODE_ENV === 'development') {
        console.warn('Datadog logging error:', error.message);
      }
    }
  }

  /**
   * Send logs to Datadog HTTP endpoint
   */
  async sendToDatadog(logs) {
    const payload = logs.map(log => JSON.stringify(log)).join('\n');
    
    const response = await fetch(`${this.endpoint}/${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': this.apiKey
      },
      body: payload,
      // Set timeout to prevent hanging
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`Datadog API error: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Clean shutdown - flush remaining logs
   */
  async shutdown() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.logBuffer.length > 0) {
      await this.flush();
    }
  }
}

// Export singleton instance for easy use
export const datadogClient = new DatadogClient();

export default DatadogClient;