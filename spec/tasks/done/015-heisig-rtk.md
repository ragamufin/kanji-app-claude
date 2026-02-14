# Task 015: Heisig RTK Integration

## Status: done
## Priority: P2
## Dependencies: 012

## Description
Integrate Heisig "Remembering the Kanji" (RTK) index and keyword data for alternative kanji browsing and discovery.

## Key Files
- `scripts/heisig-kanjis.csv` - Heisig RTK source data
- `scripts/processKanjiVG.ts` - Merges Heisig data during processing
- `src/data/kanjiVGTypes.ts` - heisigIndex and heisigKeyword fields on KanjiVGData
- `src/data/kanjiDataService.ts` - getHeisigRanges(), getHeisigKanjiCount(), heisigRanges filter
- `src/components/KanjiBrowser.tsx` - Heisig range filter chips and index display

## Implementation Notes
- Heisig indices 1-2200 mapped from CSV during build processing
- heisigKeyword searchable in browser search field
- Heisig range filter chips: dynamic [1-200], [201-400], etc. (step=200)
- When Heisig filter active, cards show Heisig index number
- Multi-select ranges (can select multiple chips)
- Combined with JLPT filter (intersection when both active)

## Acceptance Criteria
- [x] Heisig index and keyword available for kanji with RTK data
- [x] Heisig range filter chips in browser
- [x] Multi-select range filtering works
- [x] Heisig keyword searchable
- [x] Heisig index displayed on cards when filter active
- [x] Combined Heisig + JLPT filtering works

## Tests
Pending - see tasks 017, 018, 019
