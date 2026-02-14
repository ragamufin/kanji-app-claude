/** Configuration constants for stroke rendering algorithms. */

/** Catmull-Rom tension divisor for bezier control point calculation. */
export const CATMULL_ROM_TENSION = 6;

/** Velocity normalization ceiling (pixels/ms) for brush width mapping. */
export const VELOCITY_NORMALIZATION = 1.5;

/** Minimum brush width as a fraction of baseWidth. */
export const BRUSH_WIDTH_MIN = 0.3;

/** Maximum brush width as a fraction of baseWidth. */
export const BRUSH_WIDTH_MAX = 1.5;

/** Starting taper width as a fraction of baseWidth. */
export const BRUSH_START_TAPER = 0.5;

/** Ending taper width as a fraction of baseWidth. */
export const BRUSH_END_TAPER = 0.3;

/** Number of smoothing iterations for brush width values. */
export const SMOOTHING_ITERATIONS = 2;
