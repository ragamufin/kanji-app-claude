# Task 030: Swipeable List Component

## Status: pending
## Priority: P2
## Dependencies: none

## Description

Create a reusable SwipeableList component that supports swipe-to-delete actions using react-native-gesture-handler's Swipeable.

## Key Files

- `src/components/SwipeableList.tsx` - NEW: Reusable swipeable list

## Implementation Notes

- Props: allowDelete, onDelete, confirmDelete, renderItem, data, keyExtractor
- Uses Swipeable from react-native-gesture-handler
- Swipe left reveals delete button
- Optional confirmation dialog before delete
- Delete icon on hover for web
- Themed styling

## Acceptance Criteria

- [ ] Swipe-left reveals delete action
- [ ] onDelete callback fires on confirm
- [ ] confirmDelete shows alert before deleting
- [ ] Themed styling matches app design
- [ ] Works on both mobile and web

## Tests

- `@task-030` - Component: swipe reveals delete button
- `@task-030` - Component: confirm delete shows dialog
