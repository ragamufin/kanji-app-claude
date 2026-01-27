import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Text, Animated } from 'react-native';
import { KanjiVGData } from '../data/kanjiVGTypes';
import { useTheme, spacing, borderRadius, getShadow } from '../theme';

interface KanjiSelectorProps {
  kanjiList: KanjiVGData[];
  selectedKanji: KanjiVGData;
  onSelect: (kanji: KanjiVGData) => void;
}

function KanjiItem({
  kanji,
  isSelected,
  onSelect,
}: {
  kanji: KanjiVGData;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(isSelected ? 1 : 0.92)).current;
  const opacityAnim = useRef(new Animated.Value(isSelected ? 1 : 0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isSelected ? 1 : 0.92,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }),
      Animated.timing(opacityAnim, {
        toValue: isSelected ? 1 : 0.6,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isSelected, scaleAnim, opacityAnim]);

  return (
    <Pressable onPress={onSelect}>
      <Animated.View
        style={[
          styles.kanjiButton,
          {
            backgroundColor: isSelected ? colors.surface : colors.background,
            borderColor: isSelected ? colors.accent : colors.border,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
            ...(isSelected ? getShadow(colors, 'medium') : {}),
          },
        ]}
      >
        <Text
          style={[
            styles.kanjiText,
            { color: isSelected ? colors.primary : colors.muted },
          ]}
        >
          {kanji.character}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function KanjiSelector({
  kanjiList,
  selectedKanji,
  onSelect,
}: KanjiSelectorProps) {
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={64}
        decelerationRate="fast"
      >
        {kanjiList.map((kanji) => {
          const isSelected = kanji.character === selectedKanji.character;
          return (
            <KanjiItem
              key={kanji.character}
              kanji={kanji}
              isSelected={isSelected}
              onSelect={() => onSelect(kanji)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
  },
  kanjiButton: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kanjiText: {
    fontSize: 28,
    fontWeight: '500',
  },
});
