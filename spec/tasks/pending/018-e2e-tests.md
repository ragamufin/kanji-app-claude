# Task 018: Playwright E2E Tests

## Status: pending
## Priority: P1
## Dependencies: 017

## Description

End-to-end tests using Playwright against the Expo web build. Cover the core user flows: drawing on the canvas, navigating between screens, browsing/filtering kanji, and viewing progress.

## Key Files

- `tests/e2e/drawing.spec.ts` - Canvas drawing and validation flow
- `tests/e2e/navigation.spec.ts` - Screen navigation tests
- `tests/e2e/browse.spec.ts` - Kanji browser filtering tests
- `tests/e2e/progress.spec.ts` - Progress screen tests

## Implementation Notes

- Target Expo web dev server (`npx expo start --web`)
- Test touch/mouse drawing on canvas SVG element
- Verify stroke rendering (SVG paths appear after drawing)
- Test mode switching (practice/demo/trace)
- Test JLPT and Heisig filter interactions in browser
- Verify navigation between Practice, Browse, and Progress screens
- Use Playwright's built-in assertion library
- Screenshots for visual regression where useful

## Acceptance Criteria

- [ ] Drawing flow: touch/draw on canvas, strokes render, undo/clear work
- [ ] Validation flow: draw strokes, check, see validation result
- [ ] Demo mode: animation plays, replay button works
- [ ] Navigation: all 3 screens accessible
- [ ] Browse: search, JLPT filter, Heisig filter all work
- [ ] Progress: stats display after practice

## Tests

All tests tagged with `@task-018`:
- `tests/e2e/drawing.spec.ts` - Drawing and validation E2E
- `tests/e2e/navigation.spec.ts` - Navigation E2E
- `tests/e2e/browse.spec.ts` - Browse filtering E2E
- `tests/e2e/progress.spec.ts` - Progress display E2E
