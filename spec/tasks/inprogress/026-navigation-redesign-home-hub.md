# Task 026: Navigation Redesign — Home Hub

## Status: pending
## Priority: P1
## Dependencies: 010

## Description

Redesign navigation from 3-screen stack to Home Hub with stack navigation. Create HomeScreen as the central hub with action cards for Study, SRS, Free Practice, Browse, Lists, Progress. Add all new screens to the navigator.

## Key Files

- `src/screens/HomeScreen.tsx` - NEW: Hub screen
- `src/components/HomeActionCard.tsx` - NEW: Large CTA cards
- `src/components/DueBadge.tsx` - NEW: SRS due count indicator
- `src/navigation/AppNavigator.tsx` - UPDATE: Add all new screens

## Implementation Notes

- Home screen: Hero area with Study + SRS cards, quick stats row, secondary grid
- Study card: "Study" with book icon, start studying CTA
- SRS card: "Review" with clock icon, due count badge
- Quick stats: streak days, kanji mastered, total sessions
- Secondary grid: Free Practice, Browse, Lists, Progress
- Settings: gear icon in header
- Update RootStackParamList with all new screen params
- All screens use stack navigation (push/pop)

## Acceptance Criteria

- [ ] HomeScreen renders as initial screen
- [ ] Study and SRS hero cards are prominent
- [ ] Quick stats row shows real data
- [ ] Secondary grid navigates to all screens
- [ ] Settings gear icon in header
- [ ] All navigation params type-safe
- [ ] Back navigation works from all screens

## Tests

- `@task-026` - Component: HomeScreen renders all sections
- `@task-026` - E2E: navigation to all screens from home
