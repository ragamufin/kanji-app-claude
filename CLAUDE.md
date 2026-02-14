# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kanji drawing practice app built with React Native and Expo. Users draw kanji characters on a canvas with multiple stroke rendering modes.

## Development Commands

```bash
npx expo start          # Start Expo dev server
npx expo start --ios    # Run on iOS simulator
npx expo start --android # Run on Android emulator
npx expo start --web    # Run in web browser
npx tsc --noEmit        # Type check without emitting
```

No test or lint scripts are configured yet.

## Architecture

### Stroke Rendering System

The app has three stroke rendering modes with different algorithms:

1. **Basic** (`pointsToBasicPath`) - SVG path with straight `L` line commands
2. **Smooth** (`pointsToSmoothPath`) - Catmull-Rom spline converted to cubic bezier `C` commands
3. **Brush** (`pointsToBrushPath`) - Variable-width filled polygon:
   - Velocity calculated from point timestamps (pixels/ms)
   - Width mapped inversely to velocity (faster = thinner)
   - Left/right edges computed via perpendicular offsets
   - Rendered as filled `<Path>` instead of stroked

### Key Components

- `App.tsx` - Main screen with kanji hint and canvas
- `src/components/KanjiCanvas.tsx` - Drawing canvas using PanResponder for touch tracking and react-native-svg for rendering
- `src/utils/strokeUtils.ts` - Stroke algorithms and point-to-path conversion

### Data Flow

Touch events capture `{x, y, timestamp}` points → `pointsToPath()` converts based on mode → SVG `<Path>` elements render strokes (stroked for basic/smooth, filled for brush)

## Tech Stack

- React Native 0.81 with New Architecture enabled
- Expo SDK 54
- react-native-svg for canvas rendering
- TypeScript with strict mode


### Task Tracking
- Create a task list (TaskCreate) before starting work with 3+ distinct steps
- Mark tasks `in_progress` when starting, `completed` when done
- Skip task lists for trivial single-file fixes

### Tools
- use the GitHub CLI (`gh`) for all GitHub-related tasks

## Testing
- use Playwright CLI when testing in the browser is needed
