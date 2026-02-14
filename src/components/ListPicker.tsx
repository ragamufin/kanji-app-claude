/**
 * ListPicker — modal to select or create a list when adding kanji.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  FlatList,
  Alert,
} from 'react-native';
import { KanjiList } from '../data/listStorage';
import {
  spacing,
  borderRadius,
  typography,
  getShadow,
  useThemedStyles,
} from '../theme';
import { ColorScheme } from '../theme/colors';

interface ListPickerProps {
  visible: boolean;
  lists: KanjiList[];
  onSelect: (listId: string) => void;
  onCreate: (name: string) => void;
  onClose: () => void;
}

const createStyles = (colors: ColorScheme) => ({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end' as const,
  },
  sheet: {
    maxHeight: '60%' as const,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    ...getShadow(colors, 'high'),
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center' as const,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.primary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  listItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listName: {
    fontSize: typography.body.fontSize,
    color: colors.primary,
  },
  listCount: {
    fontSize: typography.caption.fontSize,
    color: colors.muted,
  },
  createRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  createIcon: {
    fontSize: 20,
    color: colors.accent,
  },
  createText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600' as const,
    color: colors.accent,
  },
});

export function ListPicker({
  visible,
  lists,
  onSelect,
  onCreate,
  onClose,
}: ListPickerProps) {
  const styles = useThemedStyles(createStyles);

  const handleCreate = useCallback(() => {
    Alert.prompt(
      'New List',
      'Enter a name for your list:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: (name?: string) => {
            if (name && name.trim()) {
              onCreate(name.trim());
            }
          },
        },
      ],
      'plain-text',
      '',
      'default'
    );
  }, [onCreate]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          <Text style={styles.title}>Add to List</Text>

          <FlatList
            data={lists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.listItem,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => onSelect(item.id)}
              >
                <Text style={styles.listName}>{item.name}</Text>
                <Text style={styles.listCount}>
                  {item.characters.length} kanji
                </Text>
              </Pressable>
            )}
          />

          {/* Create new */}
          <Pressable
            style={({ pressed }) => [
              styles.createRow,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={handleCreate}
          >
            <Text style={styles.createIcon}>+</Text>
            <Text style={styles.createText}>Create New List</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
