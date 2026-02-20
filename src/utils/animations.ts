/**
 * Shared animation utilities for the Elevated Zen design system.
 */

import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const PRESS_SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
};

/**
 * useAnimatedPress — spring-based scale press feedback.
 * Returns animated style + pressIn/pressOut handlers.
 */
export function useAnimatedPress(scaleDown = 0.97) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = useCallback(() => {
    scale.value = withSpring(scaleDown, PRESS_SPRING_CONFIG);
  }, [scale, scaleDown]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, PRESS_SPRING_CONFIG);
  }, [scale]);

  return { animatedStyle, onPressIn, onPressOut };
}

/**
 * Shared spring config for flip animations.
 */
export const FLIP_SPRING_CONFIG = {
  damping: 20,
  stiffness: 90,
  mass: 1,
};

/**
 * Helper to create a front/back flip pair.
 * Returns { flipValue, frontStyle, backStyle, flip, reset }
 */
export function useFlipAnimation() {
  const flipValue = useSharedValue(0);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${flipValue.value * 180}deg` }],
    backfaceVisibility: 'hidden' as const,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${flipValue.value * 180 + 180}deg` }],
    backfaceVisibility: 'hidden' as const,
  }));

  const flip = useCallback(() => {
    flipValue.value = withSpring(1, FLIP_SPRING_CONFIG);
  }, [flipValue]);

  const reset = useCallback(() => {
    flipValue.value = 0;
  }, [flipValue]);

  return { flipValue, frontStyle, backStyle, flip, reset };
}
