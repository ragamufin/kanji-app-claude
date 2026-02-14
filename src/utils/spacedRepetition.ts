/**
 * Simplified SM-2 spaced repetition algorithm.
 * Determines which kanji are "due for review" based on practice history.
 */

import { PracticeRecord } from '../data/storage';

interface SM2State {
  /** Ease factor (starts at 2.5, min 1.3) */
  easeFactor: number;
  /** Current interval in days */
  interval: number;
  /** Number of consecutive correct reviews */
  repetition: number;
}

const INITIAL_STATE: SM2State = {
  easeFactor: 2.5,
  interval: 1,
  repetition: 0,
};

/**
 * Compute SM-2 state from a score (0-100).
 */
function updateSM2(state: SM2State, score: number): SM2State {
  // Map 0-100 score to SM-2 quality 0-5
  const quality = Math.min(5, Math.round((score / 100) * 5));

  if (quality < 3) {
    // Failed: reset to beginning
    return {
      easeFactor: state.easeFactor,
      interval: 1,
      repetition: 0,
    };
  }

  const newRepetition = state.repetition + 1;
  let newInterval: number;

  if (newRepetition === 1) {
    newInterval = 1;
  } else if (newRepetition === 2) {
    newInterval = 6;
  } else {
    newInterval = Math.round(state.interval * state.easeFactor);
  }

  const newEaseFactor = Math.max(
    1.3,
    state.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetition: newRepetition,
  };
}

export interface KanjiReviewState {
  character: string;
  state: SM2State;
  nextReviewDate: number; // timestamp
  lastScore: number;
}

/**
 * Compute review states for all practiced kanji.
 */
export function computeReviewStates(records: PracticeRecord[]): KanjiReviewState[] {
  // Group records by character, sorted by timestamp
  const byCharacter = new Map<string, PracticeRecord[]>();
  for (const record of records) {
    const list = byCharacter.get(record.character) ?? [];
    list.push(record);
    byCharacter.set(record.character, list);
  }

  const results: KanjiReviewState[] = [];

  for (const [character, charRecords] of byCharacter) {
    // Sort by timestamp ascending
    charRecords.sort((a, b) => a.timestamp - b.timestamp);

    let sm2State = INITIAL_STATE;
    let lastTimestamp = 0;
    let lastScore = 0;

    for (const record of charRecords) {
      sm2State = updateSM2(sm2State, record.score);
      lastTimestamp = record.timestamp;
      lastScore = record.score;
    }

    const nextReviewDate = lastTimestamp + sm2State.interval * 24 * 60 * 60 * 1000;

    results.push({
      character,
      state: sm2State,
      nextReviewDate,
      lastScore,
    });
  }

  return results;
}

/**
 * Get kanji that are due for review (nextReviewDate <= now).
 */
export function getDueKanji(records: PracticeRecord[]): string[] {
  const now = Date.now();
  const states = computeReviewStates(records);
  return states
    .filter((s) => s.nextReviewDate <= now)
    .sort((a, b) => a.nextReviewDate - b.nextReviewDate)
    .map((s) => s.character);
}
