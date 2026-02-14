/**
 * DueBadge — shows SRS due count as a small badge indicator.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useThemedStyles, borderRadius } from '../theme';
import { ColorScheme } from '../theme/colors';

interface DueBadgeProps {
  count: number;
}

const createStyles = (colors: ColorScheme) => ({
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: borderRadius.full,
    backgroundColor: colors.error,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});

export function DueBadge({ count }: DueBadgeProps) {
  const styles = useThemedStyles(createStyles);

  if (count <= 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}
