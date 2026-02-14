/**
 * FSRS (Free Spaced Repetition Scheduler) integration.
 * Wraps ts-fsrs for kanji review scheduling.
 */

import {
  createEmptyCard,
  fsrs,
  Rating,
  State,
  type Card,
  type RecordLogItem,
  type FSRS,
} from 'ts-fsrs';

// Re-export for consumers
export { Rating, State };
export type { Card };

/** Per-kanji FSRS state stored in AsyncStorage */
export interface FSRSCardState {
  character: string;
  card: Card;
  lastReview: number; // timestamp
}

/** Grade labels for UI */
export const GRADE_LABELS: Record<number, string> = {
  [Rating.Again]: 'Again',
  [Rating.Hard]: 'Hard',
  [Rating.Good]: 'Good',
  [Rating.Easy]: 'Easy',
};

/** All valid grades for iteration */
export const GRADES = [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy] as const;

/** Singleton FSRS scheduler instance */
let scheduler: FSRS | null = null;

function getScheduler(): FSRS {
  if (!scheduler) {
    scheduler = fsrs();
  }
  return scheduler;
}

/** Create a fresh FSRS card state for a new kanji */
export function createNewCardState(character: string): FSRSCardState {
  return {
    character,
    card: createEmptyCard(),
    lastReview: 0,
  };
}

/** Get a grade result from the repeat output */
function getGradeResult(
  preview: ReturnType<FSRS['repeat']>,
  rating: Rating
): RecordLogItem {
  // ts-fsrs IPreview is indexed by Rating enum values (1-4)
  return (preview as unknown as Record<number, RecordLogItem>)[rating];
}

/** Grade a card and return the updated state */
export function gradeCard(
  state: FSRSCardState,
  rating: Rating,
  now: Date = new Date()
): { cardState: FSRSCardState; log: RecordLogItem } {
  const f = getScheduler();
  const result = f.repeat(state.card, now);
  const gradeResult = getGradeResult(result, rating);

  return {
    cardState: {
      character: state.character,
      card: gradeResult.card,
      lastReview: now.getTime(),
    },
    log: gradeResult,
  };
}

/** Preview scheduling for all grades (used to show intervals on buttons) */
export function previewGrades(
  state: FSRSCardState,
  now: Date = new Date()
): Record<number, Card> {
  const f = getScheduler();
  const result = f.repeat(state.card, now);
  return {
    [Rating.Again]: getGradeResult(result, Rating.Again).card,
    [Rating.Hard]: getGradeResult(result, Rating.Hard).card,
    [Rating.Good]: getGradeResult(result, Rating.Good).card,
    [Rating.Easy]: getGradeResult(result, Rating.Easy).card,
  };
}

/** Check if a card is due for review */
export function isDue(state: FSRSCardState, now: Date = new Date()): boolean {
  return new Date(state.card.due) <= now;
}

/** Check if a card is new (never reviewed) */
export function isNewCard(state: FSRSCardState): boolean {
  return state.card.state === State.New;
}

/** Get due cards from a collection, sorted by due date (most overdue first) */
export function getDueCards(
  cards: FSRSCardState[],
  now: Date = new Date()
): FSRSCardState[] {
  return cards
    .filter((c) => isDue(c, now))
    .sort((a, b) => new Date(a.card.due).getTime() - new Date(b.card.due).getTime());
}

/** Get count of due cards */
export function getDueCount(
  cards: FSRSCardState[],
  now: Date = new Date()
): number {
  return cards.filter((c) => isDue(c, now)).length;
}

/** Get new (unreviewed) cards */
export function getNewCards(cards: FSRSCardState[]): FSRSCardState[] {
  return cards.filter((c) => isNewCard(c));
}

/** Format next review interval for display */
export function formatInterval(card: Card): string {
  const now = new Date();
  const due = new Date(card.due);
  const diffMs = due.getTime() - now.getTime();

  if (diffMs <= 0) return 'now';

  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m`;

  const diffHours = Math.round(diffMs / 3600000);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.round(diffMs / 86400000);
  if (diffDays < 30) return `${diffDays}d`;

  const diffMonths = Math.round(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo`;

  const diffYears = Math.round(diffDays / 365);
  return `${diffYears}y`;
}
