import { useCallback, useRef, useEffect } from 'react';
import {
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import { KanjiVGStroke } from '../data/kanjiVGTypes';

export interface StrokeAnimationConfig {
  /** Duration in ms to draw each stroke (default: 500) */
  strokeDuration?: number;
  /** Delay in ms between strokes (default: 200) */
  strokeDelay?: number;
  /** Easing function (default: Easing.inOut(Easing.ease)) */
  easing?: typeof Easing.ease;
}

export interface UseStrokeAnimationResult {
  /** Animated dash offset values (array stored in shared value) */
  dashOffsets: SharedValue<number[]>;
  /** Start the animation from the beginning */
  play: () => void;
  /** Reset animation to initial state (all strokes hidden) */
  reset: () => void;
  /** Whether the animation is currently playing */
  isPlaying: SharedValue<boolean>;
}

/**
 * Hook for animating stroke-by-stroke drawing of kanji.
 * Uses strokeDasharray/strokeDashoffset technique for progressive reveal.
 */
export function useStrokeAnimation(
  strokes: KanjiVGStroke[],
  config: StrokeAnimationConfig = {},
  onComplete?: () => void
): UseStrokeAnimationResult {
  const {
    strokeDuration = 500,
    strokeDelay = 200,
    easing = Easing.inOut(Easing.ease),
  } = config;

  const isPlaying = useSharedValue(false);

  // Store initial lengths for reset
  const strokeLengths = useRef(strokes.map(s => s.length));

  // Single shared value holding array of offsets (initialized to stroke lengths = hidden)
  const dashOffsets = useSharedValue<number[]>(strokes.map(s => s.length));

  // Update lengths ref when strokes change
  useEffect(() => {
    strokeLengths.current = strokes.map(s => s.length);
    dashOffsets.value = strokes.map(s => s.length);
  }, [strokes, dashOffsets]);

  const reset = useCallback(() => {
    isPlaying.value = false;
    dashOffsets.value = strokeLengths.current.slice();
  }, [dashOffsets, isPlaying]);

  const play = useCallback(() => {
    // Reset to initial state first
    dashOffsets.value = strokeLengths.current.slice();
    isPlaying.value = true;

    // Animate each stroke sequentially using individual timings
    const totalStrokes = strokeLengths.current.length;

    strokeLengths.current.forEach((length, index) => {
      const delay = index * (strokeDuration + strokeDelay);
      const isLast = index === totalStrokes - 1;

      setTimeout(() => {
        // Animate this stroke from length to 0
        const startOffsets = dashOffsets.value.slice();
        const targetOffsets = startOffsets.slice();
        targetOffsets[index] = 0;

        dashOffsets.value = withTiming(
          targetOffsets,
          {
            duration: strokeDuration,
            easing,
          },
          (finished) => {
            if (finished && isLast) {
              isPlaying.value = false;
              if (onComplete) {
                runOnJS(onComplete)();
              }
            }
          }
        );
      }, delay);
    });
  }, [dashOffsets, strokeDuration, strokeDelay, easing, isPlaying, onComplete]);

  return {
    dashOffsets,
    play,
    reset,
    isPlaying,
  };
}
