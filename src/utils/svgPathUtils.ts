/**
 * Utilities for parsing SVG path data and deriving stroke metadata.
 */

import { StrokeDirection, Quadrant } from '../data/kanjiVGTypes';

interface PathEndpoints {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

/**
 * Parse an SVG path string to extract start and end coordinates.
 * Handles M (moveto), L (lineto), C (curveto), c (relative curveto), and other commands.
 */
export function parsePathEndpoints(path: string): PathEndpoints {
  // Extract all numeric values as coordinate pairs
  // Match commands and their parameters
  const commandRegex = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
  let match;

  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let hasStart = false;

  while ((match = commandRegex.exec(path)) !== null) {
    const command = match[1];
    const params = match[2]
      .trim()
      .split(/[\s,]+/)
      .filter((s) => s.length > 0)
      .map(parseFloat);

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
          // Additional pairs are implicit lineto
          for (let i = 2; i + 1 < params.length; i += 2) {
            currentX = params[i];
            currentY = params[i + 1];
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
          for (let i = 2; i + 1 < params.length; i += 2) {
            currentX += params[i];
            currentY += params[i + 1];
          }
        }
        break;
      case 'L': // Absolute lineto
        for (let i = 0; i + 1 < params.length; i += 2) {
          currentX = params[i];
          currentY = params[i + 1];
        }
        break;
      case 'l': // Relative lineto
        for (let i = 0; i + 1 < params.length; i += 2) {
          currentX += params[i];
          currentY += params[i + 1];
        }
        break;
      case 'H': // Absolute horizontal lineto
        if (params.length >= 1) {
          currentX = params[params.length - 1];
        }
        break;
      case 'h': // Relative horizontal lineto
        for (const p of params) {
          currentX += p;
        }
        break;
      case 'V': // Absolute vertical lineto
        if (params.length >= 1) {
          currentY = params[params.length - 1];
        }
        break;
      case 'v': // Relative vertical lineto
        for (const p of params) {
          currentY += p;
        }
        break;
      case 'C': // Absolute cubic bezier
        // C x1 y1 x2 y2 x y (can have multiple sets)
        for (let i = 0; i + 5 < params.length; i += 6) {
          currentX = params[i + 4];
          currentY = params[i + 5];
        }
        if (params.length >= 6) {
          currentX = params[params.length - 2];
          currentY = params[params.length - 1];
        }
        break;
      case 'c': // Relative cubic bezier
        for (let i = 0; i + 5 < params.length; i += 6) {
          currentX += params[i + 4];
          currentY += params[i + 5];
        }
        break;
      case 'S': // Absolute smooth cubic bezier
        // S x2 y2 x y
        for (let i = 0; i + 3 < params.length; i += 4) {
          currentX = params[i + 2];
          currentY = params[i + 3];
        }
        if (params.length >= 4) {
          currentX = params[params.length - 2];
          currentY = params[params.length - 1];
        }
        break;
      case 's': // Relative smooth cubic bezier
        for (let i = 0; i + 3 < params.length; i += 4) {
          currentX += params[i + 2];
          currentY += params[i + 3];
        }
        break;
      case 'Q': // Absolute quadratic bezier
        // Q x1 y1 x y
        for (let i = 0; i + 3 < params.length; i += 4) {
          currentX = params[i + 2];
          currentY = params[i + 3];
        }
        if (params.length >= 4) {
          currentX = params[params.length - 2];
          currentY = params[params.length - 1];
        }
        break;
      case 'q': // Relative quadratic bezier
        for (let i = 0; i + 3 < params.length; i += 4) {
          currentX += params[i + 2];
          currentY += params[i + 3];
        }
        break;
      case 'T': // Absolute smooth quadratic bezier
        // T x y
        for (let i = 0; i + 1 < params.length; i += 2) {
          currentX = params[i];
          currentY = params[i + 1];
        }
        break;
      case 't': // Relative smooth quadratic bezier
        for (let i = 0; i + 1 < params.length; i += 2) {
          currentX += params[i];
          currentY += params[i + 1];
        }
        break;
      case 'A': // Absolute arc
        // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
        for (let i = 0; i + 6 < params.length; i += 7) {
          currentX = params[i + 5];
          currentY = params[i + 6];
        }
        if (params.length >= 7) {
          currentX = params[params.length - 2];
          currentY = params[params.length - 1];
        }
        break;
      case 'a': // Relative arc
        for (let i = 0; i + 6 < params.length; i += 7) {
          currentX += params[i + 5];
          currentY += params[i + 6];
        }
        break;
      case 'Z':
      case 'z':
        // Close path - return to start point
        currentX = startX;
        currentY = startY;
        break;
    }
  }

  return {
    startX,
    startY,
    endX: currentX,
    endY: currentY,
  };
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

  // Horizontal: pointing right (0) or left (180)
  // -22.5 to 22.5 or 157.5 to 202.5
  if (
    (normalizedAngle >= 0 && normalizedAngle < 22.5) ||
    (normalizedAngle >= 337.5 && normalizedAngle <= 360) ||
    (normalizedAngle >= 157.5 && normalizedAngle < 202.5)
  ) {
    return 'horizontal';
  }

  // Vertical: pointing down (90) or up (270)
  // 67.5 to 112.5 or 247.5 to 292.5
  if (
    (normalizedAngle >= 67.5 && normalizedAngle < 112.5) ||
    (normalizedAngle >= 247.5 && normalizedAngle < 292.5)
  ) {
    return 'vertical';
  }

  // "/" slant (down-right or up-left): 22.5 to 67.5 or 202.5 to 247.5
  // Visually rises from left to right = diagonal-up
  if (
    (normalizedAngle >= 22.5 && normalizedAngle < 67.5) ||
    (normalizedAngle >= 202.5 && normalizedAngle < 247.5)
  ) {
    return 'diagonal-up';
  }

  // "\" slant (down-left or up-right): 112.5 to 157.5 or 292.5 to 337.5
  // Visually falls from left to right = diagonal-down
  return 'diagonal-down';
}

/**
 * Derive quadrant from coordinates within a 109x109 viewBox.
 * 1=top-left, 2=top-right, 3=bottom-left, 4=bottom-right
 */
export function deriveQuadrant(x: number, y: number, viewBoxSize = 109): Quadrant {
  const midX = viewBoxSize / 2;
  const midY = viewBoxSize / 2;

  if (x < midX && y < midY) return 1; // top-left
  if (x >= midX && y < midY) return 2; // top-right
  if (x < midX && y >= midY) return 3; // bottom-left
  return 4; // bottom-right
}

/**
 * Derive all stroke metadata from an SVG path string.
 */
export function deriveStrokeMetadata(
  path: string,
  viewBoxSize = 109
): {
  direction: StrokeDirection;
  startQuadrant: Quadrant;
  endQuadrant: Quadrant;
} {
  const { startX, startY, endX, endY } = parsePathEndpoints(path);

  return {
    direction: deriveStrokeDirection(startX, startY, endX, endY),
    startQuadrant: deriveQuadrant(startX, startY, viewBoxSize),
    endQuadrant: deriveQuadrant(endX, endY, viewBoxSize),
  };
}
