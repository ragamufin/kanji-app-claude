import React from 'react';
import { View, Pressable, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { StrokeMode } from '../utils/strokeUtils';
import { Icon, IconName } from './Icon';
import { useAnimatedPress } from '../utils/animations';
import { spacing, borderRadius, typography, fonts, getShadow, useTheme, useThemedStyles } from '../theme';
import { ColorScheme } from '../theme/colors';

const STROKE_MODES: { mode: StrokeMode; label: string; icon: IconName }[] = [
  { mode: 'basic', label: 'Basic', icon: 'minus' },
  { mode: 'smooth', label: 'Smooth', icon: 'activity' },
  { mode: 'brush', label: 'Brush', icon: 'edit-3' },
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
    borderWidth: 1,
    borderColor: colors.border,
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
  modeButtonText: {
    fontSize: typography.caption.fontSize,
    fontFamily: fonts.sansBold,
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
  buttonText: {
    fontSize: typography.button.fontSize,
    fontFamily: typography.button.fontFamily,
  },
  strokeCount: {
    marginTop: spacing.md,
    fontSize: typography.caption.fontSize,
    fontFamily: fonts.sans,
    color: colors.muted,
  },
});

function ActionButton({
  icon,
  label,
  color,
  bgColor,
  shadow,
  onPress,
}: {
  icon: IconName;
  label: string;
  color: string;
  bgColor: string;
  shadow?: object;
  onPress: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  const { animatedStyle, onPressIn, onPressOut } = useAnimatedPress();

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={[styles.button, { backgroundColor: bgColor, ...shadow }]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Icon name={icon} size={16} color={color} />
        <Text style={[styles.buttonText, { color }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

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
              style={[
                styles.modeButton,
                {
                  backgroundColor: isActive ? colors.accent : 'transparent',
                },
              ]}
              onPress={() => onStrokeModeChange(mode)}
            >
              <Icon name={icon} size={14} color={isActive ? colors.accentText : colors.muted} />
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
        <ActionButton
          icon="corner-up-left"
          label="Undo"
          color={colors.secondary}
          bgColor={colors.surface}
          shadow={getShadow(colors, 'low')}
          onPress={onUndo}
        />
        <ActionButton
          icon="trash-2"
          label="Clear"
          color={colors.secondary}
          bgColor={colors.surface}
          shadow={getShadow(colors, 'low')}
          onPress={onClear}
        />
        {showCheck && (
          <ActionButton
            icon="check"
            label="Check"
            color={colors.accentText}
            bgColor={colors.accent}
            shadow={getShadow(colors, 'medium')}
            onPress={onCheck}
          />
        )}
      </View>

      {/* Stroke Count */}
      <Text style={styles.strokeCount}>
        {strokeCount} {strokeCount === 1 ? 'stroke' : 'strokes'}
      </Text>
    </>
  );
}
