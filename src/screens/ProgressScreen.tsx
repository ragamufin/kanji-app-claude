import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { getKanjiStats, getPracticeRecords } from '../data/storage';
import { useTheme, fonts, spacing, typography, useThemedStyles } from '../theme';
import { ColorScheme } from '../theme/colors';

interface KanjiStat {
  character: string;
  bestScore: number;
  attempts: number;
  lastPracticed: number;
}

const createStyles = (colors: ColorScheme) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summaryRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryItem: {
    alignItems: 'center' as const,
  },
  summaryValue: {
    fontSize: 28,
    fontFamily: fonts.serifBold,
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: typography.caption.fontSize,
    fontFamily: fonts.sans,
    color: colors.muted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: typography.label.fontSize,
    fontFamily: fonts.sansMedium,
    color: colors.secondary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  kanjiRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  kanjiChar: {
    fontSize: 32,
    fontFamily: fonts.serif,
    width: 48,
    textAlign: 'center' as const,
    color: colors.primary,
  },
  kanjiInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  scoreText: {
    fontSize: typography.body.fontSize,
    fontFamily: fonts.sansBold,
    color: colors.primary,
  },
  attemptsText: {
    fontSize: typography.caption.fontSize,
    fontFamily: fonts.sans,
    color: colors.muted,
  },
  scoreBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: spacing.xs,
  },
  scoreFill: {
    height: '100%' as const,
    borderRadius: 2,
  },
  emptyText: {
    textAlign: 'center' as const,
    color: colors.muted,
    fontSize: typography.body.fontSize,
    fontFamily: fonts.sans,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  loading: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});

export function ProgressScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [stats, setStats] = useState<KanjiStat[]>([]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getKanjiStats(), getPracticeRecords()]).then(([statsMap, records]) => {
      if (cancelled) return;

      const statsList: KanjiStat[] = [];
      for (const [character, stat] of statsMap) {
        statsList.push({ character, ...stat });
      }
      // Sort by best score descending
      statsList.sort((a, b) => b.bestScore - a.bestScore);

      setStats(statsList);
      setTotalAttempts(records.length);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const avgScore =
    stats.length > 0
      ? Math.round(stats.reduce((sum, s) => sum + s.bestScore, 0) / stats.length)
      : 0;

  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{stats.length}</Text>
          <Text style={styles.summaryLabel}>Kanji Practiced</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalAttempts}</Text>
          <Text style={styles.summaryLabel}>Total Attempts</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{avgScore}%</Text>
          <Text style={styles.summaryLabel}>Avg Best Score</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Per-Kanji Results</Text>

      <FlatList
        data={stats}
        keyExtractor={(item) => item.character}
        renderItem={({ item }) => (
          <View style={styles.kanjiRow}>
            <Text style={styles.kanjiChar}>{item.character}</Text>
            <View style={styles.kanjiInfo}>
              <Text style={styles.scoreText}>Best: {item.bestScore}%</Text>
              <Text style={styles.attemptsText}>
                {item.attempts} attempt{item.attempts !== 1 ? 's' : ''}
              </Text>
              <View style={styles.scoreBar}>
                <View
                  style={[
                    styles.scoreFill,
                    {
                      width: `${item.bestScore}%`,
                      backgroundColor: item.bestScore >= 70 ? colors.accent : colors.error,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No practice data yet. Draw some kanji to see your progress!
          </Text>
        }
      />
    </View>
  );
}
