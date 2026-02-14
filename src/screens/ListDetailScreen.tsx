/**
 * ListDetailScreen — shows kanji in a single list with delete capability.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KanjiVGData } from '../data/kanjiVGTypes';
import { getKanjiData } from '../data/kanjiDataService';
import { useLists } from '../hooks/useLists';
import {
  spacing,
  borderRadius,
  typography,
  getShadow,
  useThemedStyles,
} from '../theme';
import { ColorScheme } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type DetailRoute = RouteProp<RootStackParamList, 'ListDetail'>;
type DetailNavProp = NativeStackNavigationProp<RootStackParamList, 'ListDetail'>;

const createStyles = (colors: ColorScheme) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  kanjiRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    ...getShadow(colors, 'low'),
  },
  kanjiChar: {
    fontSize: 36,
    fontWeight: '400' as const,
    width: 52,
    textAlign: 'center' as const,
    color: colors.primary,
  },
  kanjiInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  kanjiMeaning: {
    fontSize: typography.body.fontSize,
    fontWeight: '500' as const,
    color: colors.primary,
  },
  kanjiMeta: {
    fontSize: typography.caption.fontSize,
    color: colors.muted,
    marginTop: 2,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  deleteText: {
    fontSize: 18,
    color: colors.error,
  },
  emptyText: {
    textAlign: 'center' as const,
    color: colors.muted,
    fontSize: typography.body.fontSize,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  studyButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
    ...getShadow(colors, 'medium'),
  },
  studyButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: '700' as const,
    color: colors.accentText,
  },
});

export function ListDetailScreen() {
  const styles = useThemedStyles(createStyles);
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation<DetailNavProp>();
  const { lists, removeKanji } = useLists();
  const { listId } = route.params;

  const list = lists.find((l) => l.id === listId);
  const [kanjiData, setKanjiData] = useState<Map<string, KanjiVGData>>(new Map());

  // Set header title
  useEffect(() => {
    if (list) {
      navigation.setOptions({ title: list.name });
    }
  }, [list, navigation]);

  // Load kanji data for characters in list
  useEffect(() => {
    if (!list) return;
    let cancelled = false;

    const load = async () => {
      const dataMap = new Map<string, KanjiVGData>();
      for (const char of list.characters) {
        const data = await getKanjiData(char);
        if (data) dataMap.set(char, data);
      }
      if (!cancelled) setKanjiData(dataMap);
    };
    load();

    return () => { cancelled = true; };
  }, [list]);

  const handleRemove = useCallback(
    (character: string) => {
      removeKanji(listId, character);
    },
    [listId, removeKanji]
  );

  const handleStudy = useCallback(() => {
    if (!list || list.characters.length === 0) return;
    navigation.navigate('StudySession', {
      sessionType: 'study',
      mode: 'regular',
      shuffle: false,
      kanjiCharacters: list.characters,
    });
  }, [list, navigation]);

  if (!list) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>List not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {list.characters.length > 0 && (
        <Pressable
          style={({ pressed }) => [
            styles.studyButton,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleStudy}
        >
          <Text style={{ fontSize: 16 }}>{'\uD83D\uDCDA'}</Text>
          <Text style={styles.studyButtonText}>
            Study {list.characters.length} kanji
          </Text>
        </Pressable>
      )}

      <FlatList
        data={list.characters}
        keyExtractor={(item) => item}
        renderItem={({ item: character }) => {
          const data = kanjiData.get(character);
          return (
            <View style={styles.kanjiRow}>
              <Text style={styles.kanjiChar}>{character}</Text>
              <View style={styles.kanjiInfo}>
                <Text style={styles.kanjiMeaning}>
                  {data?.heisigKeyword || data?.meaning || ''}
                </Text>
                <Text style={styles.kanjiMeta}>
                  {[
                    data?.strokes.length ? `${data.strokes.length} strokes` : '',
                    data?.jlpt || '',
                    data?.heisigIndex ? `RTK #${data.heisigIndex}` : '',
                  ]
                    .filter(Boolean)
                    .join(' \u00B7 ')}
                </Text>
              </View>
              <Pressable
                style={styles.deleteButton}
                onPress={() => handleRemove(character)}
                hitSlop={8}
              >
                <Text style={styles.deleteText}>{'\u2715'}</Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No kanji in this list yet. Add kanji from the Browse screen.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: spacing.xxxl }}
      />
    </View>
  );
}
