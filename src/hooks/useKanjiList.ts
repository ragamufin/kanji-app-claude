import { useState, useEffect } from 'react';
import { KanjiVGData } from '../data/kanjiVGTypes';
import { getAvailableKanji } from '../data/kanjiDataService';

interface UseKanjiListResult {
  kanji: KanjiVGData[];
  loading: boolean;
}

/**
 * Hook to load kanji list from the data service.
 * Accepts individual filter params for stable deps.
 */
export function useKanjiList(jlpt?: string, grade?: number, search?: string): UseKanjiListResult {
  const [kanji, setKanji] = useState<KanjiVGData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const filter = {
      jlpt: jlpt as import('../data/kanjiVGTypes').JLPTLevel | undefined,
      grade,
      search,
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
  }, [jlpt, grade, search]);

  return { kanji, loading };
}
