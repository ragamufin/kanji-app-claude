/**
 * HomeActionCard — large CTA card for the home screen.
 * Used for Study and SRS hero cards, and smaller secondary action cards.
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  useThemedStyles,
  spacing,
  borderRadius,
  typography,
  getShadow,
} from '../theme';
import { ColorScheme } from '../theme/colors';

interface HomeActionCardProps {
  title: string;
  subtitle?: string;
  icon: string;
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
    ...getShadow(colors, 'medium'),
  },
  compactCard: {
    flex: 1,
    minHeight: 90,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    justifyContent: 'space-between' as const,
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
  iconText: {
    fontSize: 22,
  },
  compactIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  compactIconText: {
    fontSize: 18,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.primary,
    marginTop: spacing.md,
  },
  heroSubtitle: {
    fontSize: typography.body.fontSize,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  compactTitle: {
    fontSize: typography.button.fontSize,
    fontWeight: '600' as const,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  compactSubtitle: {
    fontSize: typography.caption.fontSize,
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
  const isHero = variant === 'hero';

  return (
    <Pressable
      style={({ pressed }) => [
        isHero ? styles.heroCard : styles.compactCard,
        { opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={onPress}
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
          <Text style={isHero ? styles.iconText : styles.compactIconText}>
            {icon}
          </Text>
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
  );
}
