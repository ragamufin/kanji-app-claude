/**
 * ListsScreen — displays all custom kanji lists.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon } from '../components/Icon';
import { useAnimatedPress } from '../utils/animations';
import { useLists } from '../hooks/useLists';
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

type ListsNavProp = NativeStackNavigationProp<RootStackParamList, 'Lists'>;

const createStyles = (colors: ColorScheme) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    ...getShadow(colors, 'low'),
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: typography.label.fontSize,
    fontFamily: fonts.sansMedium,
    color: colors.primary,
  },
  listMeta: {
    fontSize: typography.caption.fontSize,
    fontFamily: fonts.sans,
    color: colors.muted,
    marginTop: 2,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginLeft: spacing.md,
  },
  chevronContainer: {
    marginLeft: spacing.sm,
  },
  emptyText: {
    textAlign: 'center' as const,
    color: colors.muted,
    fontSize: typography.body.fontSize,
    fontFamily: fonts.sans,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  fab: {
    position: 'absolute' as const,
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...getShadow(colors, 'high'),
  },
});

function AnimatedFAB({ onPress, colors }: { onPress: () => void; colors: ColorScheme }) {
  const styles = useThemedStyles(createStyles);
  const { animatedStyle, onPressIn, onPressOut } = useAnimatedPress(0.92);

  return (
    <Animated.View style={[styles.fab, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }}
      >
        <Icon name="plus" size={24} color={colors.accentText} />
      </Pressable>
    </Animated.View>
  );
}

export function ListsScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation<ListsNavProp>();
  const { lists, createList, deleteList } = useLists();

  const handleCreate = useCallback(() => {
    Alert.prompt(
      'New List',
      'Enter a name for your list:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async (name?: string) => {
            if (name && name.trim()) {
              await createList(name.trim());
            }
          },
        },
      ],
      'plain-text',
      '',
      'default'
    );
  }, [createList]);

  const handleDelete = useCallback(
    (listId: string, listName: string, isEmpty: boolean) => {
      if (isEmpty) {
        deleteList(listId);
        return;
      }
      Alert.alert(
        'Delete List',
        `Are you sure you want to delete "${listName}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteList(listId),
          },
        ]
      );
    },
    [deleteList]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.listItem,
              { opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={() =>
              navigation.navigate('ListDetail', { listId: item.id })
            }
          >
            <View style={styles.listInfo}>
              <Text style={styles.listName}>{item.name}</Text>
              <Text style={styles.listMeta}>
                {item.characters.length} kanji
              </Text>
            </View>
            <Pressable
              style={styles.deleteButton}
              onPress={() =>
                handleDelete(
                  item.id,
                  item.name,
                  item.characters.length === 0
                )
              }
              hitSlop={8}
            >
              <Icon name="x" size={16} color={colors.error} />
            </Pressable>
            <View style={styles.chevronContainer}>
              <Icon name="chevron-right" size={18} color={colors.muted} />
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No lists yet. Tap + to create one, or add kanji from the Browse
            screen.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* FAB */}
      <AnimatedFAB onPress={handleCreate} colors={colors} />
    </View>
  );
}
