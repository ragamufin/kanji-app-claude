/**
 * Utilities for parsing SVG path data and deriving stroke metadata.
 */

import { StrokeDirection, Quadrant } from '../data/kanjiVGTypes';
import {
  KANJIVG_VIEWBOX_SIZE,
  WAYPOINT_MIN_DISTANCE,
  BEND_THRESHOLD_DEGREES,
} from '../config/kanjiConfig';

interface Point {
  x: number;
  y: number;
}

interface PathAnalysis {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  /** Key waypoints along the path for detecting bends */
  waypoints: Point[];
}

/**
 * Parse an SVG path string to extract start, end, and waypoints.
 * Waypoints are collected at each command endpoint to detect bends.
 */
export function parsePathWithWaypoints(path: string): PathAnalysis {
  const commandRegex = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
  let match;

  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let hasStart = false;
  const waypoints: Point[] = [];

  const addWaypoint = () => {
    waypoints.push({ x: currentX, y: currentY });
  };

  while ((match = commandRegex.exec(path)) !== null) {
    const command = match[1];
    // Parse SVG path numbers - handles concatenated numbers like "17.46-2.17"
    const numRegex = /-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g;
    const params: number[] = [];
    let numMatch;
    while ((numMatch = numRegex.exec(match[2])) !== null) {
      params.push(parseFloat(numMatch[0]));
    }

    switch (command) {
      case 'M': // Absolute moveto
        if (params.length >= 2) {
          currentX = params[0];
          currentY = params[1];
          if (!hasStart) {
            startX = currentX;
            startY = currentY;
            hasStart = true;
          }
          addWaypoint();
          // Additional pairs are implicit lineto
          for (let i = 2; i + 1 < params.length; i += 2) {
            currentX = params[i];
            currentY = params[i + 1];
            addWaypoint();
          }
        }
        break;
      case 'm': // Relative moveto
        if (params.length >= 2) {
          currentX += params[0];
          currentY += params[1];
          if (!hasStart) {
            startX = currentX;
            startY = currentY;
            hasStart = true;
          }
          addWaypoint();
          for (let i = 2; i + 1 < params.length; i += 2) {
            currentX += params[i];
            currentY += params[i + 1];
            addWaypoint();
          }
        }
        break;
      case 'L': // Absolute lineto
        for (let i = 0; i + 1 < params.length; i += 2) {
          currentX = params[i];
          currentY = params[i + 1];
          addWaypoint();
        }
        break;
      case 'l': // Relative lineto
        for (let i = 0; i + 1 < params.length; i += 2) {
          currentX += params[i];
          currentY += params[i + 1];
          addWaypoint();
        }
        break;
      case 'H': // Absolute horizontal lineto
        for (const p of params) {
          currentX = p;
          addWaypoint();
        }
        break;
      case 'h': // Relative horizontal lineto
        for (const p of params) {
          currentX += p;
          addWaypoint();
        }
        break;
      case 'V': // Absolute vertical lineto
        for (const p of params) {
          currentY = p;
          addWaypoint();
        }
        break;
      case 'v': // Relative vertical lineto
        for (const p of params) {
          currentY += p;
          addWaypoint();
        }
        break;
      case 'C': // Absolute cubic bezier
        // C x1 y1 x2 y2 x y - collect endpoint of each curve
        for (let i = 0; i + 5 <= params.length; i += 6) {
          currentX = params[i + 4];
          currentY = params[i + 5];
          addWaypoint();
        }
        break;
      case 'c': // Relative cubic bezier
        for (let i = 0; i + 5 <= params.length; i += 6) {
          currentX += params[i + 4];
          currentY += params[i + 5];
          addWaypoint();
        }
        break;
      case 'S': // Absolute smooth cubic bezier
        for (let i = 0; i + 3 <= params.length; i += 4) {
          currentX = params[i + 2];
          currentY = params[i + 3];
          addWaypoint();
        }
        break;
      case 's': // Relative smooth cubic bezier
        for (let i = 0; i + 3 <= params.length; i += 4) {
          currentX += params[i + 2];
          currentY += params[i + 3];
          addWaypoint();
        }
        break;
      case 'Q': // Absolute quadratic bezier
        for (let i = 0; i + 3 <= params.length; i += 4) {
          currentX = params[i + 2];
          currentY = params[i + 3];
          addWaypoint();
        }
        break;
      case 'q': // Relative quadratic bezier
        for (let i = 0; i + 3 <= params.length; i += 4) {
          currentX += params[i + 2];
          currentY += params[i + 3];
          addWaypoint();
        }
        break;
      case 'T': // Absolute smooth quadratic bezier
        for (let i = 0; i + 1 <= params.length; i += 2) {
          currentX = params[i];
          currentY = params[i + 1];
          addWaypoint();
        }
        break;
      case 't': // Relative smooth quadratic bezier
        for (let i = 0; i + 1 <= params.length; i += 2) {
          currentX += params[i];
          currentY += params[i + 1];
          addWaypoint();
        }
        break;
      case 'A': // Absolute arc
        for (let i = 0; i + 6 <= params.length; i += 7) {
          currentX = params[i + 5];
          currentY = params[i + 6];
          addWaypoint();
        }
        break;
      case 'a': // Relative arc
        for (let i = 0; i + 6 <= params.length; i += 7) {
          currentX += params[i + 5];
          currentY += params[i + 6];
          addWaypoint();
        }
        break;
      case 'Z':
      case 'z':
        currentX = startX;
        currentY = startY;
        addWaypoint();
        break;
    }
  }

  return {
    startX,
    startY,
    endX: currentX,
    endY: currentY,
    waypoints,
  };
}

