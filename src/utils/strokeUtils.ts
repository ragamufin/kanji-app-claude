import {
  CATMULL_ROM_TENSION,
  VELOCITY_NORMALIZATION,
  BRUSH_WIDTH_MIN,
  BRUSH_WIDTH_MAX,
  BRUSH_START_TAPER,
  BRUSH_END_TAPER,
  SMOOTHING_ITERATIONS,
} from '../config/strokeConfig';

export interface Point {
  x: number;
  y: number;
  timestamp: number;
}

export type StrokeMode = 'basic' | 'smooth' | 'brush';

/**
 * Convert points to basic straight line path (current behavior)
 */
export function pointsToBasicPath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }
  return path;
}

/**
 * Catmull-Rom spline interpolation
 * Converts a series of points into a smooth curve using cubic bezier approximations
 */
export function pointsToSmoothPath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  // Catmull-Rom to Bezier conversion
  // For each segment, we need 4 points: p0, p1, p2, p3
  // The curve goes from p1 to p2
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Convert Catmull-Rom to cubic bezier control points
    // Using tension = 0.5 (standard Catmull-Rom)
    const cp1x = p1.x + (p2.x - p0.x) / CATMULL_ROM_TENSION;
    const cp1y = p1.y + (p2.y - p0.y) / CATMULL_ROM_TENSION;
    const cp2x = p2.x - (p3.x - p1.x) / CATMULL_ROM_TENSION;
    const cp2y = p2.y - (p3.y - p1.y) / CATMULL_ROM_TENSION;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

/**
 * Calculate velocity between two points (pixels per millisecond)
 */
function calculateVelocity(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const dt = Math.max(1, p2.timestamp - p1.timestamp);
  return distance / dt;
}

/**
 * Map velocity to stroke width
 * Faster movement = thinner stroke
 */
function velocityToWidth(velocity: number, baseWidth: number): number {
  const minWidth = baseWidth * BRUSH_WIDTH_MIN;
  const maxWidth = baseWidth * BRUSH_WIDTH_MAX;

  // Velocity typically ranges from 0 to ~2 pixels/ms
  // Invert: higher velocity = thinner
  const normalizedVelocity = Math.min(1, velocity / VELOCITY_NORMALIZATION);
  const width = maxWidth - normalizedVelocity * (maxWidth - minWidth);

  return Math.max(minWidth, Math.min(maxWidth, width));
}

/**
 * Calculate perpendicular offset for a point given direction
 */
function getPerpendicularOffset(dx: number, dy: number, width: number): { ox: number; oy: number } {
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return { ox: 0, oy: width / 2 };

  // Perpendicular normalized and scaled by half width
  const ox = (-dy / len) * (width / 2);
  const oy = (dx / len) * (width / 2);

  return { ox, oy };
}

/**
 * Generate a filled polygon path for variable-width brush stroke
 * Creates an outline shape that can be filled
 */
