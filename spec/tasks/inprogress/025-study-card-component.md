# Task 025: Study Card Component

## Status: pending
## Priority: P1
## Dependencies: none

## Description

Create the StudyCard component — the core shared UI between Study and SRS modes. A flip card with front side (keyword or kanji) and back side (revealed content with stroke count, practice button, demo button, JLPT/Heisig info).

## Key Files

- `src/components/StudyCard.tsx` - NEW: Flip card component
- `src/config/studyConfig.ts` - NEW: Session defaults, grade labels

## Implementation Notes

- Front side: keyword/meaning (regular mode) or kanji character (reverse mode)
- Back side: hidden content + stroke count badge + stroke direction indicators + Practice button + Demo button + JLPT level + Heisig index
- Flip animation using Animated API (rotate Y transform)
- Props: kanjiData, mode (regular/reverse), onPractice, onDemo, onGrade, showGradeButtons
- Grade buttons for SRS: "Again" / "Hard" / "Good" / "Easy"
- Study mode: simple "Next" button
- Use useThemedStyles for all styling

## Acceptance Criteria

- [ ] Card shows front side with keyword or kanji
- [ ] Tap to reveal flips card with animation
- [ ] Back side shows all metadata (strokes, JLPT, Heisig)
- [ ] Practice button triggers onPractice callback
- [ ] Demo button triggers onDemo callback
- [ ] Grade buttons shown when showGradeButtons=true
- [ ] Themed styling with useThemedStyles

## Tests

- `@task-025` - Component: front/back rendering
- `@task-025` - Component: flip interaction
- `@task-025` - Component: grade button callbacks
