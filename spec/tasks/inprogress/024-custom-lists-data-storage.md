# Task 024: Custom Lists — Data & Storage

## Status: pending
## Priority: P1
## Dependencies: none

## Description

Implement data model and AsyncStorage persistence for custom kanji lists. Create `src/data/listStorage.ts` for CRUD operations and `src/hooks/useLists.ts` hook for React state management.

## Key Files

- `src/data/listStorage.ts` - NEW: AsyncStorage ops for lists
- `src/hooks/useLists.ts` - NEW: List CRUD hook
- `src/data/storage.ts` - Add KANJI_LISTS key

## Implementation Notes

- KanjiList interface: { id (uuid), name, characters (string[]), createdAt, updatedAt }
- Stored in AsyncStorage at `@kanji_lists`
- Auto-create "Main" list if none exist and user adds a kanji
- A kanji can appear in multiple lists
- useLists hook: getLists, createList, deleteList, addKanji, removeKanji, reorderKanji
- Use crypto.randomUUID() or simple ID generation for list IDs

## Acceptance Criteria

- [ ] listStorage.ts with full CRUD operations
- [ ] useLists hook manages list state
- [ ] Auto-create "Main" list behavior
- [ ] Kanji can be in multiple lists
- [ ] Lists persist across app restarts

## Tests

- `@task-024` - Unit: list CRUD operations
- `@task-024` - Unit: auto-create Main list behavior
- `@task-024` - Unit: reorder kanji within list
