import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { KanjiCanvas } from './src/components/KanjiCanvas';
import { KanjiSelector } from './src/components/KanjiSelector';
import { kanjiList, KanjiData } from './src/data/kanjiData';

export default function App() {
  const { width } = useWindowDimensions();
  const canvasSize = Math.min(width - 40, 350);
  const [selectedKanji, setSelectedKanji] = useState<KanjiData>(kanjiList[0]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.keyword}>{selectedKanji.meaning}</Text>
        <Text style={styles.hint}>{selectedKanji.character}</Text>

        <KanjiSelector
          kanjiList={kanjiList}
          selectedKanji={selectedKanji}
          onSelect={setSelectedKanji}
        />

        <KanjiCanvas
          key={selectedKanji.character}
          width={canvasSize}
          height={canvasSize}
          strokeWidth={8}
          expectedKanji={selectedKanji}
        />

        <StatusBar style="auto" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  keyword: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  hint: {
    fontSize: 24,
    marginBottom: 24,
    color: '#888',
  },
});
