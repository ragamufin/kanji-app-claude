# Task 005: Demo Mode

## Status: done
## Priority: P1
## Dependencies: 002, 004

## Description
Animated stroke-by-stroke kanji drawing demonstration. Shows how each kanji should be written with correct stroke order.

## Key Files
- `src/components/StrokeAnimator.tsx` - Core animation component using Reanimated dash offsets
- `src/components/StrokeAnimatorWithReplay.tsx` - Wrapper with replay button
- `src/hooks/useStrokeAnimation.ts` - Animation state management

## Implementation Notes
- Uses strokeDasharray/strokeDashoffset SVG technique for progressive stroke reveal
- Each stroke animated sequentially with configurable delay between strokes
- Reanimated SharedValues drive animations for 60fps performance
- AnimatedPath created via Animated.createAnimatedComponent(Path)
- Replay implemented by incrementing component key to force remount
- SVG viewBox scaled from 109x109 to canvas dimensions

## Acceptance Criteria
- [x] Strokes animate one at a time in correct order
- [x] Animation is smooth (60fps via Reanimated)
- [x] Replay button restarts the animation
- [x] Auto-plays on entering demo mode

## Tests
Pending - see tasks 017, 018, 019
