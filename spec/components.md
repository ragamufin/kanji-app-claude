# Reusable Components & Services Catalog

Reference this file before creating new utilities, hooks, or components. If existing code covers your need, reuse it. If you add something new, update this file.

## Data Layer

### `src/data/kanjiVGTypes.ts`

Type definitions for KanjiVG stroke data.

| Export | Type | Description |
|---|---|---|
| `StrokeDirection` | type | `'right' \| 'down-right' \| 'down' \| 'down-left' \| 'left' \| 'up-left' \| 'up' \| 'up-right' \| 'curved'` |
| `Quadrant` | type | `1 \| 2 \| 3 \| 4` |
| `KanjiVGStroke` | interface | `{ id, path, length, direction, primaryDirection?, startQuadrant, endQuadrant }` |
| `JLPTLevel` | type | `'N5' \| 'N4' \| 'N3' \| 'N2' \| 'N1'` |
| `KanjiVGData` | interface | `{ character, meaning, strokes[], viewBox, jlpt?, grade?, heisigIndex?, heisigKeyword? }` |
| `CanvasMode` | type | `'practice' \| 'demo' \| 'trace'` |

**Used by:** Nearly every file in the project.

---

### `src/data/kanjiDataService.ts`

Async interface for loading and filtering kanji data.

| Export | Signature | Description |
|---|---|---|
| `KanjiFilter` | interface | `{ jlptLevels?, grade?, search?, heisigRanges? }` |
| `getAvailableKanji` | `(filter?: KanjiFilter) => Promise<KanjiVGData[]>` | Filter kanji by JLPT, grade, search, Heisig range |
| `getKanjiData` | `(character: string) => Promise<KanjiVGData \| undefined>` | Lookup by character |
| `preloadKanji` | `() => Promise<void>` | No-op (future lazy loading) |
| `getAvailableLevels` | `() => Promise<JLPTLevel[]>` | JLPT levels with data |
| `getKanjiCounts` | `() => Promise<Record<JLPTLevel, number>>` | Count per level |
| `getTotalKanjiCount` | `() => number` | Total kanji count |
| `getHeisigKanjiCount` | `() => number` | Kanji with Heisig indices |
| `getHeisigRanges` | `() => [number, number][]` | Dynamic range chips (step=200) |

**Used by:** `useKanjiList`, `KanjiBrowser`

---

### `src/data/kanjiVGData.ts`

Processes raw JSON bundles into runtime lookup structures.

| Export | Type | Description |
|---|---|---|
| `kanjiVGData` | `Record<string, KanjiVGData>` | Character → data lookup map |
| `kanjiVGList` | `KanjiVGData[]` | All kanji as array |
| `getKanjiVGData` | `(char: string) => KanjiVGData \| undefined` | Lookup function |
| `hasKanjiVGData` | `(char: string) => boolean` | Existence check |

Imports 5 JSON bundles (`n5.json` through `n1.json`), calls `deriveStrokeMetadata()` for each stroke.

**Used by:** `kanjiDataService`, `KanjiCanvas`

---

### `src/data/storage.ts`

AsyncStorage persistence for practice records and preferences.

| Export | Signature | Description |
|---|---|---|
| `PracticeRecord` | interface | `{ character, timestamp, score, strokeOrderCorrect, strokeCount, expectedStrokes }` |
| `UserPreferences` | interface | `{ strokeMode, themeMode }` |
| `savePracticeRecord` | `(record: PracticeRecord) => Promise<void>` | Append to history |
| `getPracticeRecords` | `() => Promise<PracticeRecord[]>` | All records |
| `getPracticeRecordsForKanji` | `(character: string) => Promise<PracticeRecord[]>` | Filter by character |
| `getKanjiStats` | `() => Promise<KanjiStat[]>` | Aggregate stats per kanji |
| `savePreferences` | `(prefs: Partial<UserPreferences>) => Promise<void>` | Merge preferences |
| `getPreferences` | `() => Promise<UserPreferences>` | Load with defaults |
| `clearAllData` | `() => Promise<void>` | Debug utility |

**Used by:** `ProgressScreen`, `spacedRepetition`

---

## Hooks

### `src/hooks/useDrawing.ts`

Manages drawing canvas state via useReducer.

