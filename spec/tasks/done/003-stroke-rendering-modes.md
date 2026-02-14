# Task 003: Stroke Rendering Modes

## Status: done
## Priority: P0
## Dependencies: 002

## Description
Three stroke rendering algorithms with different visual styles: basic (straight lines), smooth (Catmull-Rom splines), and brush (velocity-sensitive variable width).

## Key Files
- `src/utils/strokeUtils.ts` - All three rendering algorithms
- `src/config/strokeConfig.ts` - Rendering configuration constants

## Implementation Notes
- Basic: SVG M + L commands, simple polyline
- Smooth: Catmull-Rom spline (tension divisor=6) converted to cubic bezier C commands. Uses P[i-1] and P[i+2] as guide points for segment P[i]->P[i+1]
- Brush: Velocity-based width mapping. Width inversely proportional to speed (faster = thinner). Min/max: 0.3x-1.5x base width. Start taper 0.5x, end taper 0.3x. Width smoothing: 2 iterations of [w(i-1)+2*w(i)+w(i+1)]/4. Perpendicular edge offsets create left/right polygon edges. Rendered as filled path (not stroked)
- Router function pointsToPath() returns {path, isFilled} based on mode

## Acceptance Criteria
- [x] Basic mode renders clean straight-line strokes
- [x] Smooth mode produces visually smooth curves
- [x] Brush mode creates calligraphy-like variable-width strokes
- [x] Mode switching works via toolbar buttons
- [x] All modes work on iOS, Android, and Web

## Tests
Pending - see tasks 017, 018, 019
