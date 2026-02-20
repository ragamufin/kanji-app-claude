/**
 * Study session configuration constants.
 */

/** Study card display mode */
export type StudyMode = 'regular' | 'reverse' | 'random';

/** Session type */
export type SessionType = 'study' | 'srs';

/** Session state machine states */
export type SessionState = 'setup' | 'front_shown' | 'revealed' | 'practicing' | 'session_complete';

/** Default new cards per SRS session */
export const DEFAULT_NEW_CARDS_PER_SESSION = 20;

/** Study mode labels for UI */
export const STUDY_MODE_LABELS: Record<StudyMode, string> = {
  regular: 'Keyword \u2192 Kanji',
  reverse: 'Kanji \u2192 Keyword',
  random: 'Random Mix',
};

/** Study mode descriptions */
export const STUDY_MODE_DESCRIPTIONS: Record<StudyMode, string> = {
  regular: 'See the keyword, recall the kanji',
  reverse: 'See the kanji, recall the keyword',
  random: 'Randomly mix both directions',
};
