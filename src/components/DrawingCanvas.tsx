import React from 'react';
import Svg, { Path, Defs, Pattern, Rect } from 'react-native-svg';
import { Stroke } from '../hooks/useDrawing';
import { KanjiVGData } from '../data/kanjiVGTypes';
import { TraceGuide } from './TraceGuide';
import { useTheme } from '../theme';

interface DrawingCanvasProps {
  width: number;
  height: number;
  strokes: Stroke[];
  currentPath: string;
  currentIsFilled: boolean;
  currentStrokeColor: string;
  currentStrokeWidth: number;
  showTraceGuide: boolean;
  kanjiVGData?: KanjiVGData;
}

export function DrawingCanvas({
  width,
  height,
  strokes,
  currentPath,
  currentIsFilled,
  currentStrokeColor,
  currentStrokeWidth,
  showTraceGuide,
  kanjiVGData,
}: DrawingCanvasProps) {
  const { colors } = useTheme();

  return (
    <Svg width={width} height={height} style={{ backgroundColor: 'transparent' }}>
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
      {showTraceGuide && kanjiVGData && (
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
      {strokes.map((stroke) =>
        stroke.isFilled ? (
          <Path key={stroke.id} d={stroke.path} fill={stroke.color} stroke="none" />
        ) : (
          <Path
            key={stroke.id}
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
          <Path d={currentPath} fill={currentStrokeColor} stroke="none" />
        ) : (
          <Path
            d={currentPath}
            stroke={currentStrokeColor}
            strokeWidth={currentStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}
    </Svg>
  );
}
