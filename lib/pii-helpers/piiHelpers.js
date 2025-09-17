/**
 * ERIFY™ PII Redaction Helpers
 * Sanitizes OAuth logs by masking sensitive identifiers, truncating error messages,
 * and removing sensitive query parameters for security and compliance.
 */

import crypto from 'node:crypto';

// Sensitive parameters that should be removed from URLs and logs
const SENSITIVE_PARAMS = new Set([
  'access_token',
  'refresh_token',
  'id_token',
  'code',
  'state',
  'client_secret',
  'client_id',
  'password',
  'secret',
  'key',
  'token',
  'auth',
  'session',
  'cookie',
  'csrf',
  'nonce',
  'api_key',
  'authorization',
  'bearer',
  'signature',
  'private',
  'confidential'
]);

// Sensitive field patterns in JSON objects
const SENSITIVE_FIELD_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /key/i,
  /auth/i,
  /credential/i,
  /bearer/i,
  /session/i,
  /cookie/i,
  /private/i,
  /confidential/i,
  /sensitive/i
];

// Email and phone patterns
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const PHONE_PATTERN = /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
const CREDIT_CARD_PATTERN = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
const SSN_PATTERN = /\b\d{3}-?\d{2}-?\d{4}\b/g;

class PIIHelpers {
  /**
   * Mask sensitive identifiers in text
   * @param {string} text - Text to mask
   * @param {Object} options - Masking options
   * @returns {string} Masked text
   */
  static maskSensitiveData(text, options = {}) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    let maskedText = text;
    const {
      maskEmails = true,
      maskPhones = true,
      maskCreditCards = true,
      maskSSNs = true,
      maskChar = '*',
      preserveLength = false
    } = options;

    if (maskEmails) {
      maskedText = maskedText.replace(EMAIL_PATTERN, (match) => {
        if (preserveLength) {
          const [localPart, domain] = match.split('@');
          const maskedLocal = localPart.substring(0, 2) + maskChar.repeat(Math.max(0, localPart.length - 2));
          const [domainName, tld] = domain.split('.');
          const maskedDomain = domainName.substring(0, 1) + maskChar.repeat(Math.max(0, domainName.length - 1));
          return `${maskedLocal}@${maskedDomain}.${tld}`;
        }
        return `${maskChar.repeat(5)}@${maskChar.repeat(5)}.com`;
      });
    }

    if (maskPhones) {
      maskedText = maskedText.replace(PHONE_PATTERN, preserveLength ? 
        `${maskChar.repeat(3)}-${maskChar.repeat(3)}-${maskChar.repeat(4)}` : 
        `${maskChar.repeat(10)}`
      );
    }

    if (maskCreditCards) {
      maskedText = maskedText.replace(CREDIT_CARD_PATTERN, preserveLength ?
        `${maskChar.repeat(4)}-${maskChar.repeat(4)}-${maskChar.repeat(4)}-${maskChar.repeat(4)}` :
        `${maskChar.repeat(16)}`
      );
    }

    if (maskSSNs) {
      maskedText = maskedText.replace(SSN_PATTERN, preserveLength ?
        `${maskChar.repeat(3)}-${maskChar.repeat(2)}-${maskChar.repeat(4)}` :
        `${maskChar.repeat(9)}`
      );
    }