| Export | Signature | Description |
|---|---|---|
| `Stroke` | interface | `{ id, path, color, strokeWidth, isFilled }` |
| `useDrawing` | `(strokeMode, strokeColor, strokeWidth) => UseDrawingResult` | Main hook |

**Returns:** `{ strokes, currentPath, currentIsFilled, currentStrokeColor, currentStrokeWidth, pointsHistory, onTouchStart, onTouchMove, onTouchEnd, undo, clear }`

**Used by:** `KanjiCanvas`

---

### `src/hooks/useStrokeAnimation.ts`

Controls stroke-by-stroke animation using Reanimated dash offsets.

| Export | Signature | Description |
|---|---|---|
| `StrokeAnimationConfig` | interface | `{ strokeDuration?, strokeDelay?, easing? }` |
| `useStrokeAnimation` | `(strokes, config?) => UseStrokeAnimationResult` | Main hook |

**Returns:** `{ dashOffsets, play, reset, isPlaying }`

**Used by:** `StrokeAnimator`

---

### `src/hooks/useStrokeValidation.ts`

Validates drawn strokes against expected kanji.

| Export | Signature | Description |
|---|---|---|
| `useStrokeValidation` | `(expectedKanji?) => UseStrokeValidationResult` | Main hook |

**Returns:** `{ validationResult, checkStrokes, clearValidation }`

**Used by:** `KanjiCanvas`

---

### `src/hooks/useKanjiList.ts`

Loads and filters kanji list with cancellation.

| Export | Signature | Description |
|---|---|---|
| `useKanjiList` | `(params?) => UseKanjiListResult` | Main hook |

**Params:** `{ jlptLevels?, grade?, search?, heisigRanges? }`
**Returns:** `{ kanji: KanjiVGData[], loading: boolean }`

**Used by:** `KanjiBrowser`, `PracticeScreen`

---

## Components

### `src/components/KanjiCanvas.tsx`

Main drawing canvas supporting practice, trace, and demo modes.

| Prop | Type | Default | Description |
|---|---|---|---|
| `width` | number | 300 | Canvas width |
| `height` | number | 300 | Canvas height |
| `strokeColor` | string | theme accent | Stroke color |
| `strokeWidth` | number | 4 | Stroke width |
| `expectedKanji` | KanjiVGData | - | Kanji to validate against |
| `canvasMode` | CanvasMode | 'practice' | practice/demo/trace |
| `strokeMode` | StrokeMode | 'basic' | basic/smooth/brush |
| `onStrokeModeChange` | callback | - | Mode change handler |

**Used by:** `PracticeScreen`

---

### `src/components/DrawingCanvas.tsx`

Low-level SVG canvas rendering strokes and trace guides.

| Prop | Type | Description |
|---|---|---|
| `width` | number | Canvas width |
| `height` | number | Canvas height |
| `strokes` | Stroke[] | Completed strokes |
| `currentPath` | string | In-progress path |
| `currentIsFilled` | boolean | Filled vs stroked |
| `currentStrokeColor` | string | Current stroke color |
| `currentStrokeWidth` | number | Current stroke width |
| `showTraceGuide` | boolean | Show reference overlay |
| `kanjiVGData` | KanjiVGData | Reference data for trace |

Includes washi paper texture pattern (4x4 checkered dots).

**Used by:** `KanjiCanvas`

---

### `src/components/CanvasToolbar.tsx`

Toolbar with stroke mode selector and action buttons.

| Prop | Type | Description |
|---|---|---|
| `strokeMode` | StrokeMode | Current mode |
| `onStrokeModeChange` | callback | Mode change handler |
| `strokeCount` | number | Drawn stroke count |
| `showCheck` | boolean | Show check button |
| `onUndo` | callback | Undo handler |
| `onClear` | callback | Clear handler |
| `onCheck` | callback | Validation handler |

**Used by:** `KanjiCanvas`

---

### `src/components/KanjiBrowser.tsx`

Multi-filter kanji browsing grid.

| Prop | Type | Description |
|---|---|---|
| `onSelect` | `(kanji: KanjiVGData) => void` | Selection handler |
| `selectedCharacter` | string | Currently selected |

Filters: text search, JLPT level (N1-N5), Heisig RTK range. 4-column FlatList grid.

**Used by:** `BrowseScreen`

---

### `src/components/KanjiSelector.tsx`

Horizontal scrollable kanji selector with animated selection.

