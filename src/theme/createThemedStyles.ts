import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from './index';
import { ColorScheme } from './colors';

/**
 * Create themed styles that automatically update when the theme changes.
 * Usage:
 *   const styles = useThemedStyles((colors) => ({
 *     container: { backgroundColor: colors.background },
 *   }));
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (colors: ColorScheme) => T
): T {
  const { colors } = useTheme();
  return useMemo(() => StyleSheet.create(factory(colors)), [colors, factory]);
}
