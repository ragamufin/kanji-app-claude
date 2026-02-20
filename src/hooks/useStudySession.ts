/**
 * useStudySession — state machine for study/SRS card sessions.
 *
 * States: front_shown → revealed → (practicing → revealed) → next card → front_shown
 *         → session_complete
 */

import { useState, useCallback, useMemo } from 'react';
import { KanjiVGData } from '../data/kanjiVGTypes';
import { SessionState, StudyMode } from '../config/studyConfig';

interface UseStudySessionProps {
  /** Kanji deck to study */
  deck: KanjiVGData[];
  /** Study mode */
  mode: StudyMode;
  /** Shuffle the deck */
  shuffle?: boolean;
}

interface UseStudySessionResult {
  /** Current session state */
  state: SessionState;
  /** Current card (null if setup or complete) */
  currentCard: KanjiVGData | null;
  /** Current card index (0-based) */
  currentIndex: number;
  /** Total cards in session */
  totalCards: number;
  /** Effective mode for current card (resolves 'random') */
  effectiveMode: 'regular' | 'reverse';
  /** Reveal the current card */
  reveal: () => void;
  /** Enter practice mode for current card */
  startPractice: () => void;
  /** Exit practice mode */
  exitPractice: () => void;
  /** Advance to next card */
  nextCard: () => void;
  /** Whether session is complete */
  isComplete: boolean;
  /** Cards already reviewed */
  reviewedCount: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function useStudySession({
  deck,
  mode,
  shuffle = false,
}: UseStudySessionProps): UseStudySessionResult {
  const orderedDeck = useMemo(() => (shuffle ? shuffleArray(deck) : deck), [deck, shuffle]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [state, setState] = useState<SessionState>('front_shown');
  const [randomModes] = useState<Array<'regular' | 'reverse'>>(() =>
    orderedDeck.map(() => (Math.random() > 0.5 ? 'regular' : 'reverse'))
  );

  const currentCard = currentIndex < orderedDeck.length ? orderedDeck[currentIndex] : null;
  const isComplete = state === 'session_complete';

  const effectiveMode = useMemo(() => {
    if (mode === 'random') {
      return randomModes[currentIndex] ?? 'regular';
    }
    return mode;
  }, [mode, currentIndex, randomModes]);

  const reveal = useCallback(() => {
    if (state === 'front_shown') {
      setState('revealed');
    }
  }, [state]);

  const startPractice = useCallback(() => {
    if (state === 'revealed') {
      setState('practicing');
    }
  }, [state]);

  const exitPractice = useCallback(() => {
    if (state === 'practicing') {
      setState('revealed');
    }
  }, [state]);

  const nextCard = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= orderedDeck.length) {
      setState('session_complete');
    } else {
      setCurrentIndex(nextIndex);
      setState('front_shown');
    }
  }, [currentIndex, orderedDeck.length]);

  return {
    state,
    currentCard,
    currentIndex,
    totalCards: orderedDeck.length,
    effectiveMode,
    reveal,
    startPractice,
    exitPractice,
    nextCard,
    isComplete,
    reviewedCount: currentIndex,
  };
}
