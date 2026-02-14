# Task 028: SRS Session Flow

## Status: pending
## Priority: P1
## Dependencies: 023, 027

## Description

SRS mode using FSRS grading. Same card UI as Study but with grade buttons (Again/Hard/Good/Easy) feeding into FSRS. Shows due count, filters by source, computes next review dates.

## Key Files

- `src/screens/StudySetupScreen.tsx` - UPDATE: SRS-specific setup mode
- `src/screens/StudySessionScreen.tsx` - UPDATE: SRS grading mode

## Implementation Notes

- SRS setup shows: due today count, new cards available, source filters
- Grade buttons: Again/Hard/Good/Easy → FSRS Rating enum
- After grading, FSRS computes next review date
- Session ends when all due cards reviewed
- Can add new (unseen) cards from unreviewed kanji
- Home hub shows due count badge
- Reuse StudySessionScreen with `sessionType: 'study' | 'srs'` param

## Acceptance Criteria

- [ ] SRS setup shows due count and new card count
- [ ] Grade buttons feed into FSRS correctly
- [ ] Next review date computed and stored
- [ ] Session ends when due cards exhausted
- [ ] Due count badge on home screen
- [ ] New cards can be added to review pool

## Tests

- `@task-028` - Unit: FSRS grading integration
- `@task-028` - E2E: complete an SRS review session
