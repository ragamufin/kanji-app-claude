/**
 * StudyCard — flip card with front/back for Study and SRS modes.
 *
 * Front: keyword (regular mode) or kanji character (reverse mode)
 * Back: hidden side + metadata + action buttons
 * Uses 3D perspective flip animation via react-native-reanimated.
 */

import React, { useCallback, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
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
import { Icon } from './Icon';
import { useFlipAnimation } from '../utils/animations';
import {
  spacing,
  borderRadius,
  typography,
  fonts,
  getShadow,
  useThemedStyles,
} from '../theme';
import { ColorScheme } from '../theme/colors';

interface StudyCardProps {
  kanji: KanjiVGData;
  mode: StudyMode;
  isRevealed: boolean;
  onReveal: () => void;
  onPractice: () => void;
  onDemo: () => void;
  showGradeButtons: boolean;
  onGrade?: (rating: Rating) => void;
  onNext?: () => void;
  cardState?: FSRSCardState;
}

const GRADE_COLORS: Record<number, string> = {
  [Rating.Again]: '#B91C1C',
  [Rating.Hard]: '#B45309',
  [Rating.Good]: '#3F6B54',
  [Rating.Easy]: '#1D6A96',
};

const GRADE_ICONS: Record<number, 'x-circle' | 'minus-circle' | 'check-circle' | 'zap'> = {
  [Rating.Again]: 'x-circle',
  [Rating.Hard]: 'minus-circle',
  [Rating.Good]: 'check-circle',
  [Rating.Easy]: 'zap',
};

const createStyles = (colors: ColorScheme) => ({
  cardWrapper: {
    width: '100%' as const,
    minHeight: 320,
  },
  card: {
    width: '100%' as const,
    minHeight: 320,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
    fontFamily: fonts.sans,
    fontStyle: 'italic' as const,
    color: colors.muted,
    marginTop: spacing.lg,
  },
  kanjiLarge: {
    fontSize: 96,
    fontFamily: fonts.serifBold,
    color: colors.primary,
    lineHeight: 110,
  },
  keywordLarge: {
    fontSize: 32,
    fontFamily: fonts.serifMedium,
    color: colors.primary,
    textAlign: 'center' as const,
  },
  backHeader: {
    alignItems: 'center' as const,
    marginBottom: spacing.lg,
  },
  backKanji: {
    fontSize: 64,
    fontFamily: fonts.serifBold,
    color: colors.primary,
    lineHeight: 76,
  },
  backKeyword: {
    fontSize: typography.meaning.fontSize,
    fontFamily: typography.meaning.fontFamily,
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
    fontFamily: fonts.sansMedium,
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
    fontFamily: typography.button.fontFamily,
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
    borderRadius: borderRadius.full,
    maxWidth: 90,
    gap: 2,
  },
  gradeLabel: {
    fontSize: typography.button.fontSize,
    fontFamily: typography.button.fontFamily,
    color: '#FFFFFF',
  },
  gradeInterval: {
    fontSize: 11,
    fontFamily: fonts.sans,
    color: 'rgba(255,255,255,0.8)',
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
    fontFamily: typography.button.fontFamily,
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
  const { frontStyle, backStyle, flip, reset } = useFlipAnimation();

  // Determine what shows on front vs back based on mode
  const effectiveMode = mode === 'random'
    ? (Math.random() > 0.5 ? 'regular' : 'reverse')
    : mode;
  const showKanjiOnFront = effectiveMode === 'reverse';

  const handleReveal = useCallback(() => {
    if (isRevealed) return;
    onReveal();
    flip();
  }, [isRevealed, onReveal, flip]);

  // Reset animation when card changes
  useEffect(() => {
    reset();
  }, [kanji.character, reset]);

  // Compute preview intervals for grade buttons
  const intervals = cardState ? previewGrades(cardState) : null;

  return (
    <View style={styles.cardWrapper}>
      {/* Front side */}
      <Animated.View style={[styles.card, frontStyle, StyleSheet.absoluteFillObject]}>
        <Pressable style={styles.frontSide} onPress={handleReveal}>
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

      {/* Back side */}
      <Animated.View style={[styles.card, backStyle]}>
        <View style={styles.backSide}>
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
              <Icon name="edit-3" size={16} color={styles.actionButtonText.color} />
              <Text style={styles.actionButtonText}>Practice</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={onDemo}
            >
              <Icon name="play" size={16} color={styles.actionButtonText.color} />
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
                  <Icon name={GRADE_ICONS[rating]} size={16} color="#FFFFFF" />
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
        </View>
      </Animated.View>
    </View>
  );
}
