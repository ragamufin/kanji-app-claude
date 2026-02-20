/**
 * HomeScreen — central hub for the app.
 * Hero cards for Study/SRS, quick stats, and secondary actions.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeActionCard } from '../components/HomeActionCard';
import { DueBadge } from '../components/DueBadge';
import { Icon } from '../components/Icon';
import { useFSRS } from '../hooks/useFSRS';
import { useStaggeredEntrance, useStaggeredItemStyle } from '../hooks/useStaggeredEntrance';
import { getKanjiStats, getPracticeRecords } from '../data/storage';
import {
  useTheme,
  fonts,
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
    fontSize: 32,
    fontFamily: fonts.serifBold,
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
    fontFamily: fonts.serifBold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.caption.fontSize,
    fontFamily: fonts.sans,
    color: colors.muted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: typography.label.fontSize,
    fontFamily: fonts.sansMedium,
    color: colors.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
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

function StaggeredItem({
  index,
  progress,
  delayMs,
  translateY,
  children,
}: {
  index: number;
  progress: SharedValue<number>;
  delayMs: number;
  translateY: number;
  children: React.ReactNode;
}) {
  const style = useStaggeredItemStyle(index, progress, delayMs, translateY);
  return <Animated.View style={style}>{children}</Animated.View>;
}

export function HomeScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation<HomeNavProp>();
  const { dueCount } = useFSRS();
  const [kanjiCount, setKanjiCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const { progress, delayMs, translateY } = useStaggeredEntrance(8);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getKanjiStats(), getPracticeRecords()]).then(([statsMap, records]) => {
      if (cancelled) return;
      setKanjiCount(statsMap.size);
      setTotalAttempts(records.length);
    });
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
          style={({ pressed }) => [styles.settingsButton, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon name="settings" size={20} color={colors.secondary} />
        </Pressable>
      </View>

      {/* Hero cards: Study + SRS */}
      <StaggeredItem index={0} progress={progress} delayMs={delayMs} translateY={translateY}>
        <View style={styles.heroRow}>
          <HomeActionCard
            title="Study"
            subtitle="Learn new kanji"
            icon="book-open"
            variant="hero"
            accentColor={colors.accent}
            onPress={() => navigation.navigate('StudySetup', { sessionType: 'study' })}
          />
          <HomeActionCard
            title="Review"
            subtitle={dueCount > 0 ? `${dueCount} due today` : 'All caught up'}
            icon="refresh-cw"
            variant="hero"
            accentColor={colors.success}
            badge={<DueBadge count={dueCount} />}
            onPress={() => navigation.navigate('StudySetup', { sessionType: 'srs' })}
          />
        </View>
      </StaggeredItem>

      {/* Quick stats */}
      <StaggeredItem index={1} progress={progress} delayMs={delayMs} translateY={translateY}>
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
      </StaggeredItem>

      {/* Secondary actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.secondaryGrid}>
        <StaggeredItem index={2} progress={progress} delayMs={delayMs} translateY={translateY}>
          <View style={styles.secondaryItem}>
            <HomeActionCard
              title="Free Practice"
              subtitle="Open drawing"
              icon="edit-3"
              variant="compact"
              onPress={() => navigation.navigate('Practice')}
            />
          </View>
        </StaggeredItem>
        <StaggeredItem index={3} progress={progress} delayMs={delayMs} translateY={translateY}>
          <View style={styles.secondaryItem}>
            <HomeActionCard
              title="Browse"
              subtitle="Explore kanji"
              icon="search"
              variant="compact"
              onPress={() => navigation.navigate('Browse')}
            />
          </View>
        </StaggeredItem>
        <StaggeredItem index={4} progress={progress} delayMs={delayMs} translateY={translateY}>
          <View style={styles.secondaryItem}>
            <HomeActionCard
              title="Lists"
              subtitle="Custom lists"
              icon="list"
              variant="compact"
              onPress={() => navigation.navigate('Lists')}
            />
          </View>
        </StaggeredItem>
        <StaggeredItem index={5} progress={progress} delayMs={delayMs} translateY={translateY}>
          <View style={styles.secondaryItem}>
            <HomeActionCard
              title="Progress"
              subtitle="Your stats"
              icon="bar-chart-2"
              variant="compact"
              onPress={() => navigation.navigate('Progress')}
            />
          </View>
        </StaggeredItem>
      </View>
    </ScrollView>
  );
}
