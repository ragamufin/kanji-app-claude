import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { StrokeMode } from '../utils/strokeUtils';
import { KanjiVGData, CanvasMode } from '../data/kanjiVGTypes';
import { getKanjiVGData } from '../data/kanjiVGData';
import { useTheme, getShadow, borderRadius, useThemedStyles } from '../theme';
import { ColorScheme } from '../theme/colors';
import { useDrawing } from '../hooks/useDrawing';
import { useStrokeValidation } from '../hooks/useStrokeValidation';
import { DrawingCanvas } from './DrawingCanvas';
import { CanvasToolbar } from './CanvasToolbar';
import { ValidationMessage } from './ValidationMessage';
import { StrokeAnimatorWithReplay } from './StrokeAnimatorWithReplay';

interface KanjiCanvasProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  expectedKanji?: KanjiVGData;
  canvasMode?: CanvasMode;
  strokeMode?: StrokeMode;
  onStrokeModeChange?: (mode: StrokeMode) => void;
}

const createStyles = (colors: ColorScheme) => ({
  container: {
    alignItems: 'center' as const,
  },
  canvasContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden' as const,
    backgroundColor: colors.canvas,
    ...getShadow(colors, 'medium'),
  },
});

export function KanjiCanvas({
  width = 300,
  height = 300,
  strokeColor,
  strokeWidth = 8,
  expectedKanji,
  canvasMode = 'practice',
  strokeMode = 'basic',
  onStrokeModeChange,
}: KanjiCanvasProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const effectiveStrokeColor = strokeColor ?? colors.primary;

  const drawing = useDrawing(effectiveStrokeColor, strokeWidth, strokeMode);
  const { validationResult, checkStrokes, clearValidation } = useStrokeValidation(
    expectedKanji,
    width
  );

  const kanjiVGData = useMemo(() => {
    if (!expectedKanji) return undefined;
    return getKanjiVGData(expectedKanji.character);
  }, [expectedKanji]);

  const handleUndo = useCallback(() => {
    drawing.undo();
    clearValidation();
  }, [drawing, clearValidation]);

  const handleClear = useCallback(() => {
    drawing.clear();
    clearValidation();
  }, [drawing, clearValidation]);

  const handleCheck = useCallback(() => {
    checkStrokes(drawing.pointsHistoryRef.current);
  }, [checkStrokes, drawing.pointsHistoryRef]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onBegin((e) => {
          drawing.onTouchStart(e.x, e.y);
          clearValidation();
        })
        .onUpdate((e) => {
          drawing.onTouchMove(e.x, e.y);
        })
        .onEnd(() => {
          drawing.onTouchEnd();
        })
        .minDistance(0)
        .runOnJS(true),
    [drawing, clearValidation]
  );

  // Demo mode
  if (canvasMode === 'demo' && kanjiVGData) {
    return (
      <View style={styles.container}>
        <StrokeAnimatorWithReplay kanjiVGData={kanjiVGData} width={width} height={height} />
      </View>
    );
  }

  const allowDrawing = canvasMode !== 'demo';

  const canvasView = (
    <View style={[styles.canvasContainer, { width, height }]}>
      <DrawingCanvas
        width={width}
        height={height}
        strokes={drawing.strokes}
        currentPath={drawing.currentPath}
        currentIsFilled={drawing.currentIsFilled}
        currentStrokeColor={effectiveStrokeColor}
        currentStrokeWidth={strokeWidth}
        showTraceGuide={canvasMode === 'trace'}
        kanjiVGData={kanjiVGData}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {allowDrawing && (
        <CanvasToolbar
          strokeMode={strokeMode}
          onStrokeModeChange={onStrokeModeChange ?? (() => {})}
          strokeCount={drawing.strokes.length}
          showCheck={!!expectedKanji}
          onUndo={handleUndo}
          onClear={handleClear}
          onCheck={handleCheck}
        />
      )}

      {allowDrawing ? <GestureDetector gesture={pan}>{canvasView}</GestureDetector> : canvasView}

      {validationResult && <ValidationMessage result={validationResult} />}
    </View>
  );
}
