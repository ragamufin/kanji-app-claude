import React, { useState, useCallback, useRef, useMemo } from 'react';
import { StyleSheet, View, Pressable, Text, PanResponder } from 'react-native';
import Svg, { Path, Defs, Pattern, Rect } from 'react-native-svg';
import { Point, StrokeMode, pointsToPath } from '../utils/strokeUtils';
import { KanjiVGData, CanvasMode } from '../data/kanjiVGTypes';
import { validateKanji, ValidationResult } from '../utils/validationUtils';
import { getKanjiVGData } from '../data/kanjiVGData';
import { TraceGuide } from './TraceGuide';
import { StrokeAnimator } from './StrokeAnimator';
import { useTheme, spacing, borderRadius, typography, getShadow } from '../theme';

interface Stroke {
  path: string;
  color: string;
  strokeWidth: number;
  isFilled: boolean;
}

interface KanjiCanvasProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  expectedKanji?: KanjiVGData;
  canvasMode?: CanvasMode;
}

const STROKE_MODES: { mode: StrokeMode; label: string; icon: string }[] = [
  { mode: 'basic', label: 'Basic', icon: '—' },
  { mode: 'smooth', label: 'Smooth', icon: '∿' },
  { mode: 'brush', label: 'Brush', icon: '🖌' },
];

