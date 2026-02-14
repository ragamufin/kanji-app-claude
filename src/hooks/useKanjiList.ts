import { useState, useEffect } from 'react';
import { KanjiVGData, JLPTLevel } from '../data/kanjiVGTypes';
import { getAvailableKanji } from '../data/kanjiDataService';

interface UseKanjiListResult {
  kanji: KanjiVGData[];
  loading: boolean;
}

/**
 * Hook to load kanji list from the data service.
 * Accepts individual filter params for stable deps.
 */
export function useKanjiList(
  jlptLevels?: JLPTLevel[],
  grade?: number,
  search?: string,
  heisigRanges?: [number, number][]
): UseKanjiListResult {
  const [kanji, setKanji] = useState<KanjiVGData[]>([]);
  const [loading, setLoading] = useState(true);

  // Serialize arrays for stable deps
  const jlptKey = jlptLevels?.join(',') ?? '';
  const rangeKey = heisigRanges?.map(([a, b]) => `${a}-${b}`).join(',') ?? '';

  useEffect(() => {
    let cancelled = false;

    const filter = {
      jlptLevels: jlptLevels && jlptLevels.length > 0 ? jlptLevels : undefined,
      grade,
      search,
      heisigRanges: heisigRanges && heisigRanges.length > 0 ? heisigRanges : undefined,
    };

    getAvailableKanji(filter).then((results) => {
      if (!cancelled) {
        setKanji(results);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [jlptKey, grade, search, rangeKey]);

  return { kanji, loading };
}
