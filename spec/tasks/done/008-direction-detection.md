# Task 008: 8-Direction Stroke Detection

## Status: done
## Priority: P0
## Dependencies: 004

## Description
Classify strokes into 8 cardinal/ordinal directions plus "curved" for matching drawn strokes against expected KanjiVG data.

## Key Files
- `src/utils/svgPathUtils.ts` - deriveStrokeDirection(), deriveStrokeMetadata()
- `src/utils/validationUtils.ts` - detectStrokeDirection() for drawn strokes
- `src/data/kanjiVGTypes.ts` - StrokeDirection type definition

## Implementation Notes
- 8 sectors of 45 degrees each: right (337.5-22.5), down-right (22.5-67.5), down (67.5-112.5), etc.
- Direction derived from delta between start and end points: atan2(dy, dx)
- Curved detection: points sampled along path, max perpendicular deviation from start-to-end line measured
- If max deviation > 15% of line length AND enough points (>=5), classified as "curved"
- Curved strokes also get a primaryDirection (the straight-line direction) for fallback matching
- Adjacency check: directions within +/-1 sector considered adjacent for flexible matching

## Acceptance Criteria
- [x] All 8 cardinal directions correctly detected
- [x] Curved strokes identified by deviation threshold
- [x] Direction adjacency allows flexible matching
- [x] Works for both SVG path data and drawn point sequences

## Tests
Pending - see tasks 017, 018, 019