export function pointsToBrushPath(points: Point[], baseWidth: number): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    // Single point: draw a circle
    const r = baseWidth / 2;
    return `M ${points[0].x - r} ${points[0].y}
            a ${r} ${r} 0 1 0 ${r * 2} 0
            a ${r} ${r} 0 1 0 ${-r * 2} 0`;
  }

  // Calculate widths for each point based on velocity
  const widths: number[] = [];
  for (let i = 0; i < points.length; i++) {
    if (i === 0) {
      // Start with tapered width
      widths.push(baseWidth * BRUSH_START_TAPER);
    } else if (i === points.length - 1) {
      // End with tapered width
      widths.push(baseWidth * BRUSH_END_TAPER);
    } else {
      const velocity = calculateVelocity(points[i - 1], points[i]);
      widths.push(velocityToWidth(velocity, baseWidth));
    }
  }

  // Smooth the widths to avoid abrupt changes
  const smoothedWidths = smoothWidths(widths);

  // Build left and right edge points
  const leftEdge: { x: number; y: number }[] = [];
  const rightEdge: { x: number; y: number }[] = [];

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const width = smoothedWidths[i];

    // Calculate direction
    let dx: number, dy: number;
    if (i === 0) {
      dx = points[1].x - p.x;
      dy = points[1].y - p.y;
    } else if (i === points.length - 1) {
      dx = p.x - points[i - 1].x;
      dy = p.y - points[i - 1].y;
    } else {
      // Average direction from neighbors
      dx = points[i + 1].x - points[i - 1].x;
      dy = points[i + 1].y - points[i - 1].y;
    }

    const { ox, oy } = getPerpendicularOffset(dx, dy, width);

    leftEdge.push({ x: p.x + ox, y: p.y + oy });
    rightEdge.push({ x: p.x - ox, y: p.y - oy });
  }

  // Build the path: go along left edge, then back along right edge
  let path = `M ${leftEdge[0].x} ${leftEdge[0].y}`;

  // Smooth curve along left edge
  for (let i = 0; i < leftEdge.length - 1; i++) {
    const p0 = leftEdge[Math.max(0, i - 1)];
    const p1 = leftEdge[i];
    const p2 = leftEdge[i + 1];
    const p3 = leftEdge[Math.min(leftEdge.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / CATMULL_ROM_TENSION;
    const cp1y = p1.y + (p2.y - p0.y) / CATMULL_ROM_TENSION;
    const cp2x = p2.x - (p3.x - p1.x) / CATMULL_ROM_TENSION;
    const cp2y = p2.y - (p3.y - p1.y) / CATMULL_ROM_TENSION;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  // Connect to right edge at the end (rounded cap)
  const lastRight = rightEdge[rightEdge.length - 1];
  const endRadius = smoothedWidths[smoothedWidths.length - 1] / 2;

  // Arc to right edge
  path += ` A ${endRadius} ${endRadius} 0 0 1 ${lastRight.x} ${lastRight.y}`;

  // Smooth curve back along right edge (reversed)
  for (let i = rightEdge.length - 1; i > 0; i--) {
    const p0 = rightEdge[Math.min(rightEdge.length - 1, i + 1)];
    const p1 = rightEdge[i];
    const p2 = rightEdge[i - 1];
    const p3 = rightEdge[Math.max(0, i - 2)];

    const cp1x = p1.x + (p2.x - p0.x) / CATMULL_ROM_TENSION;
    const cp1y = p1.y + (p2.y - p0.y) / CATMULL_ROM_TENSION;
    const cp2x = p2.x - (p3.x - p1.x) / CATMULL_ROM_TENSION;
    const cp2y = p2.y - (p3.y - p1.y) / CATMULL_ROM_TENSION;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  // Close path with rounded start cap
  const firstLeft = leftEdge[0];
  const startRadius = smoothedWidths[0] / 2;

  path += ` A ${startRadius} ${startRadius} 0 0 1 ${firstLeft.x} ${firstLeft.y}`;
  path += ' Z';

  return path;
}

/**
 * Smooth width values to avoid abrupt changes
 */
function smoothWidths(widths: number[]): number[] {
  if (widths.length <= 2) return widths;

  const smoothed = [...widths];
  const iterations = SMOOTHING_ITERATIONS;

  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 1; i < smoothed.length - 1; i++) {
      smoothed[i] = (smoothed[i - 1] + smoothed[i] * 2 + smoothed[i + 1]) / 4;
    }
  }

  return smoothed;
}

/**
 * Convert points to path based on selected mode
 */
export function pointsToPath(
  points: Point[],
  mode: StrokeMode,
  baseWidth: number
): { path: string; isFilled: boolean } {
  switch (mode) {
    case 'basic':
      return { path: pointsToBasicPath(points), isFilled: false };
    case 'smooth':
      return { path: pointsToSmoothPath(points), isFilled: false };
    case 'brush':
      return { path: pointsToBrushPath(points, baseWidth), isFilled: true };
    default:
      return { path: pointsToBasicPath(points), isFilled: false };
  }
}
