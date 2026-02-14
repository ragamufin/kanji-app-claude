# Task 010: Navigation

## Status: done
## Priority: P0
## Dependencies: 009

## Description
React Navigation native-stack with 3-screen layout: Practice (home), Browse, and Progress.

## Key Files
- `src/navigation/AppNavigator.tsx` - Stack navigator with themed headers
- `src/screens/PracticeScreen.tsx` - Main practice canvas screen
- `src/screens/BrowseScreen.tsx` - Kanji browsing interface
- `src/screens/ProgressScreen.tsx` - Statistics dashboard
- `App.tsx` - NavigationContainer + ThemeProvider wrapping

## Implementation Notes
- Native stack navigator for platform-native transitions (slide-from-right)
- Practice screen has no header (full canvas experience)
- Browse and Progress screens have themed headers
- Navigation params typed via RootStackParamList
- PracticeScreen has Browse/Progress navigation buttons in top bar
- Theme toggle button in top-right of practice screen

## Acceptance Criteria
- [x] Three screens accessible via navigation
- [x] Slide-from-right transitions
- [x] Headers themed correctly in light/dark mode
- [x] Navigation between all screens works
- [x] Type-safe navigation params

## Tests
Pending - see tasks 017, 018, 019
