import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, FlatList } from 'react-native';
import { KanjiVGData, JLPTLevel } from '../data/kanjiVGTypes';
import {
  getAvailableLevels,
  getKanjiCounts,
  getTotalKanjiCount,
  getHeisigRanges,
  getHeisigKanjiCount,
} from '../data/kanjiDataService';
import { useKanjiList } from '../hooks/useKanjiList';
import { spacing, borderRadius, typography, getShadow, useTheme, useThemedStyles } from '../theme';
import { ColorScheme } from '../theme/colors';

interface KanjiBrowserProps {
  onSelect: (kanji: KanjiVGData) => void;
  selectedCharacter?: string;
}

const JLPT_SHORT_LABELS: Record<JLPTLevel, string> = {
  N5: 'N5 Beginner',
  N4: 'N4 Elementary',
  N3: 'N3 Intermediate',
  N2: 'N2 Upper-Int',
  N1: 'N1 Advanced',
};

function getJlptLabel(level: JLPTLevel): string {
  const counts = getKanjiCounts();
  const count = counts[level] ?? 0;
  return `${JLPT_SHORT_LABELS[level]} (${count})`;
}

const createStyles = (colors: ColorScheme) => ({
  container: {
    flex: 1,
    width: '100%' as const,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.body.fontSize,
    color: colors.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    color: colors.muted,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  filterRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  grid: {
    paddingHorizontal: spacing.lg,
  },
  gridContent: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  emptyText: {
    textAlign: 'center' as const,
    color: colors.muted,
    fontSize: typography.body.fontSize,
    paddingVertical: spacing.xl,
  },
});

function KanjiCard({
  kanji,
  isSelected,
  showHeisigIndex,
  onSelect,
}: {
  kanji: KanjiVGData;
  isSelected: boolean;
  showHeisigIndex: boolean;
  onSelect: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        {
          flex: 1,
          aspectRatio: 1,
          borderRadius: borderRadius.md,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          borderWidth: isSelected ? 2 : 1,
          minWidth: 70,
          maxWidth: 90,
          backgroundColor: isSelected ? colors.surface : colors.background,
          borderColor: isSelected ? colors.accent : colors.border,
          opacity: pressed ? 0.7 : 1,
          ...(isSelected ? getShadow(colors, 'low') : {}),
        },
      ]}
      onPress={onSelect}
    >
      {showHeisigIndex && kanji.heisigIndex != null && (
        <Text
          style={{
            position: 'absolute',
            top: 3,
            right: 5,
            fontSize: 8,
            fontWeight: '600',
            color: colors.accent,
          }}
        >
          #{kanji.heisigIndex}
        </Text>
      )}
      <Text style={{ fontSize: 32, fontWeight: '500', color: colors.primary }}>
        {kanji.character}
      </Text>
      <Text
        style={{ fontSize: 10, marginTop: 2, color: colors.muted }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {kanji.meaning}
      </Text>
      <Text style={{ fontSize: 9, color: colors.border }}>{kanji.strokes.length} strokes</Text>
    </Pressable>
  );
}

/** Toggle a value in/out of an array (by equality check). */
function toggleInArray<T>(arr: T[], value: T, eq: (a: T, b: T) => boolean = (a, b) => a === b): T[] {
  const idx = arr.findIndex((v) => eq(v, value));
  if (idx >= 0) {
    return [...arr.slice(0, idx), ...arr.slice(idx + 1)];
  }
  return [...arr, value];
}

function rangesEqual(a: [number, number], b: [number, number]): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

export function KanjiBrowser({ onSelect, selectedCharacter }: KanjiBrowserProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [search, setSearch] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<JLPTLevel[]>([]);
  const [selectedHeisigRanges, setSelectedHeisigRanges] = useState<[number, number][]>([]);
  const availableLevels = getAvailableLevels();
  const heisigRanges = getHeisigRanges();
  const heisigCount = getHeisigKanjiCount();
  const totalCount = getTotalKanjiCount();

  const hasHeisigFilter = selectedHeisigRanges.length > 0;

  const { kanji } = useKanjiList(
    selectedLevels.length > 0 ? selectedLevels : undefined,
    undefined,
    search || undefined,
    hasHeisigFilter ? selectedHeisigRanges : undefined
  );

  const renderItem = useCallback(
    ({ item }: { item: KanjiVGData }) => (
      <KanjiCard
        kanji={item}
        isSelected={item.character === selectedCharacter}
        showHeisigIndex={hasHeisigFilter}
        onSelect={() => onSelect(item)}
      />
    ),
    [onSelect, selectedCharacter, hasHeisigFilter]
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search kanji, meaning, or keyword..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {/* JLPT Filter */}
      <Text style={styles.sectionHeader}>JLPT Level</Text>
      <View style={styles.filterRow}>
        <Pressable
          style={[
            styles.filterChip,
            {
              backgroundColor: selectedLevels.length === 0 ? colors.accent : colors.surface,
              borderColor: selectedLevels.length === 0 ? colors.accent : colors.border,
            },
          ]}
          onPress={() => setSelectedLevels([])}
        >
          <Text
            style={[
              styles.filterChipText,
              { color: selectedLevels.length === 0 ? colors.accentText : colors.secondary },
            ]}
          >
            All ({totalCount})
          </Text>
        </Pressable>
        {availableLevels.map((level) => {
          const isActive = selectedLevels.includes(level);
          return (
            <Pressable
              key={level}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive ? colors.accent : colors.surface,
                  borderColor: isActive ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setSelectedLevels(toggleInArray(selectedLevels, level))}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: isActive ? colors.accentText : colors.secondary },
                ]}
              >
                {getJlptLabel(level)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Heisig RTK Filter */}
      <Text style={styles.sectionHeader}>Heisig RTK</Text>
      <View style={styles.filterRow}>
        <Pressable
          style={[
            styles.filterChip,
            {
              backgroundColor: !hasHeisigFilter ? colors.accent : colors.surface,
              borderColor: !hasHeisigFilter ? colors.accent : colors.border,
            },
          ]}
          onPress={() => setSelectedHeisigRanges([])}
        >
          <Text
            style={[
              styles.filterChipText,
              { color: !hasHeisigFilter ? colors.accentText : colors.secondary },
            ]}
          >
            All ({heisigCount})
          </Text>
        </Pressable>
        {heisigRanges.map(({ label, range }) => {
          const isActive = selectedHeisigRanges.some((r) => rangesEqual(r, range));
          return (
            <Pressable
              key={label}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive ? colors.accent : colors.surface,
                  borderColor: isActive ? colors.accent : colors.border,
                },
              ]}
              onPress={() =>
                setSelectedHeisigRanges(toggleInArray(selectedHeisigRanges, range, rangesEqual))
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: isActive ? colors.accentText : colors.secondary },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Kanji Grid */}
      <FlatList
        data={kanji}
        renderItem={renderItem}
        keyExtractor={(item) => item.character}
        numColumns={4}
        style={styles.grid}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={{ gap: spacing.sm }}
        ListEmptyComponent={<Text style={styles.emptyText}>No kanji found</Text>}
      />
    </View>
  );
}
