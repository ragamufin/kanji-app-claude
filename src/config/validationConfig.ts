/** Configuration constants for stroke validation. */

/** Minimum ratio of direction matches required for overall match. */
export const MATCH_THRESHOLD = 0.7;

/** Max deviation / line length ratio to classify a stroke as curved. */
export const CURVE_DEVIATION_THRESHOLD = 0.15;

/** Minimum number of points before checking for curvature. */
export const CURVE_MIN_POINTS = 5;
