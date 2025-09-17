# ERIFY™ PII Redaction Helpers

Comprehensive PII (Personally Identifiable Information) redaction utilities for ERIFY™ OAuth logs, ensuring security and compliance while maintaining operational observability.

## 🎯 Features

- **🔒 Automatic PII Detection** - Identifies emails, phones, credit cards, SSNs
- **🎭 Smart Masking** - Preserves data structure while protecting sensitive info
- **🔗 URL Sanitization** - Removes sensitive query parameters from URLs
- **📝 Error Message Truncation** - Limits exposure while preserving debugging info
- **🏷️ User ID Hashing** - Maintains correlation while protecting identity
- **✅ Log Safety Validation** - Verify logs don't contain sensitive information

## 🚀 Quick Start

```javascript
import PIIHelpers from './piiHelpers.js';

// Mask sensitive data in text
const maskedText = PIIHelpers.maskSensitiveData(
  'Contact: john.doe@company.com or call (555) 123-4567'
);
// Result: 'Contact: *****@*****.com or call ********'

// Sanitize URLs
const cleanUrl = PIIHelpers.sanitizeUrl(
  'https://api.com/oauth?access_token=secret123&state=xyz&client_id=abc'
);
// Result: 'https://api.com/oauth?state=xyz'

// Sanitize OAuth logs
const sanitizedLog = PIIHelpers.sanitizeOAuthLog({
  user_id: 'user123',
  email: 'user@example.com',
  error_message: 'Invalid grant: expired authorization code for user john@doe.com',
  url: 'https://oauth.provider.com/token?access_token=secret'
});
```

## 📚 API Reference

### `maskSensitiveData(text, options)`
Masks sensitive patterns in text while preserving readability.

**Parameters:**
- `text` (string) - Text to mask
- `options` (object) - Masking options
  - `maskEmails` (boolean) - Mask email addresses (default: true)
  - `maskPhones` (boolean) - Mask phone numbers (default: true)
  - `maskCreditCards` (boolean) - Mask credit card numbers (default: true)
  - `maskSSNs` (boolean) - Mask Social Security Numbers (default: true)
  - `maskChar` (string) - Character to use for masking (default: '*')
  - `preserveLength` (boolean) - Maintain original length (default: false)

### `sanitizeUrl(url, additionalParams)`
Removes sensitive query parameters from URLs.

**Parameters:**
- `url` (string) - URL to sanitize
- `additionalParams` (Array) - Additional parameter names to remove

### `sanitizeObject(obj, options)`
Recursively sanitizes objects by masking sensitive fields.

**Parameters:**
- `obj` (Object) - Object to sanitize
- `options` (object) - Sanitization options
  - `maxDepth` (number) - Maximum recursion depth (default: 10)
  - `maskValue` (string) - Replacement for sensitive values (default: '[REDACTED]')
  - `preserveStructure` (boolean) - Keep object structure (default: true)
  - `customSensitiveFields` (Array) - Additional sensitive field names

### `sanitizeOAuthLog(logData)`
Sanitizes OAuth-specific log data including URLs, user IDs, and error messages.

### `hashUserId(userId, salt)`
Creates a consistent hash of user ID for correlation while protecting identity.

### `validateLogSafety(logData)`
Validates that log data doesn't contain sensitive information.

## 🔧 Configuration

```javascript
// Custom sensitive parameters
const customParams = ['internal_token', 'api_secret'];
const cleanUrl = PIIHelpers.sanitizeUrl(originalUrl, customParams);

// Preserve length for consistent formatting
const maskedData = PIIHelpers.maskSensitiveData(text, { 
  preserveLength: true,
  maskChar: '•'
});

// Custom sensitive fields for objects
const sanitized = PIIHelpers.sanitizeObject(data, {
  customSensitiveFields: ['internal_id', 'private_key']
});
```

## 🛡️ Security Patterns

### Email Protection
- **Masking**: `john.doe@company.com` → `jo***@com*****.com`
- **Full masking**: `john.doe@company.com` → `*****@*****.com`

### Phone Number Protection
- **US Format**: `(555) 123-4567` → `***-***-****`
- **International**: `+1-555-123-4567` → `***********`

### Credit Card Protection
- **Standard**: `4532 1234 5678 9012` → `****-****-****-****`
- **Compact**: `4532123456789012` → `****************`

### URL Sanitization
Removes sensitive parameters:
- `access_token`, `refresh_token`, `id_token`
- `client_secret`, `client_id`, `password`
- `api_key`, `authorization`, `bearer`
- Custom parameters you specify

## 🏥 Error Handling

```javascript
// Safe error message truncation
const truncated = PIIHelpers.truncateErrorMessage(
  'Authentication failed for user john@doe.com with very long error details...',
  { 
    maxLength: 100,
    includeHash: true,
    preserveStackTrace: true
  }
);
// Result: 'Authentication failed for user *****@*****.com with very long... [truncated] (hash: a1b2c3d4)'
```

## 📋 Validation

```javascript
// Validate log safety before sending
const validation = PIIHelpers.validateLogSafety(logData);

if (!validation.safe) {
  console.error('Unsafe log data detected:', validation.errors);
  // Handle errors - don't send log
}

if (validation.warnings.length > 0) {
  console.warn('Log safety warnings:', validation.warnings);
  // Consider additional sanitization
}
```

## 🔒 Compliance Features

### GDPR Compliance
- **Right to be forgotten** - Hash user IDs for unlinkability
- **Data minimization** - Remove unnecessary sensitive data
- **Purpose limitation** - Mask data not needed for operations

### SOC 2 Compliance
- **Data classification** - Identify and protect sensitive data
- **Access controls** - Sanitize logs before external systems
- **Audit trails** - Validation and sanitization logging

### PCI DSS Compliance
- **Cardholder data protection** - Detect and mask payment card numbers
- **Sensitive authentication data** - Remove tokens and secrets
- **Network segmentation** - Clean data before crossing boundaries

## 🧪 Testing

```javascript
// Test PII detection
const testData = {
  email: 'test@example.com',
  phone: '(555) 123-4567',
  credit_card: '4532 1234 5678 9012',
  ssn: '123-45-6789'
};

const sanitized = PIIHelpers.sanitizeObject(testData);
console.log(sanitized);
// All sensitive data should be masked

// Validate safety
const validation = PIIHelpers.validateLogSafety(sanitized);
console.assert(validation.safe, 'Sanitized data should be safe');
```

## ⚠️ Important Notes

1. **Performance** - Regex operations can be expensive; use sampling for high-volume logs
2. **False Positives** - Some data may be incorrectly identified as sensitive
3. **Context Awareness** - Consider data context when applying sanitization
4. **Regular Updates** - Keep patterns updated as new sensitive data types emerge
5. **Testing** - Always test sanitization with real data patterns

## 🤝 Contributing

When adding new sanitization patterns:

1. **Add comprehensive tests** for new patterns
2. **Consider performance impact** of regex operations
3. **Document edge cases** and limitations
4. **Update validation methods** to check for new patterns
5. **Maintain backward compatibility** with existing APIs

## 📝 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**ERIFY™ PII Helpers** - Protecting privacy while maintaining observability 🛡️