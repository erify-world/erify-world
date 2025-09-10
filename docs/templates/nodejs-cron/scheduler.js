import cron from 'node-cron';
import { execa } from 'execa';
import lockfile from 'proper-lockfile';
import pino from 'pino';
import fs from 'node:fs';
import path from 'node:path';

const log = pino({ level: process.env.LOG_LEVEL || 'info' });

// --- ENV / Paths (edit to your stack) ---
const PROJECT_ROOT = process.env.PROJECT_ROOT || '/var/www/ynr';
const PYTHON = path.join(PROJECT_ROOT, 'env/bin/python');
const MANAGE = path.join(PROJECT_ROOT, 'code/manage.py');
const USE_NICE = process.env.USE_NICE === '1'; // emulate nice/ionice
const MAILTO = process.env.MAILTO || ''; // optional (for log routing)

// helper to run commands (with optional nice/ionice)
async function runManage(cmdArgs, { nice = false, flockKey = null } = {}) {
  const base = [MANAGE, ...cmdArgs];
  const args = (nice && USE_NICE) ? ['-n','19','ionice','-c','3', PYTHON, ...base] : [PYTHON, ...base];
  const bin = (nice && USE_NICE) ? 'nice' : PYTHON;

  const run = async () => {
    const { stdout, stderr } = await execa(bin, args, { env: process.env });
    if (stdout) log.info({ cmd: cmdArgs.join(' ') }, stdout);
    if (stderr) log.warn({ cmd: cmdArgs.join(' ') }, stderr);
  };

  if (!flockKey) return run();

  // emulate flock: lock on a key path
  const lockPath = path.join('/tmp', `${flockKey}.lock`);
  fs.writeFileSync(lockPath, '', { flag: 'a' }); // ensure file exists
  let release;
  try {
    release = await lockfile.lock(lockPath, { retries: { retries: 0 } });
  } catch {
    return log.info({ flockKey }, 'Skipped: lock held');
  }

  try { await run(); } finally { await release(); }
}

// ---- Schedules ----

// every minute: moderation queue images (low prio)
cron.schedule('* * * * *', () =>
  runManage(['moderation_queue_process_queued_images'], { nice: true })
);

// every minute: SOPN parse (flocked)
cron.schedule('* * * * *', () =>
  runManage(['sopn_parsing_process_unparsed'], { flockKey: 'sopn-parse-cron' })
);

// 02:06 daily: parties from EC (with Slack)
cron.schedule('6 2 * * *', () =>
  runManage(['parties_import_from_ec', '--post-to-slack'])
);

// every 5 minutes: EE recently-updated
cron.schedule('*/5 * * * *', () =>
  runManage(['uk_create_elections_from_every_election', '--recently-updated'])
);

// 23:23 daily: check current elections
cron.schedule('23 23 * * *', () =>
  runManage(['uk_create_elections_from_every_election', '--check-current'])
);

// 23:33 daily: mop up missed (delta 25)
cron.schedule('33 23 * * *', () =>
  runManage([
    'uk_create_elections_from_every_election',
    '--recently-updated',
    '--recently-updated-delta', '25'
  ])
);

log.info('ERIFY™ cron scheduler started.');