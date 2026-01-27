/**
 * TypeScript interfaces for KanjiVG stroke data.
 * KanjiVG data is CC BY-SA 3.0 - https://kanjivg.tagaini.net/
 */

export interface KanjiVGStroke {
  /** Unique identifier for the stroke */
  id: string;
  /** SVG path data (d attribute) */
  path: string;
  /** Pre-calculated path length for animation */
  length: number;
}

export interface KanjiVGData {
  /** The kanji character */
  character: string;
  /** Array of strokes in drawing order */
  strokes: KanjiVGStroke[];
  /** SVG viewBox (typically "0 0 109 109" for KanjiVG) */
  viewBox: string;
}

/** Canvas mode for the kanji drawing interface */
export type CanvasMode = 'practice' | 'demo' | 'trace';
