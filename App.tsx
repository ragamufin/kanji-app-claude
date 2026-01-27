import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, useWindowDimensions } from 'react-native';
import { KanjiCanvas } from './src/components/KanjiCanvas';
import { KanjiSelector } from './src/components/KanjiSelector';
import { kanjiList, KanjiData } from './src/data/kanjiData';
import { CanvasMode } from './src/data/kanjiVGTypes';

const CANVAS_MODES: { mode: CanvasMode; label: string }[] = [
  { mode: 'practice', label: 'Practice' },
  { mode: 'demo', label: 'Demo' },
  { mode: 'trace', label: 'Trace' },
];

export default function App() {
  const { width } = useWindowDimensions();
  const canvasSize = Math.min(width - 40, 350);
  const [selectedKanji, setSelectedKanji] = useState<KanjiData>(kanjiList[0]);
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('practice');

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

        {/* Canvas Mode Selector */}
        <View style={styles.modeSelector}>
          {CANVAS_MODES.map(({ mode, label }) => (
            <Pressable
              key={mode}
              style={[
                styles.modeButton,
                canvasMode === mode && styles.modeButtonActive,
              ]}
              onPress={() => setCanvasMode(mode)}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  canvasMode === mode && styles.modeButtonTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        <KanjiCanvas
          key={`${selectedKanji.character}-${canvasMode}`}
          width={canvasSize}
          height={canvasSize}
          strokeWidth={8}
          expectedKanji={selectedKanji}
          canvasMode={canvasMode}
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
  modeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#1d4ed8',
  },
  modeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
});