| Prop | Type | Description |
|---|---|---|
| `kanjiList` | KanjiVGData[] | Available kanji |
| `selectedKanji` | KanjiVGData | Current selection |
| `onSelect` | callback | Selection handler |

Spring animation (tension: 300, friction: 20) for scale, timing (150ms) for opacity.

**Used by:** `PracticeScreen`

---

### `src/components/StrokeAnimator.tsx`

Animates stroke-by-stroke drawing via SVG dash offset technique.

| Prop | Type | Description |
|---|---|---|
| `data` | KanjiVGData | Kanji to animate |
| `width` | number | Canvas width |
| `height` | number | Canvas height |
| `strokeColor` | string | Stroke color |
| `strokeWidth` | number | Stroke width |
| `animationConfig` | StrokeAnimationConfig | Timing config |
| `autoPlay` | boolean | Auto-start animation |
| `showControls` | boolean | Show play/reset buttons |

**Used by:** `StrokeAnimatorWithReplay`

---

### `src/components/StrokeAnimatorWithReplay.tsx`

Wrapper for StrokeAnimator with replay button for demo mode.

| Prop | Type | Description |
|---|---|---|
| `kanjiVGData` | KanjiVGData | Kanji to animate |
| `width` | number | Canvas width |
| `height` | number | Canvas height |

Remounts StrokeAnimator via key state to replay animation.

**Used by:** `KanjiCanvas` (demo mode)

---

### `src/components/TraceGuide.tsx`

Faded reference strokes overlay for trace mode.

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | KanjiVGData | - | Reference kanji |
| `width` | number | - | Canvas width |
| `height` | number | - | Canvas height |
| `opacity` | number | 0.25 | Guide opacity |
| `strokeColor` | string | '#888' | Guide color |
| `strokeWidth` | number | 4 | Guide stroke width |

Scales from 109x109 viewBox to canvas dimensions.

**Used by:** `DrawingCanvas`, `KanjiCanvas`

---

### `src/components/ValidationMessage.tsx`

Displays validation results with per-stroke breakdown.

| Prop | Type | Description |
|---|---|---|
| `result` | ValidationResult | Validation output |

Shows: overall score, stroke count match, order correctness, per-stroke accuracy bars.

**Used by:** `KanjiCanvas`

---

## Utilities

### `src/utils/strokeUtils.ts`

Core stroke rendering algorithms.

| Export | Signature | Description |
|---|---|---|
| `Point` | interface | `{ x, y, timestamp }` |
| `StrokeMode` | type | `'basic' \| 'smooth' \| 'brush'` |
| `pointsToBasicPath` | `(points: Point[]) => string` | Straight line segments |
| `pointsToSmoothPath` | `(points: Point[]) => string` | Catmull-Rom → cubic bezier |
| `pointsToBrushPath` | `(points: Point[], baseWidth: number) => string` | Variable-width filled polygon |
| `pointsToPath` | `(points, mode, strokeWidth) => { path, isFilled }` | Router function |

**Used by:** `useDrawing`

---

### `src/utils/validationUtils.ts`

Kanji drawing validation against expected data.

| Export | Signature | Description |
|---|---|---|
| `StrokeResult` | interface | `{ directionMatch, spatialAccuracy, orderCorrect }` |
| `ValidationResult` | interface | Full validation output with per-stroke breakdown |
| `detectStrokeDirection` | `(points: Point[]) => StrokeDirection` | Direction from points |
| `getQuadrant` | `(x, y, size) => Quadrant` | Canvas quadrant |
| `validateKanji` | `(pointsHistory, kanjiData) => ValidationResult` | Main validation |

Score formula: 40% direction + 40% spatial + 10% order bonus - 20% count penalty

**Used by:** `useStrokeValidation`

---

### `src/utils/strokeOrderValidator.ts`

Stroke order and spatial accuracy via greedy matching + DTW.

| Export | Signature | Description |
|---|---|---|
| `StrokeOrderResult` | interface | `{ matchedIndices, strokeOrderCorrect, spatialAccuracies }` |
| `validateStrokeOrder` | `(drawnStrokes, expectedStrokes, canvasSize) => StrokeOrderResult` | Main function |

**Used by:** `validationUtils`

---

### `src/utils/dtw.ts`

Dynamic Time Warping for path comparison.

