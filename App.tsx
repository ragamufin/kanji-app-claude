import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, useWindowDimensions } from 'react-native';
import { KanjiCanvas } from './src/components/KanjiCanvas';
import { KanjiSelector } from './src/components/KanjiSelector';
import { kanjiVGList } from './src/data/kanjiVGData';
import { KanjiVGData, CanvasMode } from './src/data/kanjiVGTypes';
import { ThemeProvider, useTheme, spacing, borderRadius, typography, getShadow } from './src/theme';

const CANVAS_MODES: { mode: CanvasMode; label: string; icon: string }[] = [
  { mode: 'practice', label: 'Practice', icon: '✎' },
  { mode: 'demo', label: 'Demo', icon: '▶' },
  { mode: 'trace', label: 'Trace', icon: '◎' },
];

function ThemeToggle() {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        {
          position: 'absolute',
          top: spacing.xxxl + spacing.lg,
          right: spacing.lg,
          width: 44,
          height: 44,
          borderRadius: borderRadius.full,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
          ...getShadow(colors, 'low'),
        },
      ]}
      onPress={toggleTheme}
    >
      <Text style={{ fontSize: 20 }}>{isDark ? '☀️' : '🌙'}</Text>
    </Pressable>
  );
}

function AppContent() {
  const { width } = useWindowDimensions();
  const canvasSize = Math.min(width - 48, 350);
  const [selectedKanji, setSelectedKanji] = useState<KanjiVGData>(kanjiVGList[0]);
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('practice');
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemeToggle />

      <View style={styles.content}>
        {/* Kanji Display Section */}
        <View style={styles.kanjiDisplaySection}>
          <Text
            style={[
              styles.kanjiCharacter,
              { color: colors.muted },
            ]}
          >
            {selectedKanji.character}
          </Text>
          <Text
            style={[
              styles.meaning,
              { color: colors.primary },
            ]}
          >
            {selectedKanji.meaning}
          </Text>
          <View
            style={[
              styles.strokeBadge,
              { backgroundColor: colors.surface, ...getShadow(colors, 'low') },
            ]}
          >
            <Text style={[styles.strokeBadgeText, { color: colors.secondary }]}>
              {selectedKanji.strokes.length} strokes
            </Text>
          </View>
        </View>

        {/* Kanji Selector */}
        <KanjiSelector
          kanjiList={kanjiVGList}
          selectedKanji={selectedKanji}
          onSelect={setSelectedKanji}
        />

        {/* Canvas Mode Selector */}
        <View
          style={[
            styles.modeSelector,
            { backgroundColor: colors.surface, ...getShadow(colors, 'low') },
          ]}
        >
          {CANVAS_MODES.map(({ mode, label, icon }) => {
            const isActive = canvasMode === mode;
            return (
              <Pressable
                key={mode}
                style={({ pressed }) => [
                  styles.modeButton,
                  {
                    backgroundColor: isActive ? colors.accent : 'transparent',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={() => setCanvasMode(mode)}
              >
                <Text
                  style={[
                    styles.modeButtonIcon,
                    { color: isActive ? '#FFFFFF' : colors.muted },
                  ]}
                >
                  {icon}
                </Text>
                <Text
                  style={[
                    styles.modeButtonText,
                    { color: isActive ? '#FFFFFF' : colors.secondary },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Drawing Canvas */}
        <KanjiCanvas
          key={`${selectedKanji.character}-${canvasMode}`}
          width={canvasSize}
          height={canvasSize}
          strokeWidth={8}
          expectedKanji={selectedKanji}
          canvasMode={canvasMode}
        />
      </View>

      <StatusBar style={isDark ? 'light' : 'dark'} />
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  kanjiDisplaySection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  kanjiCharacter: {
    fontSize: typography.kanjiDisplay.fontSize,
    fontWeight: typography.kanjiDisplay.fontWeight,
    opacity: 0.15,
    marginBottom: -spacing.sm,
  },
  meaning: {
    fontSize: typography.meaning.fontSize,
    fontWeight: typography.meaning.fontWeight,
    marginBottom: spacing.sm,
  },
  strokeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  strokeBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  modeButtonIcon: {
    fontSize: 14,
  },
  modeButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
});
