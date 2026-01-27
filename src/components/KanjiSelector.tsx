import React from 'react';
import { StyleSheet, View, ScrollView, Pressable, Text } from 'react-native';
import { KanjiData } from '../data/kanjiData';

interface KanjiSelectorProps {
  kanjiList: KanjiData[];
  selectedKanji: KanjiData;
  onSelect: (kanji: KanjiData) => void;
}

export function KanjiSelector({
  kanjiList,
  selectedKanji,
  onSelect,
}: KanjiSelectorProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {kanjiList.map((kanji) => {
          const isSelected = kanji.character === selectedKanji.character;
          return (
            <Pressable
              key={kanji.character}
              style={[
                styles.kanjiButton,
                isSelected && styles.kanjiButtonSelected,
              ]}
              onPress={() => onSelect(kanji)}
            >
              <Text
                style={[
                  styles.kanjiText,
                  isSelected && styles.kanjiTextSelected,
                ]}
              >
                {kanji.character}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 8,
    gap: 8,
  },
  kanjiButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kanjiButtonSelected: {
    borderColor: '#333',
    backgroundColor: '#333',
  },
  kanjiText: {
    fontSize: 24,
    color: '#333',
  },
  kanjiTextSelected: {
    color: '#fff',
  },
});
