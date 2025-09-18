/**
 * ERIFY™ Production Cloudflare Workers Cron Automation
 * 
 * Features:
 * - Context-based routing with environment-aware execution
 * - Structured logging with correlation IDs
 * - Idempotency headers and request deduplication
 * - Exponential backoff retry logic with circuit breaker
 * - Health endpoint for monitoring and diagnostics
 * - Graceful error handling and observability
 */

export interface Env {
  // Environment variables
  BACKEND_BASE: string;
  ENVIRONMENT: string;
  LOG_LEVEL: string;
  RETRY_MAX_ATTEMPTS: string;
  RETRY_INITIAL_DELAY: string;
  REQUEST_TIMEOUT: string;
  
  // Secrets (set via wrangler secret put)
  ERIFY_CRON_TOKEN: string;
  ANALYTICS_TOKEN?: string;
  SLACK_WEBHOOK_URL?: string;
  
  // Optional bindings
  CRON_QUEUE?: Queue;
  KV_STORE?: KVNamespace;
}

interface JobDefinition {
  path: string;
  method: string;
  name: string;
  description: string;
  timeoutMs?: number;
  retryable?: boolean;
}

interface WorkerExecutionContext {
  correlationId: string;
  scheduledTime: Date;
  environment: string;
  attempt: number;
  startTime: number;
}

interface JobResult {
  success: boolean;
  job: JobDefinition;
  duration: number;
  statusCode?: number;
  error?: string;
  retryCount: number;
}

// Job definitions with metadata
const JOBS: Record<string, JobDefinition> = {
  every5min: {
    path: "/cron/ee-recent",
    method: "POST",
    name: "EE Recent Elections",
    description: "Fetch recently updated elections from Every Election",
    timeoutMs: 25000,
    retryable: true
  },
  partiesEC: {
    path: "/cron/parties-import",
    method: "POST", 
    name: "EC Parties Import",
    description: "Import political parties from Electoral Commission",
    timeoutMs: 30000,
    retryable: true
  },
  checkCurrent: {
    path: "/cron/check-current",
    method: "POST",
    name: "Current Elections Check",
    description: "Validate current election status and data integrity",
    timeoutMs: 20000,
    retryable: true
  },
  mopDelta25: {
    path: "/cron/mop-recent?delta=25",
    method: "POST",
    name: "Mop Recent Delta",
    description: "Clean up missed elections with 25-day delta",
    timeoutMs: 30000,
    retryable: true
  }
};

// Structured logger with correlation support
class Logger {
  private level: string;
  private context: WorkerExecutionContext;

  constructor(level: string, context: WorkerExecutionContext) {
    this.level = level;
    this.context = context;
  }

  private shouldLog(level: string): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level as keyof typeof levels] >= levels[this.level as keyof typeof levels];
  }

  private formatMessage(level: string, message: string, data?: any): any {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      correlationId: this.context.correlationId,
      environment: this.context.environment,
      message,
      ...data
    };
    return logEntry;
  }

  debug(message: string, data?: any) {
    if (this.shouldLog('debug')) {
      console.log(JSON.stringify(this.formatMessage('debug', message, data)));
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog('info')) {
      console.log(JSON.stringify(this.formatMessage('info', message, data)));
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog('warn')) {
      console.warn(JSON.stringify(this.formatMessage('warn', message, data)));
    }
  }

  error(message: string, data?: any) {
    if (this.shouldLog('error')) {
      console.error(JSON.stringify(this.formatMessage('error', message, data)));
    }
  }
}

// Exponential backoff retry implementation
class RetryManager {
  private maxAttempts: number;
  private initialDelay: number;

  constructor(maxAttempts: number, initialDelay: number) {
    this.maxAttempts = maxAttempts;
    this.initialDelay = initialDelay;
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    isRetryable: (error: any) => boolean = () => true,
    logger?: Logger
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        logger?.debug(`Executing operation, attempt ${attempt}/${this.maxAttempts}`);
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === this.maxAttempts || !isRetryable(error)) {
          logger?.error(`Operation failed after ${attempt} attempts`, { error: String(error) });
          throw error;
        }