| Export | Signature | Description |
|---|---|---|
| `resamplePath` | `(points: Point[], count: number) => Point[]` | Arc-length resampling |
| `dtwDistance` | `(path1: Point[], path2: Point[]) => number` | Normalized DTW distance |

**Used by:** `strokeOrderValidator`

---

### `src/utils/svgPathUtils.ts`

SVG path parsing and stroke metadata extraction.

| Export | Signature | Description |
|---|---|---|
| `parsePathWithWaypoints` | `(d: string) => { start, end, waypoints[] }` | Parse SVG path |
| `parsePathEndpoints` | `(d: string) => { start, end }` | Legacy wrapper |
| `deriveStrokeDirection` | `(dx, dy) => StrokeDirection` | Delta → direction |
| `deriveQuadrant` | `(x, y, viewBoxSize) => Quadrant` | Point → quadrant |
| `deriveStrokeMetadata` | `(path: string) => metadata` | Full extraction with bends |

Supports SVG commands: M, m, L, l, H, h, V, v, C, c, S, s, Q, q, T, t, A, a, Z, z

**Used by:** `kanjiVGData`

---

### `src/utils/spacedRepetition.ts`

SM-2 spaced repetition algorithm.

| Export | Signature | Description |
|---|---|---|
| `SM2State` | interface | `{ easeFactor, interval, repetition }` |
| `KanjiReviewState` | interface | `{ character, state, nextReviewDate, lastScore }` |
| `computeReviewStates` | `(records: PracticeRecord[]) => KanjiReviewState[]` | Compute states |
| `getDueKanji` | `(states: KanjiReviewState[], date?) => KanjiReviewState[]` | Due for review |

**Used by:** `ProgressScreen` (future: ReviewScreen)

---

## Config

### `src/config/kanjiConfig.ts`

| Constant | Value | Description |
|---|---|---|
| `KANJIVG_VIEWBOX_SIZE` | 109 | KanjiVG standard viewBox dimension |
| `KANJIVG_VIEWBOX` | '0 0 109 109' | Full viewBox string |
| `WAYPOINT_MIN_DISTANCE` | 5 | Min distance between waypoints |
| `BEND_THRESHOLD_DEGREES` | 50 | Angle change for bend detection |

### `src/config/strokeConfig.ts`

| Constant | Value | Description |
|---|---|---|
| `CATMULL_ROM_TENSION` | 6 | Bezier control point divisor |
| `VELOCITY_NORMALIZATION` | 1.5 | Max velocity (px/ms) |
| `BRUSH_WIDTH_MIN` | 0.3 | Min brush width fraction |
| `BRUSH_WIDTH_MAX` | 1.5 | Max brush width fraction |
| `BRUSH_START_TAPER` | 0.5 | Start taper fraction |
| `BRUSH_END_TAPER` | 0.3 | End taper fraction |
| `SMOOTHING_ITERATIONS` | 2 | Width smoothing passes |

### `src/config/validationConfig.ts`

| Constant | Value | Description |
|---|---|---|
| `MATCH_THRESHOLD` | 0.7 | Required direction match ratio |
| `CURVE_DEVIATION_THRESHOLD` | 0.15 | Curved stroke detection threshold |
| `CURVE_MIN_POINTS` | 5 | Min points for curvature check |

---

## Theme

### `src/theme/colors.ts`

Zen Ink color system with light (warm cream `#FAF8F5`) and dark (deep black `#1A1918`) themes. Light accent: iOS blue `#007AFF`. Dark accent: lime green `#c8e64a`.

### `src/theme/createThemedStyles.ts`

`useThemedStyles(factory)` hook for creating theme-aware StyleSheets.

### `src/theme/index.ts`

Exports: `ThemeProvider`, `useTheme`, `useThemedStyles`, `typography`, `spacing`, `borderRadius`, `getShadow`, `ThemeMode`.

---

## Screens

### `src/screens/PracticeScreen.tsx`

Main practice canvas with mode/stroke selection, kanji selector, and navigation buttons.

### `src/screens/BrowseScreen.tsx`

Kanji browsing with KanjiBrowser component and navigation back to practice.

### `src/screens/ProgressScreen.tsx`

Practice statistics dashboard with per-kanji score bars and summary stats.

---

## Navigation

### `src/navigation/AppNavigator.tsx`

3-screen native stack navigator: Practice (home), Browse, Progress. Slide-from-right transitions, themed headers.
