import { Point } from './strokeUtils';
import { KanjiVGData, StrokeDirection, Quadrant } from '../data/kanjiVGTypes';

export interface ValidationResult {
  strokeCountMatch: boolean;
  expectedStrokes: number;
  actualStrokes: number;
  strokeDirectionMatches: boolean[];
  overallMatch: boolean;
}

/**
 * Detect the direction of a stroke from its points
 */
export function detectStrokeDirection(points: Point[]): StrokeDirection {
  if (points.length < 2) {
    return 'right';
  }

  const start = points[0];
  const end = points[points.length - 1];
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  // Calculate angle in degrees (-180 to 180)
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Check if the stroke is mostly straight or curved
  // by measuring deviation from the straight line
  if (points.length > 5) {
    const isCurved = checkIfCurved(points, start, end);
    if (isCurved) {
      return 'curved';
    }
  }

  // Map angle to direction category
  // Normalize angle to 0-360
  const normalizedAngle = angle < 0 ? angle + 360 : angle;

  // 8 cardinal directions, each covering a 45° sector
  // right: 337.5° to 22.5° (centered on 0°)
  if (normalizedAngle >= 337.5 || normalizedAngle < 22.5) {
    return 'right';
  }
  // down-right: 22.5° to 67.5° (centered on 45°)
  if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) {
    return 'down-right';
  }
  // down: 67.5° to 112.5° (centered on 90°)
  if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) {
    return 'down';
  }
  // down-left: 112.5° to 157.5° (centered on 135°)
  if (normalizedAngle >= 112.5 && normalizedAngle < 157.5) {
    return 'down-left';
  }
  // left: 157.5° to 202.5° (centered on 180°)
  if (normalizedAngle >= 157.5 && normalizedAngle < 202.5) {
    return 'left';
  }
  // up-left: 202.5° to 247.5° (centered on 225°)
  if (normalizedAngle >= 202.5 && normalizedAngle < 247.5) {
    return 'up-left';
  }
  // up: 247.5° to 292.5° (centered on 270°)
  if (normalizedAngle >= 247.5 && normalizedAngle < 292.5) {
    return 'up';
  }
  // up-right: 292.5° to 337.5° (centered on 315°)
  return 'up-right';
}

/**
 * Check if a stroke is curved by measuring max deviation from straight line
 */
function checkIfCurved(
  points: Point[],
  start: Point,
  end: Point
): boolean {
  const lineLength = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );

  if (lineLength < 10) return false;

  let maxDeviation = 0;

  for (const point of points) {
    // Calculate perpendicular distance from point to line
    const deviation = pointToLineDistance(point, start, end);
    maxDeviation = Math.max(maxDeviation, deviation);
  }

  // If deviation is more than 15% of line length, consider it curved
  return maxDeviation / lineLength > 0.15;
}

/**
 * Calculate perpendicular distance from point to line
 */
function pointToLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;

  if (lenSq === 0) {
    return Math.sqrt(A * A + B * B);
  }

  const param = dot / lenSq;

  let xx: number, yy: number;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;

  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get the quadrant of a point within the canvas
 * 1=top-left, 2=top-right, 3=bottom-left, 4=bottom-right
 */
export function getQuadrant(point: Point, canvasSize: number): Quadrant {
  const midX = canvasSize / 2;
  const midY = canvasSize / 2;

  if (point.x < midX && point.y < midY) return 1; // top-left
  if (point.x >= midX && point.y < midY) return 2; // top-right
  if (point.x < midX && point.y >= midY) return 3; // bottom-left
  return 4; // bottom-right
}

/**
 * Compare detected direction with expected direction
 * Uses fuzzy matching for similar directions
 */
function directionsMatch(
  detected: StrokeDirection,
  expected: StrokeDirection
): boolean {
  if (detected === expected) return true;

  // Allow some flexibility for curved strokes
  if (expected === 'curved') {
    return true; // Any detected direction can match curved
  }

  return false;
}

/**
 * Validate drawn strokes against expected kanji data
 */
export function validateKanji(
  drawnStrokes: Point[][],
  expectedKanji: KanjiVGData,
  canvasSize: number
): ValidationResult {
  const actualStrokes = drawnStrokes.length;
  const expectedStrokes = expectedKanji.strokes.length;
  const strokeCountMatch = actualStrokes === expectedStrokes;

  // Compare each stroke's direction
  const strokeDirectionMatches: boolean[] = [];
  const minStrokes = Math.min(actualStrokes, expectedStrokes);

  for (let i = 0; i < minStrokes; i++) {
    const drawnPoints = drawnStrokes[i];
    const expectedStroke = expectedKanji.strokes[i];

    if (!drawnPoints || drawnPoints.length < 2) {
      strokeDirectionMatches.push(false);
      continue;
    }

    const detectedDirection = detectStrokeDirection(drawnPoints);
    const directionMatch = directionsMatch(
      detectedDirection,
      expectedStroke.direction
    );

    strokeDirectionMatches.push(directionMatch);
  }

  // Fill in false for any extra expected strokes not drawn
  for (let i = minStrokes; i < expectedStrokes; i++) {
    strokeDirectionMatches.push(false);
  }

  // Overall match requires correct stroke count and at least 70% direction matches
  const directionMatchCount = strokeDirectionMatches.filter(Boolean).length;
  const directionMatchRatio =
    expectedStrokes > 0 ? directionMatchCount / expectedStrokes : 0;
  const overallMatch = strokeCountMatch && directionMatchRatio >= 0.7;

  return {
    strokeCountMatch,
    expectedStrokes,
    actualStrokes,
    strokeDirectionMatches,
    overallMatch,
  };
}
