import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, View, Pressable, Text, PanResponder } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Point, StrokeMode, pointsToPath } from '../utils/strokeUtils';
import { KanjiData } from '../data/kanjiData';
import { validateKanji, ValidationResult } from '../utils/validationUtils';

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
  expectedKanji?: KanjiData;
}

const STROKE_MODES: { mode: StrokeMode; label: string }[] = [
  { mode: 'basic', label: 'Basic' },
  { mode: 'smooth', label: 'Smooth' },
  { mode: 'brush', label: 'Brush' },
];

export function KanjiCanvas({
  width = 300,
  height = 300,
  strokeColor = '#000000',
  strokeWidth = 8,
  expectedKanji,
}: KanjiCanvasProps) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [currentIsFilled, setCurrentIsFilled] = useState(false);
  const [strokeMode, setStrokeMode] = useState<StrokeMode>('basic');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const pointsRef = useRef<Point[]>([]);
  const pointsHistoryRef = useRef<Point[][]>([]);
  const strokeColorRef = useRef(strokeColor);
  const strokeWidthRef = useRef(strokeWidth);
  const strokeModeRef = useRef(strokeMode);

  // Keep refs in sync with props/state
  strokeColorRef.current = strokeColor;
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
          // Store raw points for validation
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
      <View style={[styles.validationContainer, overallMatch ? styles.validationSuccess : styles.validationError]}>
        <Text style={styles.validationTitle}>
          {overallMatch ? 'Good!' : 'Try Again'}
        </Text>
        <Text style={styles.validationText}>
          Strokes: {actualStrokes}/{expectedStrokes} {strokeCountMatch ? '✓' : '✗'}
        </Text>
        <Text style={styles.validationText}>
          Directions: {matchedDirections}/{totalDirections} matched
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        {STROKE_MODES.map(({ mode, label }) => (
          <Pressable
            key={mode}
            style={[
              styles.modeButton,
              strokeMode === mode && styles.modeButtonActive,
            ]}
            onPress={() => setStrokeMode(mode)}
          >
            <Text
              style={[
                styles.modeButtonText,
                strokeMode === mode && styles.modeButtonTextActive,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View
        style={[styles.canvasContainer, { width, height }]}
        {...panResponder.panHandlers}
      >
        <Svg width={width} height={height} style={styles.svg}>
          {/* Render completed strokes */}
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
          {/* Render current stroke being drawn */}
          {currentPath &&
            (currentIsFilled ? (
              <Path d={currentPath} fill={strokeColor} stroke="none" />
            ) : (
              <Path
                d={currentPath}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
        </Svg>
      </View>

      <View style={styles.buttons}>
        <Pressable style={styles.button} onPress={handleUndo}>
          <Text style={styles.buttonText}>Undo</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleClear}>
          <Text style={styles.buttonText}>Clear</Text>
        </Pressable>
        {expectedKanji && (
          <Pressable style={[styles.button, styles.checkButton]} onPress={handleCheck}>
            <Text style={styles.buttonText}>Check</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.strokeCount}>Strokes: {strokes.length}</Text>

      {renderValidationMessage()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
  },
  modeButtonActive: {
    backgroundColor: '#333',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  canvasContainer: {
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  svg: {
    backgroundColor: 'transparent',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  checkButton: {
    backgroundColor: '#2563eb',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  strokeCount: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  validationContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 200,
  },
  validationSuccess: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
    borderWidth: 1,
  },
  validationError: {
    backgroundColor: '#fee2e2',
    borderColor: '#dc2626',
    borderWidth: 1,
  },
  validationTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  validationText: {
    fontSize: 14,
    color: '#333',
  },
});
