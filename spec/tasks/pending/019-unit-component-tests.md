# Task 019: Unit & Component Tests

## Status: pending
## Priority: P1
## Dependencies: 017

## Description

Unit tests for pure utility functions and component tests for React components. Focus on core algorithms (stroke rendering, validation, DTW, spaced repetition) and key interactive components.

## Key Files

- `tests/unit/strokeUtils.test.ts` - Stroke rendering algorithms
- `tests/unit/dtw.test.ts` - Dynamic Time Warping
- `tests/unit/validationUtils.test.ts` - Validation logic and scoring
- `tests/unit/strokeOrderValidator.test.ts` - Stroke order matching
- `tests/unit/svgPathUtils.test.ts` - SVG path parsing
- `tests/unit/spacedRepetition.test.ts` - SM-2 algorithm
- `tests/unit/kanjiDataService.test.ts` - Data filtering
- `tests/component/ValidationMessage.test.tsx` - Validation display
- `tests/component/CanvasToolbar.test.tsx` - Toolbar interactions
- `tests/component/KanjiBrowser.test.tsx` - Browser filtering

## Implementation Notes

### Unit Test Priorities (P0)

1. **strokeUtils**: pointsToBasicPath, pointsToSmoothPath, pointsToBrushPath
   - Verify path output format (M, L, C commands)
   - Verify brush width varies with velocity
   - Edge cases: single point, two points, collinear points

2. **dtw**: resamplePath, dtwDistance
   - Identical paths → distance ≈ 0
   - Different paths → distance > 0
   - Resampling preserves endpoints

3. **validationUtils**: validateKanji, detectStrokeDirection
   - Direction detection for all 8 directions
   - Curved stroke detection
   - Score calculation weights

4. **spacedRepetition**: computeReviewStates, getDueKanji
   - Failed review resets interval
   - Successful reviews extend interval
   - Due date calculation

### Component Test Priorities (P1)

1. **ValidationMessage**: renders score, stroke count, per-stroke bars
2. **CanvasToolbar**: mode buttons, undo/clear callbacks
3. **KanjiBrowser**: search filtering, level selection

## Acceptance Criteria

- [ ] All stroke algorithm edge cases covered
- [ ] DTW distance properties verified
- [ ] Validation scoring formula tested
- [ ] SM-2 state transitions tested
- [ ] SVG path parsing for all command types
- [ ] Component rendering with various props
- [ ] Component interaction callbacks fire correctly

## Tests

All tests tagged with `@task-019`:
- `tests/unit/*.test.ts` - Pure function unit tests
- `tests/component/*.test.tsx` - React component tests
