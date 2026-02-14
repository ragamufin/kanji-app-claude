# Task 023: FSRS Algorithm Upgrade

## Status: pending
## Priority: P1
## Dependencies: 014

## Description

Replace the SM-2 algorithm with FSRS (Free Spaced Repetition Scheduler) using the `ts-fsrs` package. Rewrite `src/utils/spacedRepetition.ts` to wrap ts-fsrs. Create `src/data/fsrsStorage.ts` for persisting FSRS card state per kanji in AsyncStorage. Create `src/hooks/useFSRS.ts` hook for scheduling.

## Key Files

- `src/utils/spacedRepetition.ts` - REWRITE: FSRS internals (keep same file)
- `src/data/fsrsStorage.ts` - NEW: AsyncStorage ops for FSRS card states
- `src/hooks/useFSRS.ts` - NEW: FSRS scheduling hook
- `src/data/storage.ts` - Add FSRS_CARDS key
- `package.json` - Add ts-fsrs dependency

## Implementation Notes

- Install `ts-fsrs` package
- FSRS Card state per kanji: `{ character, card (ts-fsrs Card object), lastReview timestamp }`
- Grade mapping: Again=Rating.Again(1), Hard=Rating.Hard(2), Good=Rating.Good(3), Easy=Rating.Easy(4)
- Store in AsyncStorage at `@kanji_fsrs_cards` as Record<string, FSRSCardState>
- useFSRS hook provides: getDueCards, gradeCard, getCardState, getDueCount
- Migrate existing practice records into FSRS initial states

## Acceptance Criteria

- [ ] ts-fsrs installed
- [ ] spacedRepetition.ts rewritten with FSRS
- [ ] fsrsStorage.ts persists FSRS card states
- [ ] useFSRS hook provides getDueCards, gradeCard, getDueCount
- [ ] Grade mapping (Again/Hard/Good/Easy) works correctly
- [ ] Due card count is accurate

## Tests

- `@task-023` - Unit: FSRS grading updates card state correctly
- `@task-023` - Unit: getDueCards returns only due cards
- `@task-023` - Unit: grade mapping produces correct FSRS ratings
