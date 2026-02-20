/**
 * SettingsScreen — user preferences for theme, stroke mode, SRS, and data management.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { StrokeMode } from '../utils/strokeUtils';
import {
  getPreferences,
  savePreferences,
  UserPreferences,
  clearAllData,
} from '../data/storage';
import { clearFSRSData } from '../data/fsrsStorage';
import { clearListData } from '../data/listStorage';
import {
  useTheme,
  fonts,
  spacing,
  borderRadius,
  typography,
  useThemedStyles,
  ThemeMode,
} from '../theme';
import { ColorScheme } from '../theme/colors';

const createStyles = (colors: ColorScheme) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.caption.fontSize,
    fontFamily: fonts.sansBold,
    color: colors.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowFirst: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowLabel: {
    fontSize: typography.body.fontSize,
    fontFamily: fonts.sansMedium,
    color: colors.primary,
    flex: 1,
  },
  rowValue: {
    fontSize: typography.body.fontSize,
    fontFamily: fonts.sans,
    color: colors.muted,
  },
  optionRow: {
    flexDirection: 'row' as const,
    gap: spacing.sm,
  },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  optionText: {
    fontSize: typography.caption.fontSize,
    fontFamily: fonts.sansBold,
    color: colors.secondary,
  },
  optionTextSelected: {
    color: colors.accentText,
  },
  toggleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
  },
  toggleActive: {
    backgroundColor: colors.accent,
  },
  toggleText: {
    fontSize: typography.caption.fontSize,
    fontFamily: fonts.sansBold,
    color: colors.secondary,
  },
  toggleTextActive: {
    color: colors.accentText,
  },
  destructiveRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  destructiveText: {
    fontSize: typography.body.fontSize,
    fontFamily: fonts.sansBold,
    color: colors.error,
  },
  aboutText: {
    fontSize: typography.caption.fontSize,
    fontFamily: fonts.sans,
    color: colors.muted,
    textAlign: 'center' as const,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const STROKE_OPTIONS: { value: StrokeMode; label: string }[] = [
  { value: 'basic', label: 'Basic' },
  { value: 'smooth', label: 'Smooth' },
  { value: 'brush', label: 'Brush' },
];

export function SettingsScreen() {
  const styles = useThemedStyles(createStyles);
  const { mode: themeMode, setMode: setThemeMode } = useTheme();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);

  useEffect(() => {
    getPreferences().then(setPrefs);
  }, []);

  const updatePref = useCallback(
    async (update: Partial<UserPreferences>) => {
      await savePreferences(update);
      setPrefs((prev) => (prev ? { ...prev, ...update } : prev));
    },
    []
  );

  const handleClearPractice = useCallback(() => {
    Alert.alert(
      'Clear Practice Data',
      'This will delete all practice records and scores. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Done', 'Practice data cleared.');
          },
        },
      ]
    );
  }, []);

  const handleClearSRS = useCallback(() => {
    Alert.alert(
      'Reset SRS Data',
      'This will reset all spaced repetition progress. All cards will be treated as new.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearFSRSData();
            Alert.alert('Done', 'SRS data reset.');
          },
        },
      ]
    );
  }, []);

  const handleClearLists = useCallback(() => {
    Alert.alert(
      'Delete All Lists',
      'This will delete all custom lists. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await clearListData();
            Alert.alert('Done', 'All lists deleted.');
          },
        },
      ]
    );
  }, []);

  if (!prefs) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Appearance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={[styles.row, styles.rowFirst]}>
          <Text style={styles.rowLabel}>Theme</Text>
          <View style={styles.optionRow}>
            {THEME_OPTIONS.map(({ value, label }) => {
              const selected = themeMode === value;
              return (
                <Pressable
                  key={value}
                  style={[
                    styles.optionChip,
                    selected && styles.optionChipSelected,
                  ]}
                  onPress={() => {
                    setThemeMode(value);
                    updatePref({ themeMode: value });
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* Drawing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Drawing</Text>
        <View style={[styles.row, styles.rowFirst]}>
          <Text style={styles.rowLabel}>Default Stroke Mode</Text>
          <View style={styles.optionRow}>
            {STROKE_OPTIONS.map(({ value, label }) => {
              const selected = prefs.strokeMode === value;
              return (
                <Pressable
                  key={value}
                  style={[
                    styles.optionChip,
                    selected && styles.optionChipSelected,
                  ]}
                  onPress={() => updatePref({ strokeMode: value })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* SRS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spaced Repetition</Text>
        <View style={[styles.row, styles.rowFirst]}>
          <Text style={styles.rowLabel}>Daily New Cards</Text>
          <View style={styles.optionRow}>
            {[5, 10, 20, 50].map((n) => {
              const selected = prefs.dailyNewCardLimit === n;
              return (
                <Pressable
                  key={n}
                  style={[
                    styles.optionChip,
                    selected && styles.optionChipSelected,
                  ]}
                  onPress={() => updatePref({ dailyNewCardLimit: n })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {n}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* Lists */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lists</Text>
        <View style={[styles.row, styles.rowFirst]}>
          <Text style={styles.rowLabel}>Confirm before deleting items</Text>
          <Pressable
            style={[
              styles.toggleButton,
              prefs.deleteConfirmation && styles.toggleActive,
            ]}
            onPress={() =>
              updatePref({ deleteConfirmation: !prefs.deleteConfirmation })
            }
          >
            <Text
              style={[
                styles.toggleText,
                prefs.deleteConfirmation && styles.toggleTextActive,
              ]}
            >
              {prefs.deleteConfirmation ? 'ON' : 'OFF'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <Pressable
          style={[styles.destructiveRow, styles.rowFirst]}
          onPress={handleClearPractice}
        >
          <Text style={styles.destructiveText}>Clear Practice Data</Text>
        </Pressable>
        <Pressable style={styles.destructiveRow} onPress={handleClearSRS}>
          <Text style={styles.destructiveText}>Reset SRS Progress</Text>
        </Pressable>
        <Pressable style={styles.destructiveRow} onPress={handleClearLists}>
          <Text style={styles.destructiveText}>Delete All Lists</Text>
        </Pressable>
      </View>

      {/* About */}
      <Text style={styles.aboutText}>Kanji Practice App v1.0.0</Text>
    </ScrollView>
  );
}
