/**
 * Kanji data service — async interface for loading kanji data.
 * Currently wraps synchronous hardcoded data; designed for future
 * lazy-loaded JSON bundles per JLPT level.
 */

import { KanjiVGData, JLPTLevel } from './kanjiVGTypes';
import { kanjiVGData, kanjiVGList } from './kanjiVGData';

export interface KanjiFilter {
  jlptLevels?: JLPTLevel[];
  grade?: number;
  search?: string;
  heisigRanges?: [number, number][];
}

/** In-memory cache for loaded kanji bundles */
const loadedBundles = new Map<string, KanjiVGData[]>();

/** Initialize cache with hardcoded data */
function ensureCache(): void {
  if (loadedBundles.size === 0) {
    const byLevel = new Map<string, KanjiVGData[]>();
    for (const kanji of kanjiVGList) {
      const key = kanji.jlpt ?? 'unknown';
      const list = byLevel.get(key) ?? [];
      list.push(kanji);
      byLevel.set(key, list);
    }
    for (const [key, list] of byLevel) {
      loadedBundles.set(key, list);
    }
  }
}

/**
 * Get all available kanji, optionally filtered.
 */
export async function getAvailableKanji(filter?: KanjiFilter): Promise<KanjiVGData[]> {
  ensureCache();

  let results = kanjiVGList;

  if (filter?.jlptLevels && filter.jlptLevels.length > 0) {
    const levels = new Set(filter.jlptLevels);
    results = results.filter((k) => k.jlpt != null && levels.has(k.jlpt));
  }

  if (filter?.grade) {
    results = results.filter((k) => k.grade === filter.grade);
  }

  if (filter?.heisigRanges && filter.heisigRanges.length > 0) {
    const ranges = filter.heisigRanges;
    results = results.filter(
      (k) =>
        k.heisigIndex != null &&
        ranges.some(([min, max]) => k.heisigIndex! >= min && k.heisigIndex! <= max)
    );
  }

  if (filter?.search) {
    const term = filter.search.toLowerCase();
    results = results.filter(
      (k) =>
        k.character.includes(term) ||
        k.meaning.toLowerCase().includes(term) ||
        (k.heisigKeyword && k.heisigKeyword.toLowerCase().includes(term))
    );
  }

  // Sort by Heisig index when Heisig ranges are active
  if (filter?.heisigRanges && filter.heisigRanges.length > 0) {
    results = [...results].sort((a, b) => (a.heisigIndex ?? 0) - (b.heisigIndex ?? 0));
  }

  return results;
}

/**
 * Get kanji data for a specific character.
 */
export async function getKanjiData(character: string): Promise<KanjiVGData | undefined> {
  return kanjiVGData[character];
}

/**
 * Preload kanji data for a set of characters (for future lazy loading).
 */
export async function preloadKanji(characters: string[]): Promise<void> {
  // Currently a no-op since all data is in memory.
  // In the future, this would trigger loading of JSON bundles.
  void characters;
}

/**
 * Get available JLPT levels that have kanji data.
 */
export function getAvailableLevels(): JLPTLevel[] {
  ensureCache();
  const levels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];
  return levels.filter((level) => loadedBundles.has(level));
}

/**
 * Get count of kanji per JLPT level.
 */
export function getKanjiCounts(): Record<string, number> {
  ensureCache();
  const counts: Record<string, number> = {};
  for (const [key, list] of loadedBundles) {
    counts[key] = list.length;
  }
  return counts;
}

/**
 * Get total count of all kanji.
 */
export function getTotalKanjiCount(): number {
  return kanjiVGList.length;
}

/**
 * Get total count of kanji with Heisig indices.
 */
export function getHeisigKanjiCount(): number {
  return kanjiVGList.filter((k) => k.heisigIndex != null).length;
}

/**
 * Get dynamic range chips for Heisig browsing.
 * Returns ranges like [1, 200], [201, 400], etc.
 */
export function getHeisigRanges(): { label: string; range: [number, number] }[] {
  const maxIndex = kanjiVGList.reduce(
    (max, k) => (k.heisigIndex != null && k.heisigIndex > max ? k.heisigIndex : max),
    0
  );
  const step = 200;
  const ranges: { label: string; range: [number, number] }[] = [];

  for (let start = 1; start <= maxIndex; start += step) {
    const end = Math.min(start + step - 1, maxIndex);
    ranges.push({ label: `${start}–${end}`, range: [start, end] });
  }

  return ranges;
}
