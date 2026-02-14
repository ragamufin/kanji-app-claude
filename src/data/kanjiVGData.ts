/**
 * Processed KanjiVG stroke data for kanji characters.
 *
 * Loads from pre-generated JSON bundles per JLPT level.
 * Stroke metadata (direction, quadrants) is derived at load time from path endpoints.
 *
 * KanjiVG data is licensed under CC BY-SA 3.0
 * https://kanjivg.tagaini.net/
 */

import { KanjiVGData, KanjiVGStroke, JLPTLevel } from './kanjiVGTypes';
import { deriveStrokeMetadata } from '../utils/svgPathUtils';

// Import pre-generated JSON bundles
import n5Raw from './bundles/n5.json';
import n4Raw from './bundles/n4.json';
import n3Raw from './bundles/n3.json';
import n2Raw from './bundles/n2.json';
import n1Raw from './bundles/n1.json';

interface RawStroke {
  id: string;
  path: string;
  length: number;
}

interface RawKanji {
  character: string;
  meaning: string;
  jlpt: string;
  grade: number;
  viewBox: string;
  strokes: RawStroke[];
  heisigIndex?: number;
  heisigKeyword?: string;
}

function processStroke(raw: RawStroke): KanjiVGStroke {
  const meta = deriveStrokeMetadata(raw.path);
  return { ...raw, ...meta };
}

function processBundle(rawList: RawKanji[]): KanjiVGData[] {
  return rawList.map((raw) => ({
    character: raw.character,
    meaning: raw.meaning,
    jlpt: raw.jlpt as JLPTLevel,
    grade: raw.grade,
    viewBox: raw.viewBox,
    strokes: raw.strokes.map(processStroke),
    ...(raw.heisigIndex != null && { heisigIndex: raw.heisigIndex }),
    ...(raw.heisigKeyword != null && { heisigKeyword: raw.heisigKeyword }),
  }));
}

const allKanji: KanjiVGData[] = [
  ...processBundle(n5Raw as RawKanji[]),
  ...processBundle(n4Raw as RawKanji[]),
  ...processBundle(n3Raw as RawKanji[]),
  ...processBundle(n2Raw as RawKanji[]),
  ...processBundle(n1Raw as RawKanji[]),
];

// Build lookup by character
export const kanjiVGData: Record<string, KanjiVGData> = {};
for (const k of allKanji) {
  kanjiVGData[k.character] = k;
}

/**
 * Get the list of all KanjiVG data as an array, useful for the kanji selector.
 */
export const kanjiVGList: KanjiVGData[] = allKanji;

/**
 * Get KanjiVG data for a specific character.
 * Returns undefined if the character is not available.
 */
export function getKanjiVGData(character: string): KanjiVGData | undefined {
  return kanjiVGData[character];
}

/**
 * Check if KanjiVG data is available for a character.
 */
export function hasKanjiVGData(character: string): boolean {
  return character in kanjiVGData;
}
