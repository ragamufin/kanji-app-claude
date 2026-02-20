# Kanji App - Master Specification

## Project Overview

A kanji drawing practice app built with React Native and Expo. Users learn to write Japanese kanji characters by drawing on a touch canvas with real-time stroke rendering, validation against KanjiVG reference data, and spaced repetition for review scheduling.

### Goals

1. **Study** - Learn kanji through flip cards with keyword/kanji reveal
2. **Review** - Spaced repetition (FSRS) with grade-based scheduling
3. **Practice** - Draw kanji with multiple rendering modes (basic, smooth, brush)
4. **Validate** - Check stroke accuracy, direction, and order against KanjiVG data
5. **Browse** - Discover kanji by JLPT level, Heisig RTK index, or search
6. **Lists** - Create custom kanji lists for targeted study
7. **Track** - Monitor progress with per-kanji statistics
8. **Demonstrate** - Watch animated stroke-by-stroke kanji drawing

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                      Screens                          │
│  HomeScreen  StudySetupScreen  StudySessionScreen      │
│  PracticeScreen  BrowseScreen  ProgressScreen         │
│  ListsScreen  ListDetailScreen  SettingsScreen        │
├──────────────────────────────────────────────────────┤
│                     Components                        │
│  StudyCard  HomeActionCard  DueBadge  ListPicker      │
│  KanjiCanvas  DrawingCanvas  CanvasToolbar            │
│  KanjiBrowser  KanjiSelector  StrokeAnimator          │
│  TraceGuide  ValidationMessage                        │
├──────────────────────────────────────────────────────┤
│                       Hooks                           │
│  useStudySession  useFSRS  useLists                   │
│  useDrawing  useStrokeAnimation                       │
│  useStrokeValidation  useKanjiList                    │
├──────────────────────────────────────────────────────┤
│                     Utilities                         │
│  strokeUtils  validationUtils  dtw                    │
│  strokeOrderValidator  svgPathUtils                   │
│  spacedRepetition (FSRS)                              │
├──────────────────────────────────────────────────────┤
│                       Data                            │
│  kanjiVGData  kanjiDataService  storage               │
│  fsrsStorage  listStorage  kanjiVGTypes               │
├──────────────────────────────────────────────────────┤
│                      Config                           │
│  kanjiConfig  strokeConfig  validationConfig          │
│  studyConfig                                          │
├──────────────────────────────────────────────────────┤
│                       Theme                           │
│  ThemeProvider  colors  createThemedStyles             │
├──────────────────────────────────────────────────────┤
│                    Navigation                         │
│  AppNavigator (Home hub → stack navigation)           │
└──────────────────────────────────────────────────────┘
```

### Navigation Structure

```
HomeScreen (hub)
  ├── Study flow
  │     ├── StudySetupScreen (choose source, mode)
  │     └── StudySessionScreen (card queue)
  ├── SRS flow
  │     ├── StudySetupScreen (due count, source filters)
  │     └── StudySessionScreen (card queue with grading)
  ├── PracticeScreen (Free Practice — open-ended drawing)
  ├── BrowseScreen (kanji browsing with add-to-list)
  ├── ListsScreen
  │     └── ListDetailScreen
  ├── ProgressScreen
  └── SettingsScreen
```

## Data Pipeline

### KanjiVG Processing (build time)

```
KanjiVG SVG repository (kanjivg-repo/)
    │
    ▼
scripts/processKanjiVG.ts
    │  - Parses SVG files
    │  - Extracts stroke paths and lengths
    │  - Merges JLPT levels from kanji-dictionary.json
    │  - Merges Heisig RTK data from heisig-kanjis.csv
    │  - Bundles by JLPT level
    ▼
src/data/bundles/{n5,n4,n3,n2,n1}.json
    │
    ▼
src/data/kanjiVGData.ts (runtime)
    │  - Imports all 5 bundles
    │  - Calls deriveStrokeMetadata() per stroke
    │  - Builds lookup map + list
    ▼
