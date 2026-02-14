# Task 012: Kanji Browser

## Status: done
## Priority: P1
## Dependencies: 010, 011

## Description
Multi-filter kanji browsing interface with search, JLPT level, and Heisig range filters. 4-column grid with kanji cards showing character, meaning, and stroke count.

## Key Files
- `src/components/KanjiBrowser.tsx` - Browser component with filters and grid
- `src/data/kanjiDataService.ts` - Data service with filtering logic
- `src/hooks/useKanjiList.ts` - Hook for loading/filtering kanji list
- `src/screens/BrowseScreen.tsx` - Screen wrapper

## Implementation Notes
- Filters: text search (character, meaning, keyword), JLPT level (N1-N5 multi-select), Heisig range (multi-select chips in 200-step ranges)
- KanjiCard shows: character (large), meaning (below), stroke count badge
- 4-column FlatList grid layout
- useKanjiList hook handles async loading with cancellation pattern
- kanjiDataService.getAvailableKanji() supports combined filter criteria
- Search matches against character, meaning, and heisigKeyword fields
- Heisig index displayed on cards when Heisig filter is active

## Acceptance Criteria
- [x] Search filters kanji by character, meaning, and keyword
- [x] JLPT level filter with multi-select
- [x] Heisig range filter with dynamic chips
- [x] 4-column grid renders efficiently with FlatList
- [x] Selecting a kanji card triggers onSelect callback
- [x] Loading state displayed during data fetch

## Tests
Pending - see tasks 017, 018, 019
