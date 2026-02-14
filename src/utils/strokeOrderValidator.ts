/**
 * Stroke order validation — matches drawn strokes to expected strokes.
 */

import { Point } from './strokeUtils';
import { KanjiVGStroke, StrokeDirection } from '../data/kanjiVGTypes';
import { parsePathWithWaypoints, deriveStrokeDirection } from './svgPathUtils';
import { KANJIVG_VIEWBOX_SIZE } from '../config/kanjiConfig';
import { resamplePath, dtwDistance } from './dtw';

const DTW_SAMPLE_COUNT = 50;

/** Direction ring for angular proximity. */
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

function directionDistance(a: StrokeDirection, b: StrokeDirection): number {
  if (a === 'curved' || b === 'curved') return 1;
  const idxA = DIRECTION_RING.indexOf(a);
  const idxB = DIRECTION_RING.indexOf(b);
  if (idxA === -1 || idxB === -1) return 4;
  const diff = Math.abs(idxA - idxB);
  return Math.min(diff, 8 - diff);
}

function detectDirection(points: Point[]): StrokeDirection {
  if (points.length < 2) return 'right';
  const start = points[0];
  const end = points[points.length - 1];
  return deriveStrokeDirection(start.x, start.y, end.x, end.y);
}

/**
 * For a single drawn stroke, compute a cost against a single expected stroke.
 * Lower cost = better match.
 */
function matchCost(drawnPoints: Point[], expected: KanjiVGStroke, canvasSize: number): number {
  const scale = canvasSize / KANJIVG_VIEWBOX_SIZE;
  const analysis = parsePathWithWaypoints(expected.path);

  // Start position proximity (normalized 0-1)
  const startDx = drawnPoints[0].x - analysis.startX * scale;
  const startDy = drawnPoints[0].y - analysis.startY * scale;
  const startDist = Math.sqrt(startDx * startDx + startDy * startDy) / canvasSize;

  // End position proximity
  const endPt = drawnPoints[drawnPoints.length - 1];
  const endDx = endPt.x - analysis.endX * scale;
  const endDy = endPt.y - analysis.endY * scale;
  const endDist = Math.sqrt(endDx * endDx + endDy * endDy) / canvasSize;

  // Direction similarity (0-4, normalized to 0-1)
  const drawnDir = detectDirection(drawnPoints);
  const dirCost = directionDistance(drawnDir, expected.direction) / 4;

  return startDist * 0.4 + endDist * 0.3 + dirCost * 0.3;
}

export interface StrokeOrderResult {
  /** For each drawn stroke, which expected stroke index it best matches. */
  matchedIndices: number[];
  /** Whether strokes were drawn in order. */
  strokeOrderCorrect: boolean;
  /** Per-stroke spatial accuracy (0-1, higher = better). */
  spatialAccuracies: number[];
}

/**
 * Validate stroke order and spatial accuracy.
 */
export function validateStrokeOrder(
  drawnStrokes: Point[][],
  expectedStrokes: KanjiVGStroke[],
  canvasSize: number
): StrokeOrderResult {
  const scale = canvasSize / KANJIVG_VIEWBOX_SIZE;
  const matchedIndices: number[] = [];
  const spatialAccuracies: number[] = [];
  const usedExpected = new Set<number>();

  // Greedily match each drawn stroke to the best unmatched expected stroke
  for (const drawnPoints of drawnStrokes) {
    if (drawnPoints.length < 2) {
      matchedIndices.push(-1);
      spatialAccuracies.push(0);
      continue;
    }

    let bestIdx = -1;
    let bestCost = Infinity;

    for (let j = 0; j < expectedStrokes.length; j++) {
      if (usedExpected.has(j)) continue;
      const cost = matchCost(drawnPoints, expectedStrokes[j], canvasSize);
      if (cost < bestCost) {
        bestCost = cost;
        bestIdx = j;
      }
    }

    matchedIndices.push(bestIdx);
    if (bestIdx >= 0) {
      usedExpected.add(bestIdx);

      // Compute spatial accuracy using DTW
      const analysis = parsePathWithWaypoints(expectedStrokes[bestIdx].path);
      const expectedPoints = analysis.waypoints.map((p) => ({
        x: p.x * scale,
        y: p.y * scale,
      }));
      const drawnXY = drawnPoints.map((p) => ({ x: p.x, y: p.y }));

      const resampledExpected = resamplePath(expectedPoints, DTW_SAMPLE_COUNT);
      const resampledDrawn = resamplePath(drawnXY, DTW_SAMPLE_COUNT);

      const avgDist = dtwDistance(resampledDrawn, resampledExpected);
      // Normalize: a perfect match is ~0, treat >canvasSize/4 as 0 accuracy
      const maxReasonableDist = canvasSize / 4;
      const accuracy = Math.max(0, 1 - avgDist / maxReasonableDist);
      spatialAccuracies.push(accuracy);
    } else {
      spatialAccuracies.push(0);
    }
  }

  // Check if matched indices are monotonically increasing (order correct)
  const validIndices = matchedIndices.filter((i) => i >= 0);
  let strokeOrderCorrect = true;
  for (let i = 1; i < validIndices.length; i++) {
    if (validIndices[i] <= validIndices[i - 1]) {
      strokeOrderCorrect = false;
      break;
    }
  }

  return { matchedIndices, strokeOrderCorrect, spatialAccuracies };
}
