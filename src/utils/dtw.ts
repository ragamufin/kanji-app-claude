/**
 * Simplified Dynamic Time Warping for path comparison.
 * Compares two 2D point sequences and returns a normalized distance score.
 */

interface Point2D {
  x: number;
  y: number;
}

function euclidean(a: Point2D, b: Point2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Resample a polyline to a fixed number of evenly-spaced points.
 */
export function resamplePath(points: Point2D[], count: number): Point2D[] {
  if (points.length === 0) return [];
  if (points.length === 1) return Array(count).fill(points[0]);

  // Calculate total length
  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    totalLength += euclidean(points[i - 1], points[i]);
  }

  if (totalLength === 0) return Array(count).fill(points[0]);

  const spacing = totalLength / (count - 1);
  const result: Point2D[] = [points[0]];
  let accumulated = 0;
  let srcIdx = 1;

  for (let i = 1; i < count - 1; i++) {
    const target = spacing * i;
    while (srcIdx < points.length) {
      const segLen = euclidean(points[srcIdx - 1], points[srcIdx]);
      if (accumulated + segLen >= target) {
        const t = (target - accumulated) / segLen;
        result.push({
          x: points[srcIdx - 1].x + t * (points[srcIdx].x - points[srcIdx - 1].x),
          y: points[srcIdx - 1].y + t * (points[srcIdx].y - points[srcIdx - 1].y),
        });
        break;
      }
      accumulated += segLen;
      srcIdx++;
    }
    if (result.length <= i) {
      result.push(points[points.length - 1]);
    }
  }
  result.push(points[points.length - 1]);

  return result;
}

/**
 * Compute DTW distance between two point sequences.
 * Returns the average distance per step (lower = more similar).
 */
export function dtwDistance(a: Point2D[], b: Point2D[]): number {
  const n = a.length;
  const m = b.length;
  if (n === 0 || m === 0) return Infinity;

  // Use flat array for perf
  const dtw = new Float64Array((n + 1) * (m + 1));
  const cols = m + 1;

  for (let i = 0; i <= n; i++) dtw[i * cols] = Infinity;
  for (let j = 0; j <= m; j++) dtw[j] = Infinity;
  dtw[0] = 0;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = euclidean(a[i - 1], b[j - 1]);
      const idx = i * cols + j;
      dtw[idx] =
        cost +
        Math.min(
          dtw[(i - 1) * cols + j], // insertion
          dtw[i * cols + (j - 1)], // deletion
          dtw[(i - 1) * cols + (j - 1)] // match
        );
    }
  }

  // Normalize by path length
  return dtw[n * cols + m] / Math.max(n, m);
}