    return maskedText;
  }

  /**
   * Remove sensitive query parameters from URLs
   * @param {string} url - URL to sanitize
   * @param {Array} additionalParams - Additional parameters to remove
   * @returns {string} Sanitized URL
   */
  static sanitizeUrl(url, additionalParams = []) {
    if (!url || typeof url !== 'string') {
      return url;
    }

    try {
      const urlObj = new URL(url);
      const searchParams = urlObj.searchParams;
      
      // Remove sensitive parameters
      const allSensitiveParams = new Set([...SENSITIVE_PARAMS, ...additionalParams]);
      
      for (const param of allSensitiveParams) {
        searchParams.delete(param);
      }

      // Also check for partial matches (case insensitive)
      for (const [key] of searchParams) {
        const lowerKey = key.toLowerCase();
        for (const sensitiveParam of allSensitiveParams) {
          if (lowerKey.includes(sensitiveParam.toLowerCase())) {
            searchParams.delete(key);
            break;
          }
        }
      }

      return urlObj.toString();
    } catch (error) {
      // If URL parsing fails, try basic string replacement
      let sanitizedUrl = url;
      for (const param of SENSITIVE_PARAMS) {
        const regex = new RegExp(`[?&]${param}=[^&]*`, 'gi');
        sanitizedUrl = sanitizedUrl.replace(regex, '');
      }
      return sanitizedUrl;
    }
  }

  /**
   * Truncate error messages to prevent log bloat while preserving useful info
   * @param {string} message - Error message to truncate
   * @param {Object} options - Truncation options
   * @returns {string} Truncated message
   */
  static truncateErrorMessage(message, options = {}) {
    if (!message || typeof message !== 'string') {
      return message;
    }

    const {
      maxLength = 500,
      preserveStackTrace = false,
      includeHash = true
    } = options;

    if (message.length <= maxLength) {
      return message;
    }

    let truncated = message.substring(0, maxLength);
    
    // Try to break at word boundary
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
      truncated = truncated.substring(0, lastSpace);
    }

    let result = truncated + '... [truncated]';

    // Add hash of full message for debugging
    if (includeHash) {
      const hash = crypto.createHash('md5').update(message).digest('hex').substring(0, 8);
      result += ` (hash: ${hash})`;
    }

    // Preserve stack trace context if requested
    if (preserveStackTrace && message.includes('\n    at ')) {
      const stackMatch = message.match(/\n    at [^\n]*/);
      if (stackMatch) {
        result += '\n' + stackMatch[0];
      }
    }

    return result;
  }

  /**
   * Recursively sanitize object by masking sensitive fields
   * @param {Object} obj - Object to sanitize
   * @param {Object} options - Sanitization options
   * @returns {Object} Sanitized object
   */
  static sanitizeObject(obj, options = {}) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const {
      maxDepth = 10,
      maskValue = '[REDACTED]',
      preserveStructure = true,
      customSensitiveFields = []
    } = options;

    const sanitize = (value, depth = 0) => {
      if (depth > maxDepth) {
        return '[MAX_DEPTH_EXCEEDED]';
      }

      if (value === null || value === undefined) {
        return value;
      }

      if (Array.isArray(value)) {
        return value.map(item => sanitize(item, depth + 1));
      }

      if (typeof value === 'object') {
        const sanitized = {};
        
        for (const [key, val] of Object.entries(value)) {
          const lowerKey = key.toLowerCase();
          
          // Check if field is sensitive
          const isSensitive = SENSITIVE_FIELD_PATTERNS.some(pattern => 
            pattern.test(key)
          ) || customSensitiveFields.some(field => 
            lowerKey.includes(field.toLowerCase())
          );

          if (isSensitive) {
            sanitized[key] = preserveStructure ? 
              (typeof val === 'string' ? maskValue : '[REDACTED_OBJECT]') : 
              maskValue;
          } else if (typeof val === 'string') {
            sanitized[key] = this.maskSensitiveData(val);
          } else {
            sanitized[key] = sanitize(val, depth + 1);
          }
        }
        
        return sanitized;
      }

      if (typeof value === 'string') {
        return this.maskSensitiveData(value);
      }

      return value;
    };

    return sanitize(obj);
  }

  /**
   * Hash user identifier for privacy while maintaining correlation
   * @param {string} userId - User ID to hash
   * @param {string} salt - Optional salt for hashing
   * @returns {string} Hashed user ID
   */
  static hashUserId(userId, salt = 'erify-oauth-logs') {
    if (!userId) {
      return null;
    }

    return crypto
      .createHash('sha256')
      .update(userId.toString() + salt)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Create correlation ID for request tracing
   * @param {string} prefix - Optional prefix
   * @returns {string} Correlation ID
   */
  static generateCorrelationId(prefix = 'erify') {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Sanitize OAuth logs specifically
   * @param {Object} logData - OAuth log data
   * @returns {Object} Sanitized log data
   */
  static sanitizeOAuthLog(logData) {
    if (!logData || typeof logData !== 'object') {
      return logData;
    }

    const sanitized = { ...logData };

    // Sanitize URLs
    if (sanitized.url) {
      sanitized.url = this.sanitizeUrl(sanitized.url);
    }
    if (sanitized.redirect_uri) {
      sanitized.redirect_uri = this.sanitizeUrl(sanitized.redirect_uri);
    }
    if (sanitized.referer) {
      sanitized.referer = this.sanitizeUrl(sanitized.referer);
    }

    // Hash user identifiers
    if (sanitized.user_id) {
      sanitized.user_id = this.hashUserId(sanitized.user_id);
    }
    if (sanitized.client_id) {
      sanitized.client_id = this.hashUserId(sanitized.client_id, 'client');
    }

    // Truncate error messages
    if (sanitized.error_message) {
      sanitized.error_message = this.truncateErrorMessage(sanitized.error_message);
    }
    if (sanitized.error_description) {
      sanitized.error_description = this.truncateErrorMessage(sanitized.error_description);
    }

    // Sanitize nested objects
    sanitized.metadata = this.sanitizeObject(sanitized.metadata, {
      customSensitiveFields: ['authorization', 'bearer', 'oauth']
    });

    // Mask IP addresses (keep first 3 octets)
    if (sanitized.ip_address) {
      sanitized.ip_address = this.maskIpAddress(sanitized.ip_address);
    }

    return sanitized;
  }

  /**
   * Mask IP address for privacy (keep first 3 octets for geo data)
   * @param {string} ip - IP address to mask
   * @returns {string} Masked IP address
   */
  static maskIpAddress(ip) {
    if (!ip || typeof ip !== 'string') {
      return ip;
    }

    // IPv4
    if (ip.includes('.')) {
      const parts = ip.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
      }
    }

    // IPv6 - keep first 4 groups
    if (ip.includes(':')) {
      const parts = ip.split(':');
      if (parts.length >= 4) {
        return `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}::xxxx`;
      }
    }

    return ip;
  }

  /**
   * Validate that log data doesn't contain sensitive information
   * @param {Object} logData - Log data to validate
   * @returns {Object} Validation result
   */
  static validateLogSafety(logData) {
    const warnings = [];
    const errors = [];

    const checkForSensitiveData = (obj, path = '') => {
      if (!obj || typeof obj !== 'object') {
        return;
      }

      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        const lowerKey = key.toLowerCase();

        // Check for sensitive field names
        if (SENSITIVE_FIELD_PATTERNS.some(pattern => pattern.test(key))) {
          errors.push(`Sensitive field detected: ${currentPath}`);
        }

        if (typeof value === 'string') {
          // Check for patterns in string values
          if (EMAIL_PATTERN.test(value)) {
            warnings.push(`Email address found in: ${currentPath}`);
          }
          if (PHONE_PATTERN.test(value)) {
            warnings.push(`Phone number found in: ${currentPath}`);
          }
          if (CREDIT_CARD_PATTERN.test(value)) {
            errors.push(`Credit card number found in: ${currentPath}`);
          }
          if (SSN_PATTERN.test(value)) {
            errors.push(`SSN found in: ${currentPath}`);
          }
        }

        if (typeof value === 'object' && value !== null) {
          checkForSensitiveData(value, currentPath);
        }
      }
    };

    checkForSensitiveData(logData);

    return {
      safe: errors.length === 0,
      warnings,
      errors,
      summary: {
        warningCount: warnings.length,
        errorCount: errors.length
      }
    };
  }
}

export default PIIHelpers;