/**
 * StudyCard — flip card with front/back for Study and SRS modes.
 *
 * Front: keyword (regular mode) or kanji character (reverse mode)
 * Back: hidden side + metadata + action buttons
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { KanjiVGData } from '../data/kanjiVGTypes';
import { StudyMode } from '../config/studyConfig';
import {
  Rating,
  GRADE_LABELS,
  GRADES,
  formatInterval,
  previewGrades,
  FSRSCardState,
} from '../utils/spacedRepetition';
import {
  spacing,
  borderRadius,
  typography,
  getShadow,
  useThemedStyles,
} from '../theme';
import { ColorScheme } from '../theme/colors';

interface StudyCardProps {
  /** Kanji data to display */
  kanji: KanjiVGData;
  /** Display mode */
  mode: StudyMode;
  /** Whether card is currently revealed */
  isRevealed: boolean;
  /** Callback when card is tapped to reveal */
  onReveal: () => void;
  /** Callback for practice button */
  onPractice: () => void;
  /** Callback for demo button */
  onDemo: () => void;
  /** Whether to show SRS grade buttons */
  showGradeButtons: boolean;
  /** Callback when grade button pressed (SRS mode) */
  onGrade?: (rating: Rating) => void;
  /** Callback for "Next" button (study mode) */
  onNext?: () => void;
  /** FSRS card state for interval preview */
  cardState?: FSRSCardState;
}

const GRADE_COLORS: Record<number, string> = {
  [Rating.Again]: '#C45B4D',
  [Rating.Hard]: '#C49B4D',
  [Rating.Good]: '#4A7C59',
  [Rating.Easy]: '#4A6A7C',
};

const createStyles = (colors: ColorScheme) => ({
  card: {
    width: '100%' as const,
    minHeight: 320,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    ...getShadow(colors, 'medium'),
    overflow: 'hidden' as const,
  },
  frontSide: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: spacing.xl,
    minHeight: 320,
  },
  backSide: {
    padding: spacing.xl,
    minHeight: 320,
  },
  tapHint: {
    fontSize: typography.caption.fontSize,
    color: colors.muted,
    marginTop: spacing.lg,
  },
  kanjiLarge: {
    fontSize: 96,
    fontWeight: '300' as const,
    color: colors.primary,
    lineHeight: 110,
  },
  keywordLarge: {
    fontSize: 32,
    fontWeight: '600' as const,
    color: colors.primary,
    textAlign: 'center' as const,
  },
  backHeader: {
    alignItems: 'center' as const,
    marginBottom: spacing.lg,
  },
  backKanji: {
    fontSize: 64,
    fontWeight: '300' as const,
    color: colors.primary,
    lineHeight: 76,
  },
  backKeyword: {
    fontSize: typography.meaning.fontSize,
    fontWeight: typography.meaning.fontWeight,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  metadataRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'center' as const,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
  },
  badgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '500' as const,
    color: colors.secondary,
  },
  actionRow: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    gap: spacing.xs,
  },
  actionButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    color: colors.accent,
  },
  gradeRow: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  gradeButton: {
    flex: 1,
    alignItems: 'center' as const,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    maxWidth: 90,
  },
  gradeLabel: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    color: '#FFFFFF',
  },
  gradeInterval: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  nextButton: {
    alignItems: 'center' as const,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    marginTop: spacing.sm,
    alignSelf: 'center' as const,
  },
  nextButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    color: colors.accentText,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
});

export function StudyCard({
  kanji,
  mode,
  isRevealed,
  onReveal,
  onPractice,
  onDemo,
  showGradeButtons,
  onGrade,
  onNext,
  cardState,
}: StudyCardProps) {
  const styles = useThemedStyles(createStyles);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [showBack, setShowBack] = useState(false);

  // Determine what shows on front vs back based on mode
  const effectiveMode = mode === 'random'
    ? (Math.random() > 0.5 ? 'regular' : 'reverse')
    : mode;
  const showKanjiOnFront = effectiveMode === 'reverse';

  const handleReveal = useCallback(() => {
    if (isRevealed) return;
    onReveal();
    Animated.timing(flipAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowBack(true);
    });
  }, [isRevealed, onReveal, flipAnim]);

  // Reset animation when card changes
  React.useEffect(() => {
    flipAnim.setValue(0);
    setShowBack(false);
  }, [kanji.character, flipAnim]);

  // Compute preview intervals for grade buttons
  const intervals = cardState ? previewGrades(cardState) : null;

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.card}>
      {/* Front side */}
      {!showBack && (
        <Animated.View style={[{ opacity: frontOpacity }]}>
          <Pressable
            style={({ pressed }) => [
              styles.frontSide,
              { opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={handleReveal}
          >
            {showKanjiOnFront ? (
              <Text style={styles.kanjiLarge}>{kanji.character}</Text>
            ) : (
              <Text style={styles.keywordLarge}>
                {kanji.heisigKeyword || kanji.meaning}
              </Text>
            )}
            <Text style={styles.tapHint}>Tap to reveal</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Back side */}
      {showBack && (
        <Animated.View style={[styles.backSide, { opacity: backOpacity }]}>
          {/* Header: shows the hidden side */}
          <View style={styles.backHeader}>
            <Text style={styles.backKanji}>{kanji.character}</Text>
            <Text style={styles.backKeyword}>
              {kanji.heisigKeyword || kanji.meaning}
            </Text>
          </View>

          {/* Metadata badges */}
          <View style={styles.metadataRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {kanji.strokes.length} stroke{kanji.strokes.length !== 1 ? 's' : ''}
              </Text>
            </View>
            {kanji.jlpt && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{kanji.jlpt}</Text>
              </View>
            )}
            {kanji.heisigIndex && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>RTK #{kanji.heisigIndex}</Text>
              </View>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={onPractice}
            >
              <Text style={{ fontSize: 16 }}>{'\u270E'}</Text>
              <Text style={styles.actionButtonText}>Practice</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={onDemo}
            >
              <Text style={{ fontSize: 16 }}>{'\u25B6'}</Text>
              <Text style={styles.actionButtonText}>Demo</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* Grade buttons (SRS) or Next button (Study) */}
          {showGradeButtons && onGrade ? (
            <View style={styles.gradeRow}>
              {GRADES.map((rating) => (
                <Pressable
                  key={rating}
                  style={({ pressed }) => [
                    styles.gradeButton,
                    {
                      backgroundColor: GRADE_COLORS[rating],
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  onPress={() => onGrade(rating)}
                >
                  <Text style={styles.gradeLabel}>{GRADE_LABELS[rating]}</Text>
                  {intervals && (
                    <Text style={styles.gradeInterval}>
                      {formatInterval(intervals[rating])}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>
          ) : onNext ? (
            <Pressable
              style={({ pressed }) => [
                styles.nextButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={onNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </Pressable>
          ) : null}
        </Animated.View>
      )}
    </View>
  );
}