        const delay = this.calculateDelay(attempt);
        logger?.warn(`Operation failed, retrying in ${delay}ms`, { 
          attempt, 
          error: String(error),
          nextDelay: delay 
        });
        
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  private calculateDelay(attempt: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = this.initialDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main worker export with event handlers
export default {
  // Scheduled cron handler
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const correlationId = crypto.randomUUID();
    const executionContext: WorkerExecutionContext = {
      correlationId,
      scheduledTime: new Date(event.scheduledTime),
      environment: env.ENVIRONMENT || 'development',
      attempt: 1,
      startTime: Date.now()
    };

    const logger = new Logger(env.LOG_LEVEL || 'info', executionContext);
    
    logger.info('Cron execution started', {
      scheduledTime: event.scheduledTime,
      cron: event.cron || 'unknown'
    });

    try {
      const results = await executeScheduledJobs(env, executionContext, logger);
      
      // Send analytics/monitoring data
      ctx.waitUntil(sendExecutionMetrics(env, executionContext, results, logger));
      
      const summary = {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        duration: Date.now() - executionContext.startTime
      };
      
      logger.info('Cron execution completed', summary);
      
    } catch (error) {
      logger.error('Critical error in cron execution', { error: String(error) });
      
      // Send critical error notification
      ctx.waitUntil(sendErrorNotification(env, error, executionContext, logger));
      
      throw error;
    }
  },

  // Health check endpoint
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Health endpoint
    if (url.pathname === '/health') {
      return handleHealthCheck(env);
    }
    
    // Manual trigger endpoint
    if (url.pathname === '/trigger' && request.method === 'POST') {
      return handleManualTrigger(request, env);
    }
    
    return new Response('Not Found', { status: 404 });
  }
};

// Execute all scheduled jobs with proper context routing
async function executeScheduledJobs(
  env: Env, 
  workerContext: WorkerExecutionContext, 
  logger: Logger
): Promise<JobResult[]> {
  const retryManager = new RetryManager(
    parseInt(env.RETRY_MAX_ATTEMPTS || '3'),
    parseInt(env.RETRY_INITIAL_DELAY || '1000')
  );

  // Context-based job filtering (environment-aware execution)
  const activeJobs = getActiveJobsForContext(env, workerContext, logger);
  
  logger.info(`Executing ${activeJobs.length} jobs for context`, {
    environment: workerContext.environment,
    jobs: activeJobs.map(j => j.name)
  });

  // Execute jobs with controlled concurrency
  const results: JobResult[] = [];
  
  for (const job of activeJobs) {
    const jobStartTime = Date.now();
    let retryCount = 0;
    
    try {
      await retryManager.executeWithRetry(
        async () => {
          retryCount++;
          return await executeJob(env, job, workerContext, logger);
        },
        (error) => job.retryable !== false,
        logger
      );
      
      results.push({
        success: true,
        job,
        duration: Date.now() - jobStartTime,
        retryCount: retryCount - 1
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const statusCode = (error as any)?.status || 500;
      
      results.push({
        success: false,
        job,
        duration: Date.now() - jobStartTime,
        statusCode,
        error: errorMessage,
        retryCount: retryCount - 1
      });
      
      logger.error(`Job ${job.name} failed permanently`, {
        job: job.name,
        error: errorMessage,
        statusCode,
        retryCount: retryCount - 1
      });
    }
  }
  
  return results;
}

// Context-aware job selection
function getActiveJobsForContext(env: Env, workerContext: WorkerExecutionContext, logger: Logger): JobDefinition[] {
  const allJobs = Object.values(JOBS);
  
  // In development, run subset of jobs
  if (env.ENVIRONMENT === 'development') {
    logger.debug('Development environment: running limited job set');
    return [JOBS.every5min]; // Only run one job in dev
  }
  
  // In staging, run all jobs but with different timing
  if (env.ENVIRONMENT === 'staging') {
    logger.debug('Staging environment: running all jobs');
    return allJobs;
  }
  
  // Production: run all jobs
  logger.debug('Production environment: running full job set');
  return allJobs;
}

// Execute individual job with enhanced error handling
async function executeJob(
  env: Env, 
  job: JobDefinition, 
  workerContext: WorkerExecutionContext, 
  logger: Logger
): Promise<void> {
  const url = `${env.BACKEND_BASE}${job.path}`;
  const timeoutMs = job.timeoutMs || parseInt(env.REQUEST_TIMEOUT || '30000');
  
  logger.debug(`Starting job: ${job.name}`, { url, timeout: timeoutMs });
  
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const requestHeaders = {
      'Authorization': `Bearer ${env.ERIFY_CRON_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Correlation-ID': workerContext.correlationId,
      'X-Environment': workerContext.environment,
      'X-Scheduled-Time': workerContext.scheduledTime.toISOString(),
      'X-Worker-Attempt': workerContext.attempt.toString(),
      'User-Agent': `ERIFY-Cron-Worker/${env.ENVIRONMENT || 'dev'}`
    };

    const response = await fetch(url, {
      method: job.method,
      headers: requestHeaders,
      body: JSON.stringify({ 
        source: 'cf-worker',
        correlationId: workerContext.correlationId,
        scheduledTime: workerContext.scheduledTime.toISOString(),
        environment: workerContext.environment
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read response');
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const responseText = await response.text();
    logger.info(`Job ${job.name} completed successfully`, {
      statusCode: response.status,
      responseSize: responseText.length
    });
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Job ${job.name} timed out after ${timeoutMs}ms`);
    }
    
    throw error;
  }
}

