/**
 * Hook for FSRS scheduling — provides card state management and grading.
 */

import { useState, useEffect, useCallback } from 'react';
import { Rating } from 'ts-fsrs';
import {
  FSRSCardState,
  getDueCards,
  getDueCount,
  getNewCards,
  gradeCard,
} from '../utils/spacedRepetition';
import {
  getAllCardStates,
  updateCardState,
  ensureCardStates,
} from '../data/fsrsStorage';

interface UseFSRSResult {
  /** All card states */
  cards: FSRSCardState[];
  /** Cards due for review */
  dueCards: FSRSCardState[];
  /** Count of due cards */
  dueCount: number;
  /** Count of new (unreviewed) cards */
  newCount: number;
  /** Whether data is loading */
  loading: boolean;
  /** Grade a card and update state */
  grade: (character: string, rating: Rating) => Promise<FSRSCardState>;
  /** Ensure card states exist for characters */
  ensureCards: (characters: string[]) => Promise<void>;
  /** Refresh card data from storage */
  refresh: () => Promise<void>;
}

export function useFSRS(): UseFSRSResult {
  const [cards, setCards] = useState<FSRSCardState[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCards = useCallback(async () => {
    const allCards = await getAllCardStates();
    setCards(allCards);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    getAllCardStates().then((allCards) => {
      if (active) {
        setCards(allCards);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const dueCards = getDueCards(cards);
  const dueCount = getDueCount(cards);
  const newCount = getNewCards(cards).length;

  const grade = useCallback(
    async (character: string, rating: Rating): Promise<FSRSCardState> => {
      const cardState = cards.find((c) => c.character === character);
      if (!cardState) {
        throw new Error(`No card state for character: ${character}`);
      }

      const { cardState: updated } = gradeCard(cardState, rating);
      await updateCardState(updated);

      setCards((prev) =>
        prev.map((c) => (c.character === character ? updated : c))
      );

      return updated;
    },
    [cards]
  );

  const ensureCards = useCallback(
    async (characters: string[]) => {
      await ensureCardStates(characters);
      await loadCards();
    },
    [loadCards]
  );

  return {
    cards,
    dueCards,
    dueCount,
    newCount,
    loading,
    grade,
    ensureCards,
    refresh: loadCards,
  };
}
