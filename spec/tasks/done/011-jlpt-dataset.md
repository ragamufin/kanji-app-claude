# Task 011: JLPT Dataset

## Status: done
## Priority: P1
## Dependencies: 004

## Description
Full JLPT kanji dataset (2211 kanji) across N5-N1 levels, bundled as JSON files for runtime use.

## Key Files
- `scripts/processKanjiVG.ts` - Processes KanjiVG SVGs with JLPT level tagging
- `scripts/kanji-dictionary.json` - Source data mapping kanji to JLPT levels and meanings
- `src/data/bundles/n5.json` - N5 kanji (simplest, ~80 kanji)
- `src/data/bundles/n4.json` - N4 kanji (~170 kanji)
- `src/data/bundles/n3.json` - N3 kanji (~370 kanji)
- `src/data/bundles/n2.json` - N2 kanji (~380 kanji)
- `src/data/bundles/n1.json` - N1 kanji (~1200 kanji)

## Implementation Notes
- Total: 2211 kanji across all JLPT levels
- Each bundle contains array of {character, meaning, strokes[], viewBox} objects
- Strokes include pre-calculated path lengths for animation
- Grade field (1-6) included for kyouiku kanji
- Bundles imported statically (no lazy loading yet)

## Acceptance Criteria
- [x] All 2211 JLPT kanji included
- [x] Correct JLPT level assignment
- [x] Meanings populated for all kanji
- [x] Stroke paths and lengths accurate
- [x] Bundles load without errors at runtime

## Tests
Pending - see tasks 017, 018, 019
