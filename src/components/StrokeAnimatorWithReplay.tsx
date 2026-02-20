import React, { useState, useCallback } from 'react';
import { View, Pressable, Text } from 'react-native';
import { KanjiVGData } from '../data/kanjiVGTypes';
import { StrokeAnimator } from './StrokeAnimator';
import { spacing, borderRadius, getShadow, typography, useTheme, useThemedStyles } from '../theme';
import { ColorScheme } from '../theme/colors';

interface StrokeAnimatorWithReplayProps {
  kanjiVGData: KanjiVGData;
  width: number;
  height: number;
}

const createStyles = (colors: ColorScheme) => ({
  canvasContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden' as const,
    backgroundColor: colors.canvas,
    ...getShadow(colors, 'medium'),
  },
  buttons: {
    flexDirection: 'row' as const,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  button: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    backgroundColor: colors.accent,
    ...getShadow(colors, 'medium'),
  },
  buttonIcon: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.accentText,
  },
  buttonText: {
    fontSize: typography.button.fontSize,
    fontFamily: typography.button.fontFamily,
    color: colors.accentText,
  },
});

export function StrokeAnimatorWithReplay({
  kanjiVGData,
  width,
  height,
}: StrokeAnimatorWithReplayProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [key, setKey] = useState(0);

  const handleReplay = useCallback(() => {
    setKey((k) => k + 1);
  }, []);

  return (
    <>
      <View style={[styles.canvasContainer, { width, height }]}>
        <StrokeAnimator
          key={key}
          data={kanjiVGData}
          width={width}
          height={height}
          strokeColor={colors.primary}
          strokeWidth={6}
          autoPlay={true}
          showControls={false}
        />
      </View>
      <View style={styles.buttons}>
        <Pressable
          style={({ pressed }) => [styles.button, { opacity: pressed ? 0.8 : 1 }]}
          onPress={handleReplay}
        >
          <Text style={styles.buttonIcon}>{'\u21BB'}</Text>
          <Text style={styles.buttonText}>Replay</Text>
        </Pressable>
      </View>
    </>
  );
}
