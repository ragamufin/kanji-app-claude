# Task 004: KanjiVG Integration

## Status: done
## Priority: P0
## Dependencies: 001

## Description
Process KanjiVG SVG repository into JSON bundles for runtime use. Extract stroke paths, lengths, and metadata.

## Key Files
- `scripts/processKanjiVG.ts` - Build-time SVG processing script
- `scripts/kanji-dictionary.json` - JLPT level and meaning source data
- `src/data/bundles/{n5,n4,n3,n2,n1}.json` - Generated JSON bundles (2211 kanji total)
- `src/data/kanjiVGData.ts` - Runtime data loading and lookup
- `src/data/kanjiVGTypes.ts` - TypeScript interfaces (KanjiVGData, KanjiVGStroke, etc.)
- `src/utils/svgPathUtils.ts` - SVG path parsing and metadata derivation
- `src/config/kanjiConfig.ts` - KanjiVG constants (viewBox=109)

## Implementation Notes
- Build pipeline: KanjiVG SVGs -> processKanjiVG.ts -> JSON bundles
- Runtime: imports all 5 bundles, calls deriveStrokeMetadata() per stroke
- SVG path parser supports all standard commands: M,m,L,l,H,h,V,v,C,c,S,s,Q,q,T,t,A,a,Z,z
- Stroke metadata derived at runtime: direction (8-way + curved), start/end quadrants, bend detection
- Waypoint extraction with minimum distance filtering (5 units)
- Bend detection: 50 degree angle threshold between consecutive segments

## Acceptance Criteria
- [x] processKanjiVG.ts generates valid JSON bundles
- [x] All 2211 kanji (N5-N1) processed successfully
- [x] Runtime lookup by character works
- [x] Stroke paths and lengths are accurate
- [x] Direction and quadrant metadata derived correctly

## Tests
Pending - see tasks 017, 018, 019
