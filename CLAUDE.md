# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kanji drawing practice app built with React Native and Expo. Users study kanji through flip cards (Study/SRS modes), draw on a canvas with multiple stroke rendering modes, validate strokes against KanjiVG reference data, browse 2211 kanji by JLPT/Heisig, organize into custom lists, and track progress with FSRS spaced repetition.

## Specification System

**Read these before writing code:**

- `spec/conventions.md` - Development workflow, code conventions, and testing rules
- `spec/components.md` - Reusable components/hooks/utilities catalog. **Check before creating new code.**
- `spec/tasks/` - Task workflow: `pending/` → `inprogress/` → `done/` (move files between folders)
- `spec/plan.md` - Architecture overview, data pipeline, algorithms, tech stack

## Development Commands

```bash
bunx expo start          # Start Expo dev server
bunx expo start --ios    # Run on iOS simulator
bunx expo start --android # Run on Android emulator
bunx expo start --web    # Run in web browser
bunx tsc --noEmit        # Type check without emitting
bun run lint             # ESLint
bun run lint:fix         # ESLint with auto-fix
bun run format           # Prettier
```

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

- `App.tsx` - Root component with theme, navigation, and gesture providers
- `src/screens/HomeScreen.tsx` - Central hub with Study/SRS cards and quick actions
- `src/components/StudyCard.tsx` - Flip card for Study/SRS with grading
- `src/components/KanjiCanvas.tsx` - Drawing canvas with practice/demo/trace modes
- `src/utils/spacedRepetition.ts` - FSRS algorithm wrapper (ts-fsrs)
- `src/data/fsrsStorage.ts` - FSRS card state persistence
- `src/data/listStorage.ts` - Custom kanji list persistence
- `src/utils/strokeUtils.ts` - Stroke algorithms and point-to-path conversion
- `src/utils/validationUtils.ts` - Stroke validation with DTW and direction matching

### Data Flow

Touch events capture `{x, y, timestamp}` points → `pointsToPath()` converts based on mode → SVG `<Path>` elements render strokes → validation compares against KanjiVG data → results persisted via AsyncStorage

## Tech Stack

- **Bun** as package manager and script runner (not npm/yarn)
- React Native with New Architecture enabled
- Expo SDK
- react-native-svg for canvas rendering
- react-native-reanimated for stroke animations
- React Navigation for screen navigation (Home hub + stack)
- AsyncStorage for local persistence
- ts-fsrs for FSRS spaced repetition scheduling
- TypeScript with strict mode
- Use the latest stable version of all libraries
- Whenever the stack changes, update CLAUDE.md to match

### Task Tracking
- Create a task list (TaskCreate) before starting work with 3+ distinct steps
- Move task to `inprogress/` when starting work on it, 
- Prompt user to accept when a task is completed and if accepted, move task to `done/`
- New features require a task file first and update `spec/plan.md` to match
- When features change, update the corresponding task file and `spec/plan.md`

### Tools
- use the GitHub CLI (`gh`) for all GitHub-related tasks

## Testing
- use Playwright CLI when testing in the browser is needed
- See `spec/conventions.md` for testing structure and rules
- Test tags: `@task-NNN` in every describe/it block for traceability
- **Only** run tests for the new features being worked on unless other tests specifically requested by the user
