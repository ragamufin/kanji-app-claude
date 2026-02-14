# Task 020: Browse-to-Practice Navigation

## Status: pending
## Priority: P2
## Dependencies: 010, 012

## Description

When selecting a kanji in the Browse screen, navigate back to the Practice screen with that kanji pre-selected. Currently, selecting a kanji in BrowseScreen triggers a callback but doesn't pass the selected kanji as a navigation parameter.

## Key Files

- `src/screens/BrowseScreen.tsx` - Pass selected kanji via navigation params
- `src/screens/PracticeScreen.tsx` - Receive and apply kanji from params
- `src/navigation/AppNavigator.tsx` - Update RootStackParamList type

## Implementation Notes

- Add `selectedKanji?: string` to Practice screen params in RootStackParamList
- BrowseScreen.handleSelect: navigate to Practice with kanji character as param
- PracticeScreen: read route params on focus, update selectedKanji state
- Handle case where param kanji isn't in current loaded list
- Consider using `useEffect` on `route.params?.selectedKanji` with navigation listener

## Acceptance Criteria

- [ ] Tapping a kanji card in Browse navigates to Practice
- [ ] Practice screen shows the selected kanji
- [ ] Drawing canvas resets for new kanji
- [ ] Back navigation returns to Browse with state preserved
- [ ] Type-safe navigation params

## Tests

- `@task-020` - E2E: browse, select kanji, verify practice screen shows it
- `@task-020` - Unit: navigation param handling
