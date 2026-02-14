# Task 009: Theme System

## Status: done
## Priority: P1
## Dependencies: 001

## Description
Zen Ink color system with light and dark themes, design tokens for typography/spacing, and useThemedStyles hook for theme-aware components.

## Key Files
- `src/theme/colors.ts` - Light (warm cream #FAF8F5) and dark (deep black #1A1918) color palettes
- `src/theme/index.ts` - ThemeProvider, useTheme hook, typography/spacing/borderRadius/shadow tokens
- `src/theme/createThemedStyles.ts` - useThemedStyles factory hook

## Implementation Notes
- Light accent: iOS system blue (#007AFF), Dark accent: lime green (#c8e64a)
- ThemeMode: 'light' | 'dark' | 'system' (respects system preference)
- Typography scale: kanjiDisplay (72px), meaning (28px), label (16px), button (15px), caption (13px), body (14px)
- Spacing scale: xs(4) sm(8) md(12) lg(16) xl(24) xxl(32) xxxl(48)
- Shadow presets: low, medium, high with platform-aware elevation
- useThemedStyles(factory) pattern ensures styles rebuild on theme change

## Acceptance Criteria
- [x] Light and dark themes render correctly
- [x] System theme preference respected
- [x] Theme toggle works at runtime
- [x] All components use themed styles (no hardcoded colors)
- [x] Typography and spacing tokens used consistently

## Tests
Pending - see tasks 017, 018, 019
