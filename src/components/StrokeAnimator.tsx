import React, { useEffect } from 'react';
import { View, Pressable, Text } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import Animated, { useAnimatedProps, useDerivedValue, SharedValue } from 'react-native-reanimated';
import { KanjiVGData } from '../data/kanjiVGTypes';
import { useStrokeAnimation, StrokeAnimationConfig } from '../hooks/useStrokeAnimation';
import { KANJIVG_VIEWBOX_SIZE } from '../config/kanjiConfig';
import { useTheme, spacing, borderRadius, useThemedStyles } from '../theme';
import { ColorScheme } from '../theme/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface StrokeAnimatorProps {
  data: KanjiVGData;
  width: number;
  height: number;
  strokeColor?: string;
  strokeWidth?: number;
  animationConfig?: StrokeAnimationConfig;
  autoPlay?: boolean;
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

const createStyles = (colors: ColorScheme) => ({
  container: {
    alignItems: 'center' as const,
  },
  controls: {
    flexDirection: 'row' as const,
    marginTop: spacing.md,
    gap: spacing.md,
  },
  button: {
    paddingHorizontal: spacing.lg + spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accent,
  },
  buttonText: {
    color: colors.accentText,
    fontSize: 14,
    fontWeight: '600' as const,
  },
});

export function StrokeAnimator({
  data,
  width,
  height,
  strokeColor,
  strokeWidth = 6,
  animationConfig,
  autoPlay = true,
  showControls = true,
}: StrokeAnimatorProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const effectiveStrokeColor = strokeColor ?? colors.primary;
  const scale = Math.min(width / KANJIVG_VIEWBOX_SIZE, height / KANJIVG_VIEWBOX_SIZE);

  const { dashOffsets, play, reset } = useStrokeAnimation(data.strokes, animationConfig);

  useEffect(() => {
    if (autoPlay) {
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
              strokeColor={effectiveStrokeColor}
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
