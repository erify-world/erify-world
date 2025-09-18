export interface Env {
  BACKEND_BASE: string;
  ERIFY_CRON_TOKEN: string; // add via `wrangler secret put ERIFY_CRON_TOKEN`
  ENVIRONMENT: string;
  LOG_LEVEL: string;
  AUDIT_LOGGING_ENABLED: string;
  RETRY_ATTEMPTS: string;
  BATCHING_ENABLED: string;
  TASK_NAME: string;
  TASK_DESCRIPTION: string;
}

const JOBS = {
  auditLogging: { path: "/cron/audit-logging", method: "POST" },
};

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // 💎🔥 ERIFY™ Audit Logging - Luxury automation for audit transparency
    const auditLoggingEnabled = env.AUDIT_LOGGING_ENABLED === 'true';
    const batchingEnabled = env.BATCHING_ENABLED === 'true';
    const retryAttempts = parseInt(env.RETRY_ATTEMPTS || '3', 10);
    
    if (auditLoggingEnabled) {
      console.log(`🔍 ERIFY™ Audit Logging Started: ${env.TASK_NAME}`);
      console.log(`📋 Task Description: ${env.TASK_DESCRIPTION}`);
      console.log(`⚙️ Configuration: Batching=${batchingEnabled}, Retries=${retryAttempts}`);
    }

    // Process audit logging task (batching disabled for immediate processing)
    if (!batchingEnabled) {
      // Execute immediately without batching
      ctx.waitUntil(callWithRetry(env, JOBS.auditLogging, retryAttempts));
    } else {
      // Legacy batching mode (disabled per requirements)
      const tasks = [call(env, JOBS.auditLogging)];
      ctx.waitUntil(Promise.allSettled(tasks));
    }
    
    if (auditLoggingEnabled) {
      console.log(`✅ ERIFY™ Audit Logging Task Dispatched Successfully`);
    }
  },
};

async function call(env: Env, job: { path: string; method: string }) {
  const url = `${env.BACKEND_BASE}${job.path}`;
  const res = await fetch(url, {
    method: job.method,
    headers: {
      'Authorization': `Bearer ${env.ERIFY_CRON_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      source: 'cf-worker',
      task: env.TASK_NAME,
      description: env.TASK_DESCRIPTION,
      auditLogging: env.AUDIT_LOGGING_ENABLED === 'true'
    })
  });
  
  // Enhanced logging for audit purposes
  const auditLoggingEnabled = env.AUDIT_LOGGING_ENABLED === 'true';
  if (!res.ok) {
    const errorText = await res.text();
    if (auditLoggingEnabled) {
      console.log(`❌ ERIFY™ Job failed: ${job.path}`, res.status, errorText);
    }
    throw new Error(`Job failed: ${job.path} - ${res.status}: ${errorText}`);
  } else {
    if (auditLoggingEnabled) {
      console.log(`✅ ERIFY™ Job successful: ${job.path}`);
    }
  }
  return res;
}

async function callWithRetry(env: Env, job: { path: string; method: string }, maxAttempts: number) {
  const auditLoggingEnabled = env.AUDIT_LOGGING_ENABLED === 'true';
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (auditLoggingEnabled) {
        console.log(`🔄 ERIFY™ Attempt ${attempt}/${maxAttempts} for ${job.path}`);
      }
      
      return await call(env, job);
      
    } catch (error) {
      if (auditLoggingEnabled) {
        console.log(`⚠️ ERIFY™ Attempt ${attempt}/${maxAttempts} failed for ${job.path}:`, error);
      }
      
      if (attempt === maxAttempts) {
        if (auditLoggingEnabled) {
          console.log(`💥 ERIFY™ All ${maxAttempts} attempts failed for ${job.path}`);
        }
        throw error;
      }
      
      // Exponential backoff: wait 2^attempt seconds
      const waitTime = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}