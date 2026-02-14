# Task 029: Lists Screen & Management UI

## Status: pending
## Priority: P2
## Dependencies: 024, 026

## Description

Create ListsScreen showing all lists, ListDetailScreen showing list contents with swipe-to-delete, and ListPicker bottom sheet for adding kanji to lists from Browse/Study.

## Key Files

- `src/screens/ListsScreen.tsx` - NEW: All lists view
- `src/screens/ListDetailScreen.tsx` - NEW: Single list contents
- `src/components/ListPicker.tsx` - NEW: Bottom sheet to pick/create list

## Implementation Notes

- ListsScreen: FlatList of lists with name, count, last updated
- ListDetailScreen: kanji items with swipe-left to delete
- ListPicker: modal/bottom sheet with existing lists + "Create new" option
- Add "Add to list" action in Browse (long-press kanji card)
- Add "Add to list" in Study/SRS card actions
- Delete list requires confirmation (unless empty)
- Drag-and-drop reorder handled by task 031

## Acceptance Criteria

- [ ] ListsScreen shows all lists with metadata
- [ ] ListDetailScreen shows kanji with delete swipe
- [ ] ListPicker works as modal for adding kanji
- [ ] Can create new list from picker
- [ ] Delete list with confirmation
- [ ] Add kanji from Browse screen
- [ ] Add kanji from Study/SRS cards

## Tests

- `@task-029` - Component: ListsScreen renders lists
- `@task-029` - Component: ListPicker shows lists and create option
- `@task-029` - E2E: add kanji to list from browse
