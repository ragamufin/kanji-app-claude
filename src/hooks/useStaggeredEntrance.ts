/**
 * useStaggeredEntrance — fade + translate items in sequence on mount.
 */

import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
  SharedValue,
} from 'react-native-reanimated';

/**
 * Returns an array of animated styles for staggered entrance.
 * @param count - number of items
 * @param delayMs - delay between each item (default 50ms)
 * @param translateY - starting Y offset (default 12px)
 */
export function useStaggeredEntrance(count: number, delayMs = 50, translateY = 12) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 1;
  }, [progress]);

  // Return a hook that creates animated styles for each index
  return { progress, delayMs, translateY };
}

/**
 * Use inside a component for a single item in the stagger sequence.
 * @param index - item index in the sequence
 * @param progress - shared progress value from useStaggeredEntrance
 * @param delayMs - delay between each item
 * @param translateY - starting Y offset
 */
export function useStaggeredItemStyle(
  index: number,
  progress: SharedValue<number>,
  delayMs = 50,
  translateY = 12
) {
  return useAnimatedStyle(() => {
    const delay = index * delayMs;
    return {
      opacity: withDelay(
        delay,
        withTiming(progress.value, { duration: 300, easing: Easing.out(Easing.ease) })
      ),
      transform: [
        {
          translateY: withDelay(
            delay,
            withTiming(progress.value === 1 ? 0 : translateY, {
              duration: 300,
              easing: Easing.out(Easing.ease),
            })
          ),
        },
      ],
    };
  });
}
