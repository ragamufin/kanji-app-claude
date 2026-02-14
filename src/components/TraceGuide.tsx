import React from 'react';
import { G, Path } from 'react-native-svg';
import { KanjiVGData } from '../data/kanjiVGTypes';
import { KANJIVG_VIEWBOX_SIZE } from '../config/kanjiConfig';

interface TraceGuideProps {
  /** KanjiVG data for the character to display */
  data: KanjiVGData;
  /** Canvas width in pixels */
  width: number;
  /** Canvas height in pixels */
  height: number;
  /** Opacity of the guide strokes (default: 0.25) */
  opacity?: number;
  /** Stroke color (default: '#888') */
  strokeColor?: string;
  /** Stroke width (default: 4) */
  strokeWidth?: number;
}

/**
 * Renders KanjiVG strokes as a faded background guide for tracing.
 * Scales paths from KanjiVG's 109x109 viewBox to the canvas size.
 */
export function TraceGuide({
  data,
  width,
  height,
  opacity = 0.25,
  strokeColor = '#888',
  strokeWidth = 4,
}: TraceGuideProps) {
  const scaleX = width / KANJIVG_VIEWBOX_SIZE;
  const scaleY = height / KANJIVG_VIEWBOX_SIZE;

  return (
    <G opacity={opacity} transform={`scale(${scaleX}, ${scaleY})`}>
      {data.strokes.map((stroke) => (
        <Path
          key={stroke.id}
          d={stroke.path}
          stroke={strokeColor}
          strokeWidth={strokeWidth / Math.min(scaleX, scaleY)}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ))}
    </G>
  );
}
