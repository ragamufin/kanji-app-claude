# Task 021: Review Mode (Spaced Repetition UI)

## Status: pending
## Priority: P2
## Dependencies: 014, 010

## Description

Create a Review screen that surfaces kanji due for spaced repetition practice. Uses the SM-2 algorithm (already implemented in task 014) to determine which kanji to review. Provides a focused practice flow for due kanji only.

## Key Files

- `src/screens/ReviewScreen.tsx` - New review screen
- `src/navigation/AppNavigator.tsx` - Add Review to navigation
- `src/utils/spacedRepetition.ts` - getDueKanji() already implemented

## Implementation Notes

- Show count of kanji due for review
- Queue-based practice flow: present one kanji at a time from due list
- After each practice attempt, record score and advance to next
- Update SM-2 state after each review
- Show progress through review queue (e.g., "3 of 12")
- Empty state when no kanji are due
- Consider: separate "Review" tab vs. accessible from Progress screen
- Reuse KanjiCanvas component in practice mode for drawing

## Acceptance Criteria

- [ ] Review screen accessible from navigation
- [ ] Shows kanji due for review based on SM-2 schedule
- [ ] Queue-based practice flow through due kanji
- [ ] Score recorded after each review attempt
- [ ] SM-2 state updated (interval/ease factor adjusted)
- [ ] Progress indicator shows position in review queue
- [ ] Empty state when no reviews are due
- [ ] Next review date displayed after completing review

## Tests

- `@task-021` - Unit: review queue management
- `@task-021` - E2E: complete a review session flow
