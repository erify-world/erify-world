/**
 * ERIFY™ “Best Of” Poll Feature
 * Luxury voting for: changemaker, product, moment, community hero.
 * Works with Node.js, Cloudflare Workers, or no-code (Adalo).
 */

import crypto from 'crypto';

// Types
export type PollCategory =
  | 'Global Changemaker'
  | 'ERIFY Product'
  | 'Brand Moment'
  | 'Community Hero';

export interface PollOption {
  id: string;
  label: string;
  description?: string;
  imageUrl?: string;
}

export interface PollVote {
  pollId: string;
  optionId: string;
  voterId: string; // ERIVOX™ identity / session
  timestamp: number;
}

export interface PollResult {
  pollId: string;
  votes: Record<string, number>; // optionId -> count
  winnerId: string;
}

// Create poll
export function createPoll(
  category: PollCategory,
  options: PollOption[]
): { pollId: string; category: PollCategory; options: PollOption[] } {
  const pollId = crypto.randomBytes(16).toString('hex');
  return { pollId, category, options };
}

// Cast vote
export async function castVote(
  pollId: string,
  optionId: string,
  voterId: string,
  storeVote: (vote: PollVote) => Promise<void>
) {
  const vote: PollVote = {
    pollId,
    optionId,
    voterId,
    timestamp: Date.now(),
  };
  await storeVote(vote);
}

// Tally results
export async function tallyVotes(
  pollId: string,
  getVotes: (pollId: string) => Promise<PollVote[]>,
  options: PollOption[]
): Promise<PollResult> {
  const votes = await getVotes(pollId);
  const counts = Object.fromEntries(options.map(o => [o.id, 0]));
  for (const v of votes) {
    if (counts[v.optionId] !== undefined) counts[v.optionId]++;
  }
  // Find winner
  const winnerId =
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  return { pollId, votes: counts, winnerId };
}