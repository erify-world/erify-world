-- ERIFY™ D1 Database Schema
-- Production-ready schema for wallet telemetry and security
-- Optimized for real-time operations and analytics

-- Telemetry events table for wallet activity tracking
CREATE TABLE IF NOT EXISTS telemetry_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    wallet_id TEXT NOT NULL,
    user_agent TEXT,
    ip_address TEXT,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data TEXT, -- JSON blob for flexible event data
    processed BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Wallet transactions table for financial operations
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id TEXT PRIMARY KEY,
    wallet_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL, -- 'credit', 'debit', 'transfer', 'purchase'
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT, -- JSON blob for additional transaction data
    reference_id TEXT, -- External reference (payment processor, etc.)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Request nonces table for anti-replay protection
CREATE TABLE IF NOT EXISTS request_nonces (
    id TEXT PRIMARY KEY,
    nonce TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Rate limiting table for security
CREATE TABLE IF NOT EXISTS rate_limits (
    ip_address TEXT NOT NULL,
    window_start INTEGER NOT NULL,
    request_count INTEGER DEFAULT 1,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (ip_address, window_start)
);

-- Wallet status tracking for analytics
CREATE TABLE IF NOT EXISTS wallet_status (
    wallet_id TEXT PRIMARY KEY,
    status TEXT DEFAULT 'active', -- 'active', 'suspended', 'closed'
    balance DECIMAL(10,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    last_activity DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- API keys and authentication tokens
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    key_hash TEXT UNIQUE NOT NULL,
    wallet_id TEXT,
    name TEXT,
    permissions TEXT, -- JSON array of allowed operations
    last_used DATETIME,
    expires_at DATETIME,
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Security events and audit log
CREATE TABLE IF NOT EXISTS security_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL, -- 'failed_auth', 'suspicious_activity', 'rate_limit_exceeded'
    ip_address TEXT,
    user_agent TEXT,
    wallet_id TEXT,
    details TEXT, -- JSON blob with event details
    severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_telemetry_wallet_timestamp ON telemetry_events(wallet_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_telemetry_event_type ON telemetry_events(event_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_processed ON telemetry_events(processed);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON wallet_transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON wallet_transactions(transaction_type);

CREATE INDEX IF NOT EXISTS idx_nonces_expires ON request_nonces(expires_at);
CREATE INDEX IF NOT EXISTS idx_nonces_nonce ON request_nonces(nonce);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_window ON rate_limits(ip_address, window_start);

CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);

-- Cleanup triggers for expired data
-- Note: D1 doesn't support stored procedures, so cleanup should be handled by scheduled workers

-- Views for common analytics queries
CREATE VIEW IF NOT EXISTS wallet_activity_summary AS
SELECT 
    wallet_id,
    COUNT(*) as total_events,
    COUNT(DISTINCT event_type) as unique_event_types,
    MIN(timestamp) as first_activity,
    MAX(timestamp) as last_activity,
    COUNT(CASE WHEN timestamp > datetime('now', '-24 hours') THEN 1 END) as events_24h,
    COUNT(CASE WHEN timestamp > datetime('now', '-7 days') THEN 1 END) as events_7d
FROM telemetry_events 
GROUP BY wallet_id;

CREATE VIEW IF NOT EXISTS transaction_summary AS
SELECT 
    wallet_id,
    COUNT(*) as total_transactions,
    SUM(CASE WHEN transaction_type = 'credit' THEN amount ELSE 0 END) as total_credits,
    SUM(CASE WHEN transaction_type = 'debit' THEN amount ELSE 0 END) as total_debits,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
    AVG(amount) as avg_transaction_amount
FROM wallet_transactions 
GROUP BY wallet_id;

CREATE VIEW IF NOT EXISTS security_summary AS
SELECT 
    DATE(timestamp) as date,
    event_type,
    severity,
    COUNT(*) as event_count
FROM security_events 
WHERE timestamp > datetime('now', '-30 days')
GROUP BY DATE(timestamp), event_type, severity
ORDER BY date DESC, event_count DESC;

-- Sample data for development/testing (comment out for production)
-- INSERT INTO wallet_status (wallet_id, status, balance, currency) VALUES 
--     ('test-wallet-001', 'active', 1000.00, 'USD'),
--     ('test-wallet-002', 'active', 2500.50, 'USD'),
--     ('test-wallet-003', 'active', 0.00, 'USD');

-- INSERT INTO telemetry_events (id, event_type, wallet_id, data) VALUES 
--     ('demo-event-1', 'wallet_created', 'test-wallet-001', '{"source": "mobile_app", "version": "1.0.0"}'),
--     ('demo-event-2', 'transaction_initiated', 'test-wallet-001', '{"amount": 50.00, "type": "purchase"}'),
--     ('demo-event-3', 'balance_checked', 'test-wallet-001', '{"balance": 950.00}');

-- Database maintenance recommendations:
-- 1. Set up scheduled cleanup for expired nonces (older than 5 minutes)
-- 2. Archive old telemetry events (older than 90 days) to separate table
-- 3. Clean up old rate_limits entries (older than 1 hour)
-- 4. Monitor table sizes and set up alerts for rapid growth
-- 5. Regular VACUUM operations to optimize performance

-- Security recommendations:
-- 1. Enable WAL mode for better concurrent access
-- 2. Set up database backups with point-in-time recovery
-- 3. Monitor for unusual patterns in security_events table
-- 4. Implement automated response to high-severity security events
-- 5. Regular security audits of database access patterns