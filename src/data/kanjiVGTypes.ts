/**
 * TypeScript interfaces for KanjiVG stroke data.
 * KanjiVG data is CC BY-SA 3.0 - https://kanjivg.tagaini.net/
 */

export type StrokeDirection =
  | 'right'       // 0° (left-to-right)
  | 'down-right'  // 45°
  | 'down'        // 90° (top-to-bottom)
  | 'down-left'   // 135°
  | 'left'        // 180° (right-to-left)
  | 'up-left'     // 225°
  | 'up'          // 270° (bottom-to-top)
  | 'up-right'    // 315°
  | 'curved';

export type Quadrant = 1 | 2 | 3 | 4; // 1=top-left, 2=top-right, 3=bottom-left, 4=bottom-right

export interface KanjiVGStroke {
  /** Unique identifier for the stroke */
  id: string;
  /** SVG path data (d attribute) */
  path: string;
  /** Pre-calculated path length for animation */
  length: number;
  /** Derived stroke direction */
  direction: StrokeDirection;
  /** Quadrant where stroke starts */
  startQuadrant: Quadrant;
  /** Quadrant where stroke ends */
  endQuadrant: Quadrant;
}

export interface KanjiVGData {
  /** The kanji character */
  character: string;
  /** English meaning of the kanji */
  meaning: string;
  /** Array of strokes in drawing order */
  strokes: KanjiVGStroke[];
  /** SVG viewBox (typically "0 0 109 109" for KanjiVG) */
  viewBox: string;
}

/** Canvas mode for the kanji drawing interface */
export type CanvasMode = 'practice' | 'demo' | 'trace';
