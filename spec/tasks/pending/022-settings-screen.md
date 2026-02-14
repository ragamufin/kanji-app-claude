# Task 022: Settings Screen

## Status: pending
## Priority: P3
## Dependencies: 010, 013

## Description

Dedicated settings screen for user preferences. Currently, stroke mode and theme are toggled inline on the Practice screen. Move these to a proper settings screen and add additional options.

## Key Files

- `src/screens/SettingsScreen.tsx` - New settings screen
- `src/navigation/AppNavigator.tsx` - Add Settings to navigation
- `src/data/storage.ts` - UserPreferences already has strokeMode and themeMode

## Implementation Notes

- Settings to include:
  - Theme mode (light/dark/system) - currently toggle in PracticeScreen
  - Default stroke mode (basic/smooth/brush) - persisted preference
  - Clear practice data (with confirmation dialog)
  - About section (version, credits)
- Persist preferences via existing storage.savePreferences()
- Load preferences on app start via storage.getPreferences()
- Consider: gear icon in navigation bar to access settings
- Use themed section headers and consistent list item styling

## Acceptance Criteria

- [ ] Settings screen accessible from navigation
- [ ] Theme mode selection (light/dark/system)
- [ ] Default stroke mode selection
- [ ] Clear data with confirmation
- [ ] Preferences persist across app restarts
- [ ] About section with app version
- [ ] Consistent themed styling

## Tests

- `@task-022` - Component: settings options render and toggle
- `@task-022` - E2E: change settings and verify persistence
