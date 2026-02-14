/**
 * StudySetupScreen — configure a study or SRS session.
 * Choose source (JLPT, Heisig, Lists), mode, and settings.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { JLPTLevel, KanjiVGData } from '../data/kanjiVGTypes';
import { getAvailableKanji, getHeisigRanges } from '../data/kanjiDataService';
import { useFSRS } from '../hooks/useFSRS';
import { useLists } from '../hooks/useLists';
import {
  StudyMode,
  SessionType,
  STUDY_MODE_LABELS,
  STUDY_MODE_DESCRIPTIONS,
} from '../config/studyConfig';
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

type SetupRoute = RouteProp<RootStackParamList, 'StudySetup'>;
type SetupNavProp = NativeStackNavigationProp<RootStackParamList, 'StudySetup'>;

const JLPT_LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

const createStyles = (colors: ColorScheme) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.secondary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    color: colors.secondary,
  },
  chipTextSelected: {
    color: colors.accentText,
  },
  modeCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  modeCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '0A',
  },
  modeTitle: {
    fontSize: typography.button.fontSize,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  modeDescription: {
    fontSize: typography.caption.fontSize,
    color: colors.muted,
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
  },
  toggleLabel: {
    fontSize: typography.body.fontSize,
    color: colors.primary,
  },
  toggleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
  },
  toggleButtonActive: {
    backgroundColor: colors.accent,
  },
  toggleButtonText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600' as const,
    color: colors.secondary,
  },
  toggleButtonTextActive: {
    color: colors.accentText,
  },
  deckInfo: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  deckCount: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  deckLabel: {
    fontSize: typography.body.fontSize,
    color: colors.muted,
    marginLeft: spacing.sm,
  },
  startButton: {
    alignItems: 'center' as const,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    marginTop: spacing.md,
    ...getShadow(colors, 'medium'),
  },
  startButtonDisabled: {
    opacity: 0.4,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.accentText,
  },
  srsInfo: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    marginTop: spacing.md,
    ...getShadow(colors, 'low'),
  },
  srsInfoRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: spacing.sm,
  },
  srsInfoLabel: {
    fontSize: typography.body.fontSize,
    color: colors.secondary,
  },
  srsInfoValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  loading: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});

export function StudySetupScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation<SetupNavProp>();
  const route = useRoute<SetupRoute>();
  const sessionType: SessionType = route.params?.sessionType ?? 'study';

  const { dueCount, newCount, ensureCards } = useFSRS();
  const { lists } = useLists();

  // Filter state
  const [selectedLevels, setSelectedLevels] = useState<JLPTLevel[]>([]);
  const [selectedHeisig, setSelectedHeisig] = useState<{ label: string; range: [number, number] }[]>([]);
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [studyMode, setStudyMode] = useState<StudyMode>('regular');
  const [shuffleEnabled, setShuffle] = useState(false);

  // Available kanji from filters
  const [filteredKanji, setFilteredKanji] = useState<KanjiVGData[]>([]);
  const [heisigRanges] = useState(() => getHeisigRanges());
  const [loadingKanji, setLoadingKanji] = useState(true);

  // Load kanji based on filters
  useEffect(() => {
    let cancelled = false;

    getAvailableKanji({
      jlptLevels: selectedLevels.length > 0 ? selectedLevels : undefined,
      heisigRanges: selectedHeisig.length > 0 ? selectedHeisig.map((h) => h.range) : undefined,
    }).then((kanji) => {
      if (cancelled) return;
      setFilteredKanji(kanji);
      setLoadingKanji(false);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedLevels, selectedHeisig, selectedListIds, lists]);

  const deckSize = sessionType === 'srs'
    ? dueCount + Math.min(newCount, 5)
    : filteredKanji.length;

  const toggleLevel = (level: JLPTLevel) => {
    setSelectedLevels((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level]
    );
  };

  const toggleHeisig = (item: { label: string; range: [number, number] }) => {
    setSelectedHeisig((prev) => {
      const exists = prev.some(
        (r) => r.range[0] === item.range[0] && r.range[1] === item.range[1]
      );
      return exists
        ? prev.filter((r) => !(r.range[0] === item.range[0] && r.range[1] === item.range[1]))
        : [...prev, item];
    });
  };

  const toggleList = (listId: string) => {
    setSelectedListIds((prev) =>
      prev.includes(listId)
        ? prev.filter((id) => id !== listId)
        : [...prev, listId]
    );
  };

  const handleStart = async () => {
    if (sessionType === 'srs') {
      // Ensure FSRS card states exist for all filtered kanji
      const chars = filteredKanji.map((k) => k.character);
      await ensureCards(chars);

      navigation.navigate('StudySession', {
        sessionType: 'srs',
        mode: studyMode,
        shuffle: shuffleEnabled,
        kanjiCharacters: chars,
      });
    } else {
      const chars = filteredKanji.map((k) => k.character);
      navigation.navigate('StudySession', {
        sessionType: 'study',
        mode: studyMode,
        shuffle: shuffleEnabled,
        kanjiCharacters: chars,
      });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* SRS info panel */}
      {sessionType === 'srs' && (
        <View style={styles.srsInfo}>
          <View style={styles.srsInfoRow}>
            <Text style={styles.srsInfoLabel}>Due for review</Text>
            <Text style={styles.srsInfoValue}>{dueCount}</Text>
          </View>
          <View style={styles.srsInfoRow}>
            <Text style={styles.srsInfoLabel}>New cards available</Text>
            <Text style={styles.srsInfoValue}>{newCount}</Text>
          </View>
        </View>
      )}

      {/* Source: JLPT levels */}
      <Text style={styles.sectionTitle}>JLPT Level</Text>
      <View style={styles.chipRow}>
        {JLPT_LEVELS.map((level) => {
          const selected = selectedLevels.includes(level);
          return (
            <Pressable
              key={level}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => toggleLevel(level)}
            >
              <Text
                style={[styles.chipText, selected && styles.chipTextSelected]}
              >
                {level}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Source: Heisig ranges */}
      <Text style={styles.sectionTitle}>Heisig RTK Range</Text>
      <View style={styles.chipRow}>
        {heisigRanges.map((item) => {
          const selected = selectedHeisig.some(
            (r) => r.range[0] === item.range[0] && r.range[1] === item.range[1]
          );
          return (
            <Pressable
              key={item.label}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => toggleHeisig(item)}
            >
              <Text
                style={[styles.chipText, selected && styles.chipTextSelected]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Source: Custom lists */}
      {lists.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Custom Lists</Text>
          <View style={styles.chipRow}>
            {lists.map((list) => {
              const selected = selectedListIds.includes(list.id);
              return (
                <Pressable
                  key={list.id}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => toggleList(list.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}
                  >
                    {list.name} ({list.characters.length})
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {/* Study mode */}
      <Text style={styles.sectionTitle}>Study Mode</Text>
      {(['regular', 'reverse', 'random'] as StudyMode[]).map((m) => {
        const selected = studyMode === m;
        return (
          <Pressable
            key={m}
            style={[styles.modeCard, selected && styles.modeCardSelected]}
            onPress={() => setStudyMode(m)}
          >
            <Text style={styles.modeTitle}>{STUDY_MODE_LABELS[m]}</Text>
            <Text style={styles.modeDescription}>
              {STUDY_MODE_DESCRIPTIONS[m]}
            </Text>
          </Pressable>
        );
      })}

      {/* Shuffle toggle */}
      <Pressable
        style={styles.toggleRow}
        onPress={() => setShuffle(!shuffleEnabled)}
      >
        <Text style={styles.toggleLabel}>Shuffle order</Text>
        <View
          style={[
            styles.toggleButton,
            shuffleEnabled && styles.toggleButtonActive,
          ]}
        >
          <Text
            style={[
              styles.toggleButtonText,
              shuffleEnabled && styles.toggleButtonTextActive,
            ]}
          >
            {shuffleEnabled ? 'ON' : 'OFF'}
          </Text>
        </View>
      </Pressable>

      {/* Deck size */}
      <View style={styles.deckInfo}>
        {loadingKanji ? (
          <ActivityIndicator size="small" color={colors.accent} />
        ) : (
          <>
            <Text style={styles.deckCount}>{deckSize}</Text>
            <Text style={styles.deckLabel}>cards in deck</Text>
          </>
        )}
      </View>

      {/* Start button */}
      <Pressable
        style={({ pressed }) => [
          styles.startButton,
          deckSize === 0 && styles.startButtonDisabled,
          { opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={handleStart}
        disabled={deckSize === 0}
      >
        <Text style={styles.startButtonText}>
          {sessionType === 'srs' ? 'Start Review' : 'Start Studying'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
