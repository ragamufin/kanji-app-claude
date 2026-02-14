/**
 * HomeScreen — central hub for the app.
 * Hero cards for Study/SRS, quick stats, and secondary actions.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeActionCard } from '../components/HomeActionCard';
import { DueBadge } from '../components/DueBadge';
import { useFSRS } from '../hooks/useFSRS';
import { getKanjiStats, getPracticeRecords } from '../data/storage';
import {
  useTheme,
  spacing,
  borderRadius,
  typography,
  getShadow,
  useThemedStyles,
} from '../theme';
import { ColorScheme } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const createStyles = (colors: ColorScheme) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...getShadow(colors, 'low'),
  },
  heroRow: {
    flexDirection: 'row' as const,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    ...getShadow(colors, 'low'),
  },
  statItem: {
    alignItems: 'center' as const,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.muted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.secondary,
    marginBottom: spacing.md,
  },
  secondaryGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.md,
  },
  secondaryItem: {
    width: '47%' as const,
  },
});

export function HomeScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation<HomeNavProp>();
  const { dueCount } = useFSRS();
  const [kanjiCount, setKanjiCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getKanjiStats(), getPracticeRecords()]).then(
      ([statsMap, records]) => {
        if (cancelled) return;
        setKanjiCount(statsMap.size);
        setTotalAttempts(records.length);
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Kanji</Text>
        <Pressable
          style={({ pressed }) => [
            styles.settingsButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={{ fontSize: 20 }}>{'\u2699\uFE0F'}</Text>
        </Pressable>
      </View>

      {/* Hero cards: Study + SRS */}
      <View style={styles.heroRow}>
        <HomeActionCard
          title="Study"
          subtitle="Learn new kanji"
          icon={'\uD83D\uDCDA'}
          variant="hero"
          accentColor={colors.accent}
          onPress={() => navigation.navigate('StudySetup', { sessionType: 'study' })}
        />
        <HomeActionCard
          title="Review"
          subtitle={dueCount > 0 ? `${dueCount} due today` : 'All caught up'}
          icon={'\uD83D\uDD04'}
          variant="hero"
          accentColor={colors.success}
          badge={<DueBadge count={dueCount} />}
          onPress={() => navigation.navigate('StudySetup', { sessionType: 'srs' })}
        />
      </View>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{kanjiCount}</Text>
          <Text style={styles.statLabel}>Practiced</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalAttempts}</Text>
          <Text style={styles.statLabel}>Attempts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{dueCount}</Text>
          <Text style={styles.statLabel}>Due</Text>
        </View>
      </View>

      {/* Secondary actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.secondaryGrid}>
        <View style={styles.secondaryItem}>
          <HomeActionCard
            title="Free Practice"
            subtitle="Open drawing"
            icon={'\u270E\uFE0F'}
            variant="compact"
            onPress={() => navigation.navigate('Practice')}
          />
        </View>
        <View style={styles.secondaryItem}>
          <HomeActionCard
            title="Browse"
            subtitle="Explore kanji"
            icon={'\uD83D\uDD0D'}
            variant="compact"
            onPress={() => navigation.navigate('Browse')}
          />
        </View>
        <View style={styles.secondaryItem}>
          <HomeActionCard
            title="Lists"
            subtitle="Custom lists"
            icon={'\uD83D\uDCCB'}
            variant="compact"
            onPress={() => navigation.navigate('Lists')}
          />
        </View>
        <View style={styles.secondaryItem}>
          <HomeActionCard
            title="Progress"
            subtitle="Your stats"
            icon={'\uD83D\uDCCA'}
            variant="compact"
            onPress={() => navigation.navigate('Progress')}
          />
        </View>
      </View>
    </ScrollView>
  );
}
