# Task 014: Spaced Repetition

## Status: done
## Priority: P2
## Dependencies: 013

## Description
SM-2 spaced repetition algorithm for scheduling kanji review based on practice performance.

## Key Files
- `src/utils/spacedRepetition.ts` - SM-2 algorithm implementation
- `src/data/storage.ts` - PracticeRecord data source

## Implementation Notes
- SM-2 algorithm adapted for kanji practice scores (0-100 mapped to quality 0-5)
- Quality mapping: quality = round(score/100 * 5)
- Failed (quality < 3): reset interval to 1 day, repetition to 0
- Passed: interval progression: rep1->1 day, rep2->6 days, rep3+->round(interval * easeFactor)
- Ease factor: starts 2.5, min 1.3, adjustment formula: +0.1 - (5-q)*(0.08 + (5-q)*0.02)
- computeReviewStates() processes all practice records chronologically
- getDueKanji() returns kanji where nextReviewDate <= current date
- KanjiReviewState: {character, state (SM2State), nextReviewDate, lastScore}
- Note: Review UI (task 021) not yet implemented; algorithm is ready

## Acceptance Criteria
- [x] SM-2 states computed correctly from practice records
- [x] Ease factor adjusts based on performance
- [x] Failed reviews reset interval
- [x] getDueKanji returns correct set for given date
- [x] Algorithm handles multiple reviews for same kanji

## Tests
Pending - see tasks 017, 018, 019