/**
 * Legacy function for backward compatibility.
 */
export function parsePathEndpoints(path: string): {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
} {
  const { startX, startY, endX, endY } = parsePathWithWaypoints(path);
  return { startX, startY, endX, endY };
}

/**
 * Calculate angle between two points in degrees (0-360).
 */
function angleBetweenPoints(from: Point, to: Point): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return angle < 0 ? angle + 360 : angle;
}

/**
 * Calculate the absolute difference between two angles, accounting for wraparound.
 */
function angleDifference(angle1: number, angle2: number): number {
  let diff = Math.abs(angle1 - angle2);
  if (diff > 180) {
    diff = 360 - diff;
  }
  return diff;
}

/**
 * Check if path has a significant bend by analyzing direction changes between waypoints.
 * Returns true if any consecutive segments change direction by more than the threshold.
 */
function hasBend(waypoints: Point[], thresholdDegrees = BEND_THRESHOLD_DEGREES): boolean {
  if (waypoints.length < 3) {
    return false;
  }

  // Filter out waypoints that are too close together (< 5 units apart)
  const significantWaypoints: Point[] = [waypoints[0]];
  for (let i = 1; i < waypoints.length; i++) {
    const prev = significantWaypoints[significantWaypoints.length - 1];
    const curr = waypoints[i];
    const dist = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
    if (dist >= WAYPOINT_MIN_DISTANCE) {
      significantWaypoints.push(curr);
    }
  }

  if (significantWaypoints.length < 3) {
    return false;
  }

  // Check direction changes between consecutive segments
  for (let i = 1; i < significantWaypoints.length - 1; i++) {
    const angle1 = angleBetweenPoints(significantWaypoints[i - 1], significantWaypoints[i]);
    const angle2 = angleBetweenPoints(significantWaypoints[i], significantWaypoints[i + 1]);
    const diff = angleDifference(angle1, angle2);

    if (diff > thresholdDegrees) {
      return true;
    }
  }

  return false;
}

/**
 * Derive stroke direction from start and end coordinates.
 * Uses the same angle-based logic as the validation utility.
 */
export function deriveStrokeDirection(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): StrokeDirection {
  const dx = endX - startX;
  const dy = endY - startY;

  // Calculate angle in degrees (-180 to 180)
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

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
 * Derive quadrant from coordinates within a 109x109 viewBox.
 * 1=top-left, 2=top-right, 3=bottom-left, 4=bottom-right
 */
export function deriveQuadrant(x: number, y: number, viewBoxSize = KANJIVG_VIEWBOX_SIZE): Quadrant {
  const midX = viewBoxSize / 2;
  const midY = viewBoxSize / 2;

  if (x < midX && y < midY) return 1; // top-left
  if (x >= midX && y < midY) return 2; // top-right
  if (x < midX && y >= midY) return 3; // bottom-left
  return 4; // bottom-right
}

/**
 * Derive all stroke metadata from an SVG path string.
 * Detects bending strokes and marks them as 'curved'.
 */
export function deriveStrokeMetadata(
  path: string,
  viewBoxSize = KANJIVG_VIEWBOX_SIZE
): {
  direction: StrokeDirection;
  primaryDirection?: StrokeDirection;
  startQuadrant: Quadrant;
  endQuadrant: Quadrant;
} {
  const { startX, startY, endX, endY, waypoints } = parsePathWithWaypoints(path);

  const straightDirection = deriveStrokeDirection(startX, startY, endX, endY);

  // Check for bending strokes first
  let direction: StrokeDirection;
  let primaryDirection: StrokeDirection | undefined;
  if (hasBend(waypoints)) {
    direction = 'curved';
    primaryDirection = straightDirection;
  } else {
    direction = straightDirection;
  }

  return {
    direction,
    primaryDirection,
    startQuadrant: deriveQuadrant(startX, startY, viewBoxSize),
    endQuadrant: deriveQuadrant(endX, endY, viewBoxSize),
  };
}
