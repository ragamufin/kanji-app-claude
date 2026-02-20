import React from 'react';
import { View, Text } from 'react-native';
import { ValidationResult } from '../utils/validationUtils';
import { Icon } from './Icon';
import { spacing, borderRadius, typography, fonts, useTheme, useThemedStyles } from '../theme';
import { ColorScheme } from '../theme/colors';

interface ValidationMessageProps {
  result: ValidationResult;
}

const createStyles = (colors: ColorScheme) => ({
  container: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center' as const,
    minWidth: 200,
    borderWidth: 1,
  },
  titleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.sansBold,
  },
  score: {
    fontSize: 22,
    fontFamily: fonts.serifBold,
    marginBottom: spacing.xs,
    color: colors.primary,
  },
  text: {
    fontSize: typography.body.fontSize,
    fontFamily: fonts.sans,
    color: colors.primary,
  },
  perStrokeContainer: {
    marginTop: spacing.sm,
    width: '100%' as const,
    gap: 4,
  },
  perStrokeRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
  },
  perStrokeText: {
    fontSize: 12,
    fontFamily: fonts.sans,
    width: 60,
    color: colors.primary,
  },
  accuracyBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden' as const,
    backgroundColor: colors.border,
  },
  accuracyFill: {
    height: '100%' as const,
    borderRadius: 3,
  },
  perStrokeAccuracy: {
    fontSize: 11,
    fontFamily: fonts.sans,
    width: 32,
    textAlign: 'right' as const,
    color: colors.muted,
  },
  orderWarning: {
    fontSize: 10,
    fontFamily: fonts.sansBold,
    color: colors.error,
  },
});

export function ValidationMessage({ result }: ValidationMessageProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const {
    strokeCountMatch,
    expectedStrokes,
    actualStrokes,
    overallMatch,
    overallScore,
    strokeOrderCorrect,
    perStroke,
  } = result;

  const statusColor = overallMatch ? colors.success : colors.error;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: overallMatch ? colors.successLight : colors.errorLight,
          borderColor: statusColor,
        },
      ]}
    >
      <View style={styles.titleRow}>
        <Icon
          name={overallMatch ? 'check-circle' : 'x-circle'}
          size={20}
          color={statusColor}
        />
        <Text style={[styles.title, { color: statusColor }]}>
          {overallMatch ? 'Great work!' : 'Keep practicing'}
        </Text>
      </View>
      <Text style={styles.score}>Score: {overallScore}%</Text>
      <Text style={styles.text}>
        Strokes: {actualStrokes}/{expectedStrokes} {strokeCountMatch ? '\u2713' : '\u2717'}
      </Text>
      <Text style={[styles.text, { color: strokeOrderCorrect ? colors.success : colors.error }]}>
        Order: {strokeOrderCorrect ? 'Correct' : 'Incorrect'}
      </Text>
      {perStroke.length > 0 && (
        <View style={styles.perStrokeContainer}>
          {perStroke.map((s, i) => (
            <View key={i} style={styles.perStrokeRow}>
              <Text style={styles.perStrokeText}>Stroke {i + 1}:</Text>
              <View style={styles.accuracyBarBg}>
                <View
                  style={[
                    styles.accuracyFill,
                    {
                      width: `${Math.round(s.spatialAccuracy * 100)}%`,
                      backgroundColor: s.spatialAccuracy > 0.5 ? colors.success : colors.error,
                    },
                  ]}
                />
              </View>
              <Text style={styles.perStrokeAccuracy}>{Math.round(s.spatialAccuracy * 100)}%</Text>
              {!s.orderCorrect && <Text style={styles.orderWarning}>reordered</Text>}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
