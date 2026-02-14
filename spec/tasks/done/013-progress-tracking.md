# Task 013: Progress Tracking

## Status: done
## Priority: P1
## Dependencies: 007, 010

## Description
Practice statistics dashboard showing per-kanji best scores, attempt counts, and progress bars. Persists practice records via AsyncStorage.

## Key Files
- `src/screens/ProgressScreen.tsx` - Statistics dashboard
- `src/data/storage.ts` - AsyncStorage persistence (PracticeRecord, getKanjiStats)

## Implementation Notes
- PracticeRecord: {character, timestamp, score, strokeOrderCorrect, strokeCount, expectedStrokes}
- getKanjiStats() aggregates: bestScore, attempts, lastPracticed per kanji
- Summary row: total kanji practiced, total attempts, average best score
- Per-kanji list sorted by best score descending
- Color-coded progress bars: green (>=70%), red (<70%)
- Score bars normalized to 0-100% width
- Records saved after each validation check

## Acceptance Criteria
- [x] Practice records persisted across app restarts
- [x] Per-kanji best score and attempt count displayed
- [x] Summary statistics shown (total kanji, attempts, avg score)
- [x] Progress bars color-coded by performance
- [x] Sorted by best score

## Tests
Pending - see tasks 017, 018, 019