kanjiVGData: Record<character, KanjiVGData>
kanjiVGList: KanjiVGData[]
```

**Total kanji**: 2211 across N5-N1 levels

### Runtime Data Flow

```
Touch events → {x, y, timestamp} points
    │
    ▼
useDrawing hook (reducer state)
    │  - Accumulates points per stroke
    │  - Calls pointsToPath() on each move
    ▼
pointsToPath() → {path: string, isFilled: boolean}
    │  - Routes to basic/smooth/brush algorithm
    ▼
SVG <Path> elements (DrawingCanvas)
    │
    ▼
useStrokeValidation hook
    │  - validateKanji() compares drawn vs expected
    │  - DTW for spatial accuracy
    │  - Direction matching (8-direction ring)
    │  - Stroke order validation
    ▼
ValidationResult → ValidationMessage component
    │
    ▼
storage.savePracticeRecord() → AsyncStorage
```

## Key Algorithms

### Catmull-Rom Spline (Smooth mode)

Converts raw touch points to smooth cubic bezier curves:
- Tension parameter: 6 (divisor for control point offset)
- Each segment between points P[i] and P[i+1] uses P[i-1] and P[i+2] as guide points
- Produces SVG `C` (cubic bezier) commands

### Variable-Width Brush (Brush mode)

Simulates ink brush with pressure-sensitive width:
1. Compute velocity between consecutive timestamped points
2. Map velocity inversely to width (fast strokes = thin, slow = thick)
3. Clamp width to [0.3x, 1.5x] base width
4. Smooth widths: 2 iterations of [w(i-1) + 2*w(i) + w(i+1)] / 4
5. Apply start taper (0.5x) and end taper (0.3x)
6. Compute perpendicular offsets to create left/right edge paths
7. Render as filled polygon with rounded caps

### Dynamic Time Warping (DTW)

Spatial accuracy comparison between drawn and expected strokes:
1. Resample both paths to fixed point count (arc-length spacing)
2. Build O(nm) cost matrix with Euclidean distance
3. Normalize: DTW[n,m] / max(n, m)
4. Lower distance = better match

### 8-Direction Stroke Detection

Classifies strokes into 9 directions for matching:
- 8 cardinal/ordinal: right, down-right, down, down-left, left, up-left, up, up-right
- Plus "curved" for non-linear strokes
- Curved detection: max perpendicular deviation from start-to-end line > 15% of line length
- Direction adjacency checks for flexible matching

### FSRS (Free Spaced Repetition Scheduler)

Modern spaced repetition algorithm replacing SM-2, powered by `ts-fsrs`:
- Per-kanji card state: due date, stability, difficulty, elapsed days, reps, lapses
- Grade mapping: Again(1), Hard(2), Good(3), Easy(4)
- Stability-based scheduling with forgetting curve
- Card states: New → Learning → Review → Relearning
- Stored in AsyncStorage at `@kanji_fsrs_cards`

### Stroke Order Validation

Greedy matching algorithm:
- Cost function: 40% start proximity + 30% end proximity + 30% direction similarity
- Each drawn stroke matched to lowest-cost unmatched expected stroke
- Order correct if matched indices are monotonically increasing

### Overall Score Calculation

Weighted composite: 40% direction + 40% spatial + 10% order bonus - 20% count penalty

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React Native | 0.81.5 | Cross-platform mobile framework |
| Expo SDK | 54 | Development toolchain |
| TypeScript | 5.9 | Type safety |
| react-native-svg | 15.12 | SVG rendering for canvas |
| react-native-reanimated | 4.1 | Stroke animations |
| react-native-gesture-handler | 2.28 | Touch input |
| React Navigation | 7.x | Screen navigation |
| AsyncStorage | 2.2 | Local data persistence |
| ts-fsrs | latest | FSRS spaced repetition scheduler |
| ESLint | 9.x | Code linting |
| Prettier | 3.8 | Code formatting |

## Feature Index

All implemented features are documented as task files:

| Task | Title | Status | File |
|---|---|---|---|
| 001 | Project Scaffolding | done | `spec/tasks/done/001-project-scaffolding.md` |
| 002 | Drawing Canvas | done | `spec/tasks/done/002-drawing-canvas.md` |
| 003 | Stroke Rendering Modes | done | `spec/tasks/done/003-stroke-rendering-modes.md` |
| 004 | KanjiVG Integration | done | `spec/tasks/done/004-kanjivg-integration.md` |
| 005 | Demo Mode | done | `spec/tasks/done/005-demo-mode.md` |
| 006 | Trace Mode | done | `spec/tasks/done/006-trace-mode.md` |
| 007 | Stroke Validation | done | `spec/tasks/done/007-stroke-validation.md` |
| 008 | 8-Direction Stroke Detection | done | `spec/tasks/done/008-direction-detection.md` |
| 009 | Theme System | done | `spec/tasks/done/009-theme-system.md` |
| 010 | Navigation | done | `spec/tasks/done/010-navigation.md` |
| 011 | JLPT Dataset | done | `spec/tasks/done/011-jlpt-dataset.md` |
| 012 | Kanji Browser | done | `spec/tasks/done/012-kanji-browser.md` |
| 013 | Progress Tracking | done | `spec/tasks/done/013-progress-tracking.md` |
| 014 | Spaced Repetition | done | `spec/tasks/done/014-spaced-repetition.md` |
| 015 | Heisig RTK Integration | done | `spec/tasks/done/015-heisig-rtk.md` |
| 016 | Design Mockups | done | `spec/tasks/done/016-design-mockups.md` |
| 017 | Testing Infrastructure Setup | pending | `spec/tasks/pending/017-testing-infrastructure.md` |
| 018 | Playwright E2E Tests | pending | `spec/tasks/pending/018-e2e-tests.md` |
| 019 | Unit & Component Tests | pending | `spec/tasks/pending/019-unit-component-tests.md` |
| 020 | Browse-to-Practice Navigation | pending | `spec/tasks/pending/020-browse-to-practice.md` |
| 021 | Review Mode | superseded | Replaced by task 028 (SRS Session Flow) |
| 022 | Settings Screen | inprogress | `spec/tasks/inprogress/022-settings-screen.md` |
| 023 | FSRS Algorithm Upgrade | inprogress | `spec/tasks/inprogress/023-fsrs-algorithm-upgrade.md` |
| 024 | Custom Lists — Data & Storage | inprogress | `spec/tasks/inprogress/024-custom-lists-data-storage.md` |
| 025 | Study Card Component | inprogress | `spec/tasks/inprogress/025-study-card-component.md` |
| 026 | Navigation Redesign — Home Hub | inprogress | `spec/tasks/inprogress/026-navigation-redesign-home-hub.md` |
| 027 | Study Session Flow | inprogress | `spec/tasks/inprogress/027-study-session-flow.md` |
| 028 | SRS Session Flow | inprogress | `spec/tasks/inprogress/028-srs-session-flow.md` |
| 029 | Lists Screen & Management UI | inprogress | `spec/tasks/inprogress/029-lists-screen-management-ui.md` |
| 030 | Swipeable List Component | pending | `spec/tasks/pending/030-swipeable-list-component.md` |
| 031 | List Drag-and-Drop Reorder | pending | `spec/tasks/pending/031-list-drag-and-drop-reorder.md` |

## Testing Strategy

See `spec/conventions.md` for full testing rules.

### Structure

```
tests/
  unit/          # Pure functions: strokeUtils, dtw, validationUtils, spacedRepetition
  component/     # React components: KanjiCanvas, DrawingCanvas, ValidationMessage
  e2e/           # Playwright: drawing flow, navigation, browse/filter
```

### Tools

- **Unit/Component**: jest-expo + @testing-library/react-native
- **E2E**: Playwright against `bunx expo start --web`
- **Traceability**: `@task-NNN` tags in every describe/it block

### Coverage Priorities

1. P0: Stroke algorithms (strokeUtils) - core drawing correctness
2. P0: Validation pipeline (validationUtils, strokeOrderValidator, dtw)
3. P1: Data loading and filtering (kanjiDataService, kanjiVGData)
4. P1: E2E drawing and validation flow
5. P2: Component rendering (snapshot/interaction tests)
6. P3: Theme, navigation, progress display
