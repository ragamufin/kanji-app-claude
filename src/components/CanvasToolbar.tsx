import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { StrokeMode } from '../utils/strokeUtils';
import { spacing, borderRadius, typography, getShadow, useTheme, useThemedStyles } from '../theme';
import { ColorScheme } from '../theme/colors';

const STROKE_MODES: { mode: StrokeMode; label: string; icon: string }[] = [
  { mode: 'basic', label: 'Basic', icon: '\u2014' },
  { mode: 'smooth', label: 'Smooth', icon: '\u223F' },
  { mode: 'brush', label: 'Brush', icon: '\uD83D\uDD8C' },
];

interface CanvasToolbarProps {
  strokeMode: StrokeMode;
  onStrokeModeChange: (mode: StrokeMode) => void;
  strokeCount: number;
  showCheck: boolean;
  onUndo: () => void;
  onClear: () => void;
  onCheck: () => void;
}

const createStyles = (colors: ColorScheme) => ({
  modeSelector: {
    flexDirection: 'row' as const,
    marginBottom: spacing.md,
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    backgroundColor: colors.surface,
    ...getShadow(colors, 'low'),
  },
  modeButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  modeButtonIcon: {
    fontSize: 14,
  },
  modeButtonText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.button.fontWeight,
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
  },
  buttonIcon: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  buttonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  strokeCount: {
    marginTop: spacing.md,
    fontSize: typography.caption.fontSize,
    color: colors.muted,
  },
});

export function CanvasToolbar({
  strokeMode,
  onStrokeModeChange,
  strokeCount,
  showCheck,
  onUndo,
  onClear,
  onCheck,
}: CanvasToolbarProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <>
      {/* Stroke Mode Selector */}
      <View style={styles.modeSelector}>
        {STROKE_MODES.map(({ mode, label, icon }) => {
          const isActive = strokeMode === mode;
          return (
            <Pressable
              key={mode}
              style={({ pressed }) => [
                styles.modeButton,
                {
                  backgroundColor: isActive ? colors.secondary : 'transparent',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => onStrokeModeChange(mode)}
            >
              <Text style={[styles.modeButtonIcon, { color: isActive ? colors.accentText : colors.muted }]}>
                {icon}
              </Text>
              <Text
                style={[styles.modeButtonText, { color: isActive ? colors.accentText : colors.secondary }]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttons}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: colors.surface,
              opacity: pressed ? 0.8 : 1,
              ...getShadow(colors, 'low'),
            },
          ]}
          onPress={onUndo}
        >
          <Text style={[styles.buttonIcon, { color: colors.secondary }]}>{'\u21A9'}</Text>
          <Text style={[styles.buttonText, { color: colors.secondary }]}>Undo</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: colors.surface,
              opacity: pressed ? 0.8 : 1,
              ...getShadow(colors, 'low'),
            },
          ]}
          onPress={onClear}
        >
          <Text style={[styles.buttonIcon, { color: colors.secondary }]}>{'\u2715'}</Text>
          <Text style={[styles.buttonText, { color: colors.secondary }]}>Clear</Text>
        </Pressable>

        {showCheck && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: colors.accent,
                opacity: pressed ? 0.8 : 1,
                ...getShadow(colors, 'medium'),
              },
            ]}
            onPress={onCheck}
          >
            <Text style={[styles.buttonIcon, { color: colors.accentText }]}>{'\u2713'}</Text>
            <Text style={[styles.buttonText, { color: colors.accentText }]}>Check</Text>
          </Pressable>
        )}
      </View>

      {/* Stroke Count */}
      <Text style={styles.strokeCount}>
        {strokeCount} {strokeCount === 1 ? 'stroke' : 'strokes'}
      </Text>
    </>
  );
}
