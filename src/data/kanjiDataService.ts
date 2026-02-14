/**
 * Kanji data service — async interface for loading kanji data.
 * Currently wraps synchronous hardcoded data; designed for future
 * lazy-loaded JSON bundles per JLPT level.
 */

import { KanjiVGData, JLPTLevel } from './kanjiVGTypes';
import { kanjiVGData, kanjiVGList } from './kanjiVGData';

export interface KanjiFilter {
  jlpt?: JLPTLevel;
  grade?: number;
  search?: string;
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

  if (filter?.jlpt) {
    results = results.filter((k) => k.jlpt === filter.jlpt);
  }

  if (filter?.grade) {
    results = results.filter((k) => k.grade === filter.grade);
  }

  if (filter?.search) {
    const term = filter.search.toLowerCase();
    results = results.filter(
      (k) => k.character.includes(term) || k.meaning.toLowerCase().includes(term)
    );
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
