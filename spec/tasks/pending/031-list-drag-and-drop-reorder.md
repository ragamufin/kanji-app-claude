# Task 031: List Drag-and-Drop Reorder

## Status: pending
## Priority: P2
## Dependencies: 030

## Description

Add drag-and-drop reordering to SwipeableList using react-native-draggable-flatlist.

## Key Files

- `src/components/SwipeableList.tsx` - UPDATE: Add drag support
- `package.json` - Add react-native-draggable-flatlist

## Implementation Notes

- Install react-native-draggable-flatlist
- Add allowDrag prop to SwipeableList
- Long-press to activate drag
- onReorder callback with new order
- Visual feedback during drag (elevation, opacity)

## Acceptance Criteria

- [ ] Long-press activates drag mode
- [ ] Items can be reordered via drag
- [ ] onReorder callback provides new order
- [ ] Visual feedback during drag
- [ ] Order persists after drop

## Tests

- `@task-031` - Component: drag reorder changes order
