/**
 * HomeActionCard — large CTA card for the home screen.
 * Used for Study and SRS hero cards, and smaller secondary action cards.
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { Icon, IconName } from './Icon';
import { useAnimatedPress } from '../utils/animations';
import {
  useThemedStyles,
  spacing,
  borderRadius,
  typography,
  fonts,
  getShadow,
} from '../theme';
import { ColorScheme } from '../theme/colors';

interface HomeActionCardProps {
  title: string;
  subtitle?: string;
  icon: IconName;
  /** Large hero style or compact grid style */
  variant: 'hero' | 'compact';
  onPress: () => void;
  /** Optional right-side badge or content */
  badge?: React.ReactNode;
  /** Optional accent color override */
  accentColor?: string;
}

const createStyles = (colors: ColorScheme) => ({
  heroCard: {
    flex: 1,
    minHeight: 140,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    justifyContent: 'space-between' as const,
    borderWidth: 1,
    borderColor: colors.border,
    ...getShadow(colors, 'medium'),
  },
  compactCard: {
    flex: 1,
    minHeight: 90,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    justifyContent: 'space-between' as const,
    borderWidth: 1,
    borderColor: colors.border,
    ...getShadow(colors, 'low'),
  },
  headerRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  compactIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: fonts.sansBold,
    color: colors.primary,
    marginTop: spacing.md,
  },
  heroSubtitle: {
    fontSize: typography.body.fontSize,
    fontFamily: fonts.sans,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  compactTitle: {
    fontSize: typography.button.fontSize,
    fontFamily: fonts.sansBold,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  compactSubtitle: {
    fontSize: typography.caption.fontSize,
    fontFamily: fonts.sans,
    color: colors.muted,
    marginTop: 2,
  },
});

export function HomeActionCard({
  title,
  subtitle,
  icon,
  variant,
  onPress,
  badge,
  accentColor,
}: HomeActionCardProps) {
  const styles = useThemedStyles(createStyles);
  const { animatedStyle, onPressIn, onPressOut } = useAnimatedPress();
  const isHero = variant === 'hero';

  return (
    <Animated.View style={[isHero ? styles.heroCard : styles.compactCard, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={{ flex: 1, justifyContent: 'space-between' }}
      >
        <View style={styles.headerRow}>
          <View
            style={[
              isHero ? styles.iconContainer : styles.compactIconContainer,
              {
                backgroundColor: accentColor
                  ? accentColor + '18'
                  : 'rgba(128,128,128,0.1)',
              },
            ]}
          >
            <Icon
              name={icon}
              size={isHero ? 20 : 16}
              color={accentColor || '#888'}
            />
          </View>
          {badge}
        </View>
        <View>
          <Text style={isHero ? styles.heroTitle : styles.compactTitle}>
            {title}
          </Text>
          {subtitle && (
            <Text style={isHero ? styles.heroSubtitle : styles.compactSubtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
