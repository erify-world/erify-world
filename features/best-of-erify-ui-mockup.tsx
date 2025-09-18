/**
 * ERIFY™ App Poll UI Mockup (Adalo/React/No-code ready)
 * Poll voting, results, and luxury winner display.
 */

import React, { useState } from 'react';
import type { PollCategory, PollOption, PollResult } from './best-of-erify-poll';

export function BestOfErifyPollUI({
  category,
  options,
  onVote,
  results,
  winnerPoster,
}: {
  category: PollCategory;
  options: PollOption[];
  onVote: (optionId: string) => void;
  results?: PollResult;
  winnerPoster?: string;
}) {
  const [voted, setVoted] = useState(false);

  return (
    <div style={{ padding: 32, fontFamily: 'serif', background: '#faf6f3' }}>
      <h1>🏆 Best of ERIFY™ — {category}</h1>
      {!voted ? (
        <div>
          <h2>Vote for your “Best”</h2>
          {options.map(opt => (
            <button
              key={opt.id}
              style={{
                margin: 8,
                padding: 16,
                borderRadius: 12,
                background: '#fbeee6',
                fontWeight: 'bold',
              }}
              onClick={() => {
                onVote(opt.id);
                setVoted(true);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : results ? (
        <div>
          <h2>Results</h2>
          <ul>
            {Object.entries(results.votes).map(([id, count]) => {
              const opt = options.find(o => o.id === id);
              return (
                <li key={id}>
                  {opt?.label}: {count} votes
                  {results.winnerId === id ? ' 🏆' : ''}
                </li>
              );
            })}
          </ul>
          {winnerPoster && (
            <div style={{ marginTop: 24, background: '#fff7f2', padding: 16, borderRadius: 12 }}>
              <pre>{winnerPoster}</pre>
            </div>
          )}
        </div>
      ) : (
        <h2>Thank you for voting!</h2>
      )}
    </div>
  );
}