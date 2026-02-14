import { Point } from './strokeUtils';
import { KanjiVGData, KanjiVGStroke, StrokeDirection, Quadrant } from '../data/kanjiVGTypes';
import {
  MATCH_THRESHOLD,
  CURVE_DEVIATION_THRESHOLD,
  CURVE_MIN_POINTS,
} from '../config/validationConfig';
import { validateStrokeOrder } from './strokeOrderValidator';

/** Ordered direction ring for adjacency checks. */
const DIRECTION_RING: StrokeDirection[] = [
  'right',
  'down-right',
  'down',
  'down-left',
  'left',
  'up-left',
  'up',
  'up-right',
];

export interface StrokeResult {
  directionMatch: boolean;
  spatialAccuracy: number;
  orderCorrect: boolean;
}

export interface ValidationResult {
  strokeCountMatch: boolean;
  expectedStrokes: number;
  actualStrokes: number;
  strokeDirectionMatches: boolean[];
  strokeOrderCorrect: boolean;
  perStroke: StrokeResult[];
  overallScore: number;
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
  if (points.length > CURVE_MIN_POINTS) {
    const isCurved = checkIfCurved(points, start, end);
    if (isCurved) {
      return 'curved';
    }
  }

  // Map angle to direction category
  // Normalize angle to 0-360
  const normalizedAngle = angle < 0 ? angle + 360 : angle;

  // 8 cardinal directions, each covering a 45° sector
  if (normalizedAngle >= 337.5 || normalizedAngle < 22.5) return 'right';
  if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) return 'down-right';
  if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) return 'down';
  if (normalizedAngle >= 112.5 && normalizedAngle < 157.5) return 'down-left';
  if (normalizedAngle >= 157.5 && normalizedAngle < 202.5) return 'left';
  if (normalizedAngle >= 202.5 && normalizedAngle < 247.5) return 'up-left';
  if (normalizedAngle >= 247.5 && normalizedAngle < 292.5) return 'up';
  return 'up-right';
}

/**
 * Check if a stroke is curved by measuring max deviation from straight line
 */
function checkIfCurved(points: Point[], start: Point, end: Point): boolean {
  const lineLength = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));

  if (lineLength < 10) return false;

  let maxDeviation = 0;

  for (const point of points) {
    const deviation = pointToLineDistance(point, start, end);
    maxDeviation = Math.max(maxDeviation, deviation);
  }

  return maxDeviation / lineLength > CURVE_DEVIATION_THRESHOLD;
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
 */
export function getQuadrant(point: Point, canvasSize: number): Quadrant {
  const midX = canvasSize / 2;
  const midY = canvasSize / 2;

  if (point.x < midX && point.y < midY) return 1;
  if (point.x >= midX && point.y < midY) return 2;
  if (point.x < midX && point.y >= midY) return 3;
  return 4;
}

/**
 * Check if two directions are adjacent on the 8-direction ring (within 1 step).
 */
function areDirectionsAdjacent(a: StrokeDirection, b: StrokeDirection): boolean {
  if (a === 'curved' || b === 'curved') return false;
  const idxA = DIRECTION_RING.indexOf(a);
  const idxB = DIRECTION_RING.indexOf(b);
  if (idxA === -1 || idxB === -1) return false;
  const diff = Math.abs(idxA - idxB);
  return diff <= 1 || diff === DIRECTION_RING.length - 1;
}

/**
 * Compare detected direction with expected direction.
 */
function directionsMatch(
  detected: StrokeDirection,
  expected: StrokeDirection,
  expectedStroke?: KanjiVGStroke
): boolean {
  if (detected === expected) return true;

  if (expected === 'curved') {
    if (detected === 'curved') return true;
    const primary = expectedStroke?.primaryDirection;
    if (primary && areDirectionsAdjacent(detected, primary)) return true;
    return false;
  }

  return false;
}

/**
 * Validate drawn strokes against expected kanji data.
 * Returns enriched result with per-stroke feedback, scores, and stroke order.
 */
export function validateKanji(
  drawnStrokes: Point[][],
  expectedKanji: KanjiVGData,
  canvasSize: number
): ValidationResult {
  const actualStrokes = drawnStrokes.length;
  const expectedStrokesCount = expectedKanji.strokes.length;
  const strokeCountMatch = actualStrokes === expectedStrokesCount;

  // Direction matching (sequential, as before)
  const strokeDirectionMatches: boolean[] = [];
  const minStrokes = Math.min(actualStrokes, expectedStrokesCount);

  for (let i = 0; i < minStrokes; i++) {
    const drawnPoints = drawnStrokes[i];
    const expectedStroke = expectedKanji.strokes[i];

    if (!drawnPoints || drawnPoints.length < 2) {
      strokeDirectionMatches.push(false);
      continue;
    }

    const detectedDirection = detectStrokeDirection(drawnPoints);
    strokeDirectionMatches.push(
      directionsMatch(detectedDirection, expectedStroke.direction, expectedStroke)
    );
  }

  for (let i = minStrokes; i < expectedStrokesCount; i++) {
    strokeDirectionMatches.push(false);
  }

  // Stroke order + spatial accuracy
  const orderResult = validateStrokeOrder(drawnStrokes, expectedKanji.strokes, canvasSize);

  // Build per-stroke results
  const perStroke: StrokeResult[] = [];
  for (let i = 0; i < minStrokes; i++) {
    const matchedIdx = orderResult.matchedIndices[i];
    perStroke.push({
      directionMatch: strokeDirectionMatches[i],
      spatialAccuracy: orderResult.spatialAccuracies[i] ?? 0,
      orderCorrect: matchedIdx === i,
    });
  }

  // Overall score (0-100)
  const directionMatchCount = strokeDirectionMatches.filter(Boolean).length;
  const directionScore =
    expectedStrokesCount > 0 ? (directionMatchCount / expectedStrokesCount) * 100 : 0;
  const avgSpatial =
    perStroke.length > 0
      ? (perStroke.reduce((sum, s) => sum + s.spatialAccuracy, 0) / perStroke.length) * 100
      : 0;
  const countPenalty = strokeCountMatch ? 0 : 20;
  const orderBonus = orderResult.strokeOrderCorrect ? 10 : 0;

  const overallScore = Math.round(
    Math.max(0, Math.min(100, directionScore * 0.4 + avgSpatial * 0.4 + orderBonus - countPenalty))
  );

  const directionMatchRatio =
    expectedStrokesCount > 0 ? directionMatchCount / expectedStrokesCount : 0;
  const overallMatch = strokeCountMatch && directionMatchRatio >= MATCH_THRESHOLD;

  return {
    strokeCountMatch,
    expectedStrokes: expectedStrokesCount,
    actualStrokes,
    strokeDirectionMatches,
    strokeOrderCorrect: orderResult.strokeOrderCorrect,
    perStroke,
    overallScore,
    overallMatch,
  };
}
