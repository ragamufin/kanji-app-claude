# Task 007: Stroke Validation

## Status: done
## Priority: P0
## Dependencies: 003, 004, 008

## Description
Validate drawn kanji against expected KanjiVG data. Checks stroke direction, spatial accuracy (via DTW), stroke order, and count.

## Key Files
- `src/utils/validationUtils.ts` - Main validation logic and score calculation
- `src/utils/strokeOrderValidator.ts` - Greedy matching for stroke order
- `src/utils/dtw.ts` - Dynamic Time Warping for spatial accuracy
- `src/hooks/useStrokeValidation.ts` - React hook wrapping validation
- `src/components/ValidationMessage.tsx` - Results display with per-stroke breakdown
- `src/config/validationConfig.ts` - Validation thresholds

## Implementation Notes
- Overall score: 40% direction match + 40% spatial accuracy + 10% order bonus - 20% count penalty
- Direction matching: 8-direction ring with adjacency checks, "curved" as special case
- Spatial accuracy: DTW with arc-length resampled paths, normalized by max(n,m)
- Stroke order: greedy matching with cost = 40% start proximity + 30% end proximity + 30% direction similarity
- Order correct if matched indices are monotonically increasing
- Curved stroke detection: max perpendicular deviation > 15% of start-to-end line length
- Match threshold: 70% of strokes must have direction match
- ValidationMessage shows: overall score %, stroke count, order correctness, per-stroke accuracy bars

## Acceptance Criteria
- [x] Correct kanji drawing scores > 70%
- [x] Wrong stroke order is detected
- [x] Wrong stroke count is reported
- [x] Per-stroke accuracy breakdown displayed
- [x] Spatial accuracy uses DTW comparison
- [x] Check button triggers validation in practice mode

## Tests
Pending - see tasks 017, 018, 019