export function KanjiCanvas({
  width = 300,
  height = 300,
  strokeColor,
  strokeWidth = 8,
  expectedKanji,
  canvasMode = 'practice',
}: KanjiCanvasProps) {
  const { colors } = useTheme();
  const effectiveStrokeColor = strokeColor ?? colors.primary;

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [currentIsFilled, setCurrentIsFilled] = useState(false);
  const [strokeMode, setStrokeMode] = useState<StrokeMode>('basic');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const pointsRef = useRef<Point[]>([]);
  const pointsHistoryRef = useRef<Point[][]>([]);
  const strokeColorRef = useRef(effectiveStrokeColor);
  const strokeWidthRef = useRef(strokeWidth);
  const strokeModeRef = useRef(strokeMode);

  const kanjiVGData = useMemo(() => {
    if (!expectedKanji) return undefined;
    return getKanjiVGData(expectedKanji.character);
  }, [expectedKanji]);

  strokeColorRef.current = effectiveStrokeColor;
  strokeWidthRef.current = strokeWidth;
  strokeModeRef.current = strokeMode;

  const clearValidationResult = useCallback(() => {
    setValidationResult(null);
  }, []);

  const updateCurrentPath = useCallback(() => {
    const { path, isFilled } = pointsToPath(
      pointsRef.current,
      strokeModeRef.current,
      strokeWidthRef.current
    );
    setCurrentPath(path);
    setCurrentIsFilled(isFilled);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        const { locationX, locationY } = event.nativeEvent;
        pointsRef.current = [{ x: locationX, y: locationY, timestamp: Date.now() }];
        updateCurrentPath();
        clearValidationResult();
      },
      onPanResponderMove: (event) => {
        const { locationX, locationY } = event.nativeEvent;
        pointsRef.current.push({ x: locationX, y: locationY, timestamp: Date.now() });
        updateCurrentPath();
      },
      onPanResponderRelease: () => {
        if (pointsRef.current.length > 0) {
          const { path, isFilled } = pointsToPath(
            pointsRef.current,
            strokeModeRef.current,
            strokeWidthRef.current
          );
          setStrokes((prev) => [
            ...prev,
            {
              path,
              color: strokeColorRef.current,
              strokeWidth: strokeWidthRef.current,
              isFilled,
            },
          ]);
          pointsHistoryRef.current.push([...pointsRef.current]);
          pointsRef.current = [];
          setCurrentPath('');
          setCurrentIsFilled(false);
        }
      },
    })
  ).current;

  const handleClear = useCallback(() => {
    setStrokes([]);
    setCurrentPath('');
    setCurrentIsFilled(false);
    pointsRef.current = [];
    pointsHistoryRef.current = [];
    clearValidationResult();
  }, [clearValidationResult]);

  const handleUndo = useCallback(() => {
    setStrokes((prev) => prev.slice(0, -1));
    pointsHistoryRef.current = pointsHistoryRef.current.slice(0, -1);
    clearValidationResult();
  }, [clearValidationResult]);

  const handleCheck = useCallback(() => {
    if (!expectedKanji) return;

    const result = validateKanji(
      pointsHistoryRef.current,
      expectedKanji,
      width
    );
    setValidationResult(result);
  }, [expectedKanji, width]);

  const renderValidationMessage = () => {
    if (!validationResult) return null;

    const { strokeCountMatch, expectedStrokes, actualStrokes, strokeDirectionMatches, overallMatch } = validationResult;
    const matchedDirections = strokeDirectionMatches.filter(Boolean).length;
    const totalDirections = strokeDirectionMatches.length;

    return (
      <View
        style={[
          styles.validationContainer,
          {
            backgroundColor: overallMatch ? colors.successLight : colors.errorLight,
            borderColor: overallMatch ? colors.success : colors.error,
          },
        ]}
      >
        <Text style={[styles.validationTitle, { color: overallMatch ? colors.success : colors.error }]}>
          {overallMatch ? 'Great work!' : 'Keep practicing'}
        </Text>
        <Text style={[styles.validationText, { color: colors.primary }]}>
          Strokes: {actualStrokes}/{expectedStrokes} {strokeCountMatch ? '✓' : '✗'}
        </Text>
        <Text style={[styles.validationText, { color: colors.primary }]}>
          Directions: {matchedDirections}/{totalDirections} matched
        </Text>
      </View>
    );
  };

  // Demo mode
  if (canvasMode === 'demo' && kanjiVGData) {
    return (
      <View style={styles.container}>
        <StrokeAnimatorWithReplay
          kanjiVGData={kanjiVGData}
          width={width}
          height={height}
        />
      </View>
    );
  }

  const allowDrawing = canvasMode !== 'demo';

  return (
    <View style={styles.container}>
      {/* Stroke Mode Selector */}
      {allowDrawing && (
        <View
          style={[
            styles.modeSelector,
            { backgroundColor: colors.surface, ...getShadow(colors, 'low') },
          ]}
        >
          {STROKE_MODES.map(({ mode, label, icon }) => {
            const isActive = strokeMode === mode;
            return (
              <Pressable
                key={mode}
                style={({ pressed }) => [
                  styles.modeButton,
                  {
                    backgroundColor: isActive ? colors.secondary : 'transparent',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={() => setStrokeMode(mode)}
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
      )}

      {/* Canvas */}
      <View
        style={[
          styles.canvasContainer,
          {
            width,
            height,
            backgroundColor: colors.canvas,
            ...getShadow(colors, 'medium'),
          },
        ]}
        {...(allowDrawing ? panResponder.panHandlers : {})}
      >
        <Svg width={width} height={height} style={styles.svg}>
          {/* Washi paper texture pattern */}
          <Defs>
            <Pattern id="washiPattern" patternUnits="userSpaceOnUse" width="4" height="4">
              <Rect width="4" height="4" fill={colors.canvas} />
              <Rect x="0" y="0" width="1" height="1" fill={colors.border} opacity="0.15" />
              <Rect x="2" y="2" width="1" height="1" fill={colors.border} opacity="0.1" />
            </Pattern>
          </Defs>
          <Rect width={width} height={height} fill="url(#washiPattern)" />

          {/* Trace guide */}
          {canvasMode === 'trace' && kanjiVGData && (
            <TraceGuide
              data={kanjiVGData}
              width={width}
              height={height}
              opacity={0.2}
              strokeColor={colors.muted}
              strokeWidth={6}
            />
          )}

          {/* Completed strokes */}
          {strokes.map((stroke, index) =>
            stroke.isFilled ? (
              <Path
                key={index}
                d={stroke.path}
                fill={stroke.color}
                stroke="none"
              />
            ) : (
              <Path
                key={index}
                d={stroke.path}
                stroke={stroke.color}
                strokeWidth={stroke.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )
          )}

          {/* Current stroke */}
          {currentPath &&
            (currentIsFilled ? (
              <Path d={currentPath} fill={effectiveStrokeColor} stroke="none" />
            ) : (
              <Path
                d={currentPath}
                stroke={effectiveStrokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
        </Svg>
      </View>

      {/* Action Buttons */}
      {allowDrawing && (
        <View style={styles.buttons}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: colors.surface,
                opacity: pressed ? 0.8 : 1,
                ...getShadow(colors, 'low'),
              },
            ]}
            onPress={handleUndo}
          >
            <Text style={[styles.buttonIcon, { color: colors.secondary }]}>↩</Text>
            <Text style={[styles.buttonText, { color: colors.secondary }]}>Undo</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: colors.surface,
                opacity: pressed ? 0.8 : 1,
                ...getShadow(colors, 'low'),
              },
            ]}
            onPress={handleClear}
          >
            <Text style={[styles.buttonIcon, { color: colors.secondary }]}>✕</Text>
            <Text style={[styles.buttonText, { color: colors.secondary }]}>Clear</Text>
          </Pressable>

          {expectedKanji && (
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.checkButton,
                {
                  backgroundColor: colors.accent,
                  opacity: pressed ? 0.8 : 1,
                  ...getShadow(colors, 'medium'),
                },
              ]}
              onPress={handleCheck}
            >
              <Text style={[styles.buttonIcon, { color: '#FFFFFF' }]}>✓</Text>
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Check</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Stroke Count */}
      {allowDrawing && (
        <Text style={[styles.strokeCount, { color: colors.muted }]}>
          {strokes.length} {strokes.length === 1 ? 'stroke' : 'strokes'}
        </Text>
      )}

      {renderValidationMessage()}
    </View>
  );
}

// Demo mode component
function StrokeAnimatorWithReplay({
  kanjiVGData,
  width,
  height,
}: {
  kanjiVGData: NonNullable<ReturnType<typeof getKanjiVGData>>;
  width: number;
  height: number;
}) {
  const { colors } = useTheme();
  const [key, setKey] = useState(0);

  const handleReplay = useCallback(() => {
    setKey((k) => k + 1);
  }, []);

  return (
    <>
      <View
        style={[
          styles.canvasContainer,
          {
            width,
            height,
            backgroundColor: colors.canvas,
            ...getShadow(colors, 'medium'),
          },
        ]}
      >
        <StrokeAnimator
          key={key}
          data={kanjiVGData}
          width={width}
          height={height}
          strokeColor={colors.primary}
          strokeWidth={6}
          autoPlay={true}
          showControls={false}
        />
      </View>
      <View style={styles.buttons}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: colors.accent,
              opacity: pressed ? 0.8 : 1,
              ...getShadow(colors, 'medium'),
            },
          ]}
          onPress={handleReplay}
        >
          <Text style={[styles.buttonIcon, { color: '#FFFFFF' }]}>↻</Text>
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Replay</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  modeButtonIcon: {
    fontSize: 14,
  },
  modeButtonText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  canvasContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  svg: {
    backgroundColor: 'transparent',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  checkButton: {},
  buttonIcon: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  strokeCount: {
    marginTop: spacing.md,
    fontSize: typography.caption.fontSize,
  },
  validationContainer: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    minWidth: 200,
    borderWidth: 1,
  },
  validationTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  validationText: {
    fontSize: typography.body.fontSize,
  },
});
