# Task 006: Trace Mode

## Status: done
## Priority: P1
## Dependencies: 002, 004

## Description
Overlay faded reference strokes so users can trace over them while drawing. Provides visual guidance for learning stroke shapes and order.

## Key Files
- `src/components/TraceGuide.tsx` - Faded stroke reference overlay
- `src/components/DrawingCanvas.tsx` - Renders trace guide when showTraceGuide=true
- `src/components/KanjiCanvas.tsx` - Sets canvasMode='trace' to enable

## Implementation Notes
- TraceGuide scales KanjiVG paths from 109x109 viewBox to canvas dimensions
- Default opacity 0.25, stroke color '#888', stroke width 4
- Rendered as SVG layer behind user's drawing strokes
- Pure rendering component (no animation or interaction logic)

## Acceptance Criteria
- [x] Faded reference strokes visible under drawing layer
- [x] Reference scales correctly to canvas size
- [x] User can draw over reference strokes
- [x] Opacity is subtle enough to not distract

## Tests
Pending - see tasks 017, 018, 019
