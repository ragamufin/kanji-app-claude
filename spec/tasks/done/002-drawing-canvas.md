# Task 002: Drawing Canvas

## Status: done
## Priority: P0
## Dependencies: 001

## Description
Touch-based drawing canvas using PanResponder and react-native-svg. Captures timestamped touch points and renders SVG paths.

## Key Files
- `src/components/KanjiCanvas.tsx` - Main canvas component with mode support (practice/demo/trace)
- `src/components/DrawingCanvas.tsx` - Low-level SVG renderer with washi paper texture
- `src/components/CanvasToolbar.tsx` - Stroke mode selector and action buttons (undo, clear, check)
- `src/hooks/useDrawing.ts` - Drawing state management via useReducer

## Implementation Notes
Touch events capture {x, y, timestamp} points. Uses useReducer for state (strokes[], currentPath, pointsHistory). RAF-based path updates for smooth rendering. Washi paper texture via SVG pattern (4x4 checkered dots). Canvas mode determines behavior: practice (interactive + validation), demo (animated playback), trace (interactive + reference overlay).

## Acceptance Criteria
- [x] Touch drawing works on iOS, Android, and Web
- [x] Strokes render in real-time during drawing
- [x] Undo removes last stroke
- [x] Clear removes all strokes
- [x] Stroke count displayed in toolbar

## Tests
Pending - see tasks 017, 018, 019