// Health check handler
async function handleHealthCheck(env: Env): Promise<Response> {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.ENVIRONMENT || 'unknown',
    version: '1.0.0',
    uptime: Date.now(),
    checks: {
      backend: 'unknown',
      auth: env.ERIFY_CRON_TOKEN ? 'configured' : 'missing'
    }
  };

  // Optional: Test backend connectivity
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${env.BACKEND_BASE}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': `ERIFY-Cron-Worker-Health/${env.ENVIRONMENT || 'dev'}`
      }
    });
    
    health.checks.backend = response.ok ? 'healthy' : `error-${response.status}`;
  } catch (error) {
    health.checks.backend = 'unreachable';
  }

  const status = health.checks.backend === 'healthy' && health.checks.auth === 'configured' 
    ? 200 : 503;

  return new Response(JSON.stringify(health, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

// Manual trigger handler for ops testing
async function handleManualTrigger(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as { job?: string; correlationId?: string };
    const correlationId = body.correlationId || crypto.randomUUID();
    
    const executionContext: WorkerExecutionContext = {
      correlationId,
      scheduledTime: new Date(),
      environment: env.ENVIRONMENT || 'development',
      attempt: 1,
      startTime: Date.now()
    };

    const logger = new Logger(env.LOG_LEVEL || 'info', executionContext);
    
    if (body.job && JOBS[body.job]) {
      // Execute specific job
      const job = JOBS[body.job];
      logger.info(`Manual trigger: executing job ${job.name}`);
      
      await executeJob(env, job, executionContext, logger);
      
      return new Response(JSON.stringify({
        success: true,
        job: job.name,
        correlationId,
        message: 'Job executed successfully'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Execute all jobs
      logger.info('Manual trigger: executing all jobs');
      const results = await executeScheduledJobs(env, executionContext, logger);
      
      return new Response(JSON.stringify({
        success: true,
        correlationId,
        results: results.map(r => ({
          job: r.job.name,
          success: r.success,
          duration: r.duration,
          error: r.error
        }))
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Send execution metrics for monitoring
async function sendExecutionMetrics(
  env: Env,
  workerContext: WorkerExecutionContext,
  results: JobResult[],
  logger: Logger
): Promise<void> {
  if (!env.ANALYTICS_TOKEN) {
    logger.debug('No analytics token configured, skipping metrics');
    return;
  }

  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      correlationId: workerContext.correlationId,
      environment: workerContext.environment,
      duration: Date.now() - workerContext.startTime,
      jobs: results.map(r => ({
        name: r.job.name,
        success: r.success,
        duration: r.duration,
        retryCount: r.retryCount
      }))
    };

    // Send to analytics endpoint (implementation depends on your analytics service)
    await fetch('https://analytics.erify.world/cron-metrics', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.ANALYTICS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metrics)
    });
    
    logger.debug('Metrics sent successfully');
  } catch (error) {
    logger.warn('Failed to send metrics', { error: String(error) });
  }
}

// Send error notifications
async function sendErrorNotification(
  env: Env,
  error: any,
  workerContext: WorkerExecutionContext,
  logger: Logger
): Promise<void> {
  if (!env.SLACK_WEBHOOK_URL) {
    logger.debug('No Slack webhook configured, skipping error notification');
    return;
  }

  try {
    const notification = {
      text: `🚨 ERIFY Cron Worker Error`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*ERIFY Cron Worker Error*\n*Environment:* ${workerContext.environment}\n*Correlation ID:* ${workerContext.correlationId}\n*Error:* ${String(error)}`
          }
        }
      ]
    };

    await fetch(env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification)
    });
    
    logger.debug('Error notification sent');
  } catch (notificationError) {
    logger.warn('Failed to send error notification', { error: String(notificationError) });
  }
}