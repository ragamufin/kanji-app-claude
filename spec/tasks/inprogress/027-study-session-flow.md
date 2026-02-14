# Task 027: Study Session Flow

## Status: pending
## Priority: P1
## Dependencies: 025, 026

## Description

Implement the full study session: setup screen to choose source/mode, session screen with card queue, and useStudySession hook for state management.

## Key Files

- `src/screens/StudySetupScreen.tsx` - NEW: Session configuration
- `src/screens/StudySessionScreen.tsx` - NEW: Card queue (shared Study/SRS)
- `src/hooks/useStudySession.ts` - NEW: Session state machine

## Implementation Notes

- Setup: Choose source (JLPT chips, Heisig ranges, custom lists), mode (regular/reverse/random), random order toggle, shows deck size
- Session state machine: SETUP → FRONT_SHOWN → REVEALED → PRACTICING → REVEALED → GRADED → next → FRONT_SHOWN or SESSION_COMPLETE
- Progress indicator: "Card 5 / 30"
- Can exit session early
- Session complete screen with summary
- StudySessionScreen is shared between Study and SRS (different grading)

## Acceptance Criteria

- [ ] Setup screen with source selection (JLPT/Heisig/Lists)
- [ ] Mode selection (regular/reverse/random)
- [ ] Deck size preview
- [ ] Card queue advances through all cards
- [ ] Progress indicator shows current position
- [ ] Practice drawing works inline
- [ ] Demo animation plays on card
- [ ] Session complete summary
- [ ] Early exit without data loss

## Tests

- `@task-027` - Unit: useStudySession state machine transitions
- `@task-027` - Component: StudySetupScreen renders filters
- `@task-027` - E2E: complete a study session
