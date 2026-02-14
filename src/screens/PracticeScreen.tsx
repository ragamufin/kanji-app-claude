import React, { useState } from 'react';
import { Text, View, ScrollView, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KanjiCanvas } from '../components/KanjiCanvas';
import { KanjiSelector } from '../components/KanjiSelector';
import { KanjiVGData, CanvasMode } from '../data/kanjiVGTypes';
import { StrokeMode } from '../utils/strokeUtils';
import { useKanjiList } from '../hooks/useKanjiList';
import { useTheme, spacing, borderRadius, typography, getShadow, useThemedStyles } from '../theme';
import { ColorScheme } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type PracticeNavProp = NativeStackNavigationProp<RootStackParamList, 'Practice'>;

const CANVAS_MODES: { mode: CanvasMode; label: string; icon: string }[] = [
  { mode: 'practice', label: 'Practice', icon: '\u270E' },
  { mode: 'demo', label: 'Demo', icon: '\u25B6' },
  { mode: 'trace', label: 'Trace', icon: '\u25CE' },
];

const createStyles = (colors: ColorScheme) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  kanjiDisplaySection: {
    alignItems: 'center' as const,
    marginBottom: spacing.lg,
  },
  kanjiCharacter: {
    fontSize: typography.kanjiDisplay.fontSize,
    fontWeight: typography.kanjiDisplay.fontWeight,
    opacity: 0.15,
    marginBottom: -spacing.sm,
    color: colors.muted,
  },
  meaning: {
    fontSize: typography.meaning.fontSize,
    fontWeight: typography.meaning.fontWeight,
    marginBottom: spacing.sm,
    color: colors.primary,
  },
  strokeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    ...getShadow(colors, 'low'),
  },
  strokeBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    color: colors.secondary,
  },
  modeSelector: {
    flexDirection: 'row' as const,
    marginBottom: spacing.lg,
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    backgroundColor: colors.surface,
    ...getShadow(colors, 'low'),
  },
  modeButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  modeButtonIcon: {
    fontSize: 14,
  },
  modeButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  navRow: {
    flexDirection: 'row' as const,
    position: 'absolute' as const,
    top: spacing.xxxl + spacing.lg,
    left: spacing.lg,
    gap: spacing.sm,
    zIndex: 10,
  },
  navButton: {
    flexDirection: 'row' as const,
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 4,
    ...getShadow(colors, 'low'),
  },
  navButtonIcon: {
    fontSize: 18,
  },
  navButtonLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    color: colors.secondary,
  },
});

export function PracticeScreen() {
  const { width } = useWindowDimensions();
  const canvasSize = Math.min(width - 48, 350);
  const { kanji: kanjiList, loading } = useKanjiList();
  const [selectedKanji, setSelectedKanji] = useState<KanjiVGData | null>(null);
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('practice');
  const [strokeMode, setStrokeMode] = useState<StrokeMode>('basic');
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<PracticeNavProp>();

  const activeKanji = selectedKanji ?? (kanjiList.length > 0 ? kanjiList[0] : null);

  if (loading || !activeKanji) {
    return (
      <View style={[styles.container, styles.contentContainer]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Nav buttons */}
      <View style={styles.navRow}>
        <Pressable
          style={({ pressed }) => [styles.navButton, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.navButtonIcon}>{'\u2190'}</Text>
          <Text style={styles.navButtonLabel}>Home</Text>
        </Pressable>
      </View>

      {/* Theme toggle */}
      <Pressable
        style={({ pressed }) => [
          {
            position: 'absolute',
            top: spacing.xxxl + spacing.lg,
            right: spacing.lg,
            zIndex: 10,
            width: 44,
            height: 44,
            borderRadius: borderRadius.full,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
            ...getShadow(colors, 'low'),
          },
        ]}
        onPress={toggleTheme}
      >
        <Text style={{ fontSize: 20 }}>{isDark ? '\u2600\uFE0F' : '\uD83C\uDF19'}</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Kanji Display */}
        <View style={styles.kanjiDisplaySection}>
          <Text style={styles.kanjiCharacter}>{activeKanji.character}</Text>
          <Text style={styles.meaning}>{activeKanji.meaning}</Text>
          <View style={styles.strokeBadge}>
            <Text style={styles.strokeBadgeText}>{activeKanji.strokes.length} strokes</Text>
          </View>
        </View>

        <KanjiSelector
          kanjiList={kanjiList}
          selectedKanji={activeKanji}
          onSelect={setSelectedKanji}
        />

        {/* Canvas Mode Selector */}
        <View style={styles.modeSelector}>
          {CANVAS_MODES.map(({ mode, label, icon }) => {
            const isActive = canvasMode === mode;
            return (
              <Pressable
                key={mode}
                style={({ pressed }) => [
                  styles.modeButton,
                  {
                    backgroundColor: isActive ? colors.accent : 'transparent',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={() => setCanvasMode(mode)}
              >
                <Text
                  style={[styles.modeButtonIcon, { color: isActive ? colors.accentText : colors.muted }]}
                >
                  {icon}
                </Text>
                <Text
                  style={[
                    styles.modeButtonText,
                    { color: isActive ? colors.accentText : colors.secondary },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <KanjiCanvas
          key={`${activeKanji.character}-${canvasMode}`}
          width={canvasSize}
          height={canvasSize}
          strokeWidth={8}
          expectedKanji={activeKanji}
          canvasMode={canvasMode}
          strokeMode={strokeMode}
          onStrokeModeChange={setStrokeMode}
        />
      </ScrollView>
    </View>
  );
}
