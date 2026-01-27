import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import Animated, { useAnimatedProps, useDerivedValue, SharedValue } from 'react-native-reanimated';
import { KanjiVGData } from '../data/kanjiVGTypes';
import { useStrokeAnimation, StrokeAnimationConfig } from '../hooks/useStrokeAnimation';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface StrokeAnimatorProps {
  /** KanjiVG data for the character to animate */
  data: KanjiVGData;
  /** Canvas width in pixels */
  width: number;
  /** Canvas height in pixels */
  height: number;
  /** Stroke color (default: '#333') */
  strokeColor?: string;
  /** Stroke width (default: 6) */
  strokeWidth?: number;
  /** Animation configuration */
  animationConfig?: StrokeAnimationConfig;
  /** Whether to auto-play on mount (default: true) */
  autoPlay?: boolean;
  /** Show playback controls (default: true) */
  showControls?: boolean;
}

interface AnimatedStrokeProps {
  path: string;
  length: number;
  index: number;
  dashOffsets: SharedValue<number[]>;
  strokeColor: string;
  strokeWidth: number;
  scale: number;
}

function AnimatedStroke({
  path,
  length,
  index,
  dashOffsets,
  strokeColor,
  strokeWidth,
  scale,
}: AnimatedStrokeProps) {
  // Derive the offset for this specific stroke from the array
  const strokeOffset = useDerivedValue(() => {
    return dashOffsets.value[index] ?? length;
  });

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeOffset.value,
  }));

  return (
    <AnimatedPath
      d={path}
      stroke={strokeColor}
      strokeWidth={strokeWidth / scale}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={length}
      fill="none"
      animatedProps={animatedProps}
    />
  );
}

/**
 * Animated stroke-by-stroke display of kanji using KanjiVG data.
 * Uses strokeDasharray/strokeDashoffset technique for progressive reveal.
 */
export function StrokeAnimator({
  data,
  width,
  height,
  strokeColor = '#333',
  strokeWidth = 6,
  animationConfig,
  autoPlay = true,
  showControls = true,
}: StrokeAnimatorProps) {
  // KanjiVG uses 109x109 viewBox
  const scale = Math.min(width / 109, height / 109);

  const { dashOffsets, play, reset } = useStrokeAnimation(
    data.strokes,
    animationConfig
  );

  useEffect(() => {
    if (autoPlay) {
      // Small delay to ensure component is mounted
      const timer = setTimeout(play, 100);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, play]);

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <G transform={`scale(${scale}, ${scale})`}>
          {data.strokes.map((stroke, index) => (
            <AnimatedStroke
              key={stroke.id}
              path={stroke.path}
              length={stroke.length}
              index={index}
              dashOffsets={dashOffsets}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
              scale={scale}
            />
          ))}
        </G>
      </Svg>

      {showControls && (
        <View style={styles.controls}>
          <Pressable style={styles.button} onPress={play}>
            <Text style={styles.buttonText}>Play</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={reset}>
            <Text style={styles.buttonText}>Reset</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
