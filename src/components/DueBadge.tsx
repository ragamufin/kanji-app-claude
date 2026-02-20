/**
 * DueBadge — shows SRS due count as a small badge indicator.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useThemedStyles, borderRadius, fonts } from '../theme';
import { ColorScheme } from '../theme/colors';

interface DueBadgeProps {
  count: number;
}

const createStyles = (colors: ColorScheme) => ({
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: borderRadius.full,
    backgroundColor: colors.error,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 5,
  },
  text: {
    fontSize: 11,
    fontFamily: fonts.sansBold,
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
