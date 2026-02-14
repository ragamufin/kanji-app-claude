import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, FlatList } from 'react-native';
import { KanjiVGData, JLPTLevel } from '../data/kanjiVGTypes';
import { getAvailableLevels, getKanjiCounts } from '../data/kanjiDataService';
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
  kanjiCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    minWidth: 70,
    maxWidth: 90,
  },
  kanjiCharacter: {
    fontSize: 32,
    fontWeight: '500' as const,
  },
  kanjiMeaning: {
    fontSize: 10,
    marginTop: 2,
  },
  strokeCount: {
    fontSize: 9,
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
  onSelect,
}: {
  kanji: KanjiVGData;
  isSelected: boolean;
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

export function KanjiBrowser({ onSelect, selectedCharacter }: KanjiBrowserProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel | null>(null);
  const availableLevels = getAvailableLevels();
  const { kanji } = useKanjiList(selectedLevel ?? undefined, undefined, search || undefined);

  const renderItem = useCallback(
    ({ item }: { item: KanjiVGData }) => (
      <KanjiCard
        kanji={item}
        isSelected={item.character === selectedCharacter}
        onSelect={() => onSelect(item)}
      />
    ),
    [onSelect, selectedCharacter]
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search kanji or meaning..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {/* JLPT Filter */}
      <View style={styles.filterRow}>
        <Pressable
          style={[
            styles.filterChip,
            {
              backgroundColor: selectedLevel === null ? colors.accent : colors.surface,
              borderColor: selectedLevel === null ? colors.accent : colors.border,
            },
          ]}
          onPress={() => setSelectedLevel(null)}
        >
          <Text
            style={[
              styles.filterChipText,
              { color: selectedLevel === null ? colors.accentText : colors.secondary },
            ]}
          >
            All
          </Text>
        </Pressable>
        {availableLevels.map((level) => (
          <Pressable
            key={level}
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedLevel === level ? colors.accent : colors.surface,
                borderColor: selectedLevel === level ? colors.accent : colors.border,
              },
            ]}
            onPress={() => setSelectedLevel(selectedLevel === level ? null : level)}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: selectedLevel === level ? colors.accentText : colors.secondary },
              ]}
            >
              {getJlptLabel(level)}
            </Text>
          </Pressable>
        ))}
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
