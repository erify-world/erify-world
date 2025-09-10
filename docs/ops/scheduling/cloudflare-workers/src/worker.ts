export interface Env {
  BACKEND_BASE: string;
  ERIFY_CRON_TOKEN: string; // add via `wrangler secret put ERIFY_CRON_TOKEN`
}

const JOBS = {
  every5min: { path: "/cron/ee-recent", method: "POST" },
  partiesEC: { path: "/cron/parties-import", method: "POST" },
  checkCurrent: { path: "/cron/check-current", method: "POST" },
  mopDelta25: { path: "/cron/mop-recent?delta=25", method: "POST" }
};

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const minute = new Date(event.scheduledTime).getUTCMinutes();

    // Route by cron expression (Cloudflare triggers above define cadence)
    // We can try all, but keep each idempotent server-side.

    const tasks = [
      call(env, JOBS.every5min),
      call(env, JOBS.partiesEC),
      call(env, JOBS.checkCurrent),
      call(env, JOBS.mopDelta25),
    ];

    // Fire and forget; rely on server to skip when not due
    ctx.waitUntil(Promise.allSettled(tasks));
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
    body: JSON.stringify({ source: 'cf-worker' })
  });
  // Optional: send logs to Logpush or Workers Analytics Engine
  if (!res.ok) {
    console.log(`Job failed: ${job.path}`, res.status, await res.text());
  } else {
    console.log(`Job ok: ${job.path}`);
  }
}