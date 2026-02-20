# Development Conventions

Rules and workflow conventions for contributing to the kanji-app project.

## Task Workflow

Tasks live in `spec/tasks/` and move between folders as they progress:

```
spec/tasks/pending/     → Work not yet started
spec/tasks/inprogress/  → Actively being worked on
spec/tasks/done/        → Completed and verified
```

### Rules

1. **Move the file** when status changes (don't just edit the status field)
2. **One task in-progress at a time** unless tasks are explicitly independent
3. **Update the status field** inside the file to match its folder
4. **Link dependencies** - a task cannot start until all `Dependencies` are done
5. **Tests required** - every task must have associated tests tagged `@task-NNN` before marking done (see Testing below)

### Task File Template

```markdown
# Task NNN: [Title]

## Status: pending | inprogress | done
## Priority: P0 | P1 | P2 | P3
## Dependencies: [NNN, NNN]

## Description
What needs to be built and why.

## Key Files
- `path/to/file.ts` - description

## Implementation Notes
Decisions made, algorithms chosen, edge cases handled.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Tests
- `@task-NNN` tag in test files
- List of test descriptions
```

## Code Conventions

### Imports

- Use `import` / `export`, never `require()`
- Group imports: external libs → internal absolute → relative
- Prefer named exports over default exports (components are the exception)

### Dependencies

- Use latest stable versions of all libraries
- Pin major versions in package.json (`^` prefix is fine)
- Run `bunx tsc --noEmit` after adding/updating dependencies

### TypeScript

- Strict mode enabled (`tsconfig.json`)
- Define interfaces for all component props
- Export types/interfaces that are used across files
- Prefer `interface` over `type` for object shapes

## Architecture Patterns

### Themed Styles

Use `useThemedStyles` for all component styling:

```typescript
const styles = useThemedStyles((colors) => ({
  container: { backgroundColor: colors.background },
}));
```

Never hardcode colors - always reference the theme.

### Hook Extraction

Extract stateful logic into custom hooks in `src/hooks/`:
- Drawing state → `useDrawing`
- Animation control → `useStrokeAnimation`
- Validation logic → `useStrokeValidation`
- Data loading → `useKanjiList`

### Config Extraction

Magic numbers and thresholds belong in `src/config/`:
- `kanjiConfig.ts` - KanjiVG processing constants
- `strokeConfig.ts` - Stroke rendering parameters
- `validationConfig.ts` - Validation thresholds

### Before Writing New Code

1. **Check `spec/components.md`** for existing utilities, hooks, and components
2. Reuse existing code before creating new abstractions
3. If a new utility is needed, add it to the appropriate layer and update `spec/components.md`

## Testing

### Structure

```
tests/
  unit/          # Pure function tests (utils, algorithms)
  component/     # React component tests
  e2e/           # Playwright end-to-end tests
```

### Task Tags

Every test block must include a `@task-NNN` tag for traceability:

```typescript
describe('strokeUtils @task-003', () => {
  it('should convert points to basic path', () => { ... });
});
```

### Tools

- **Unit/Component**: `jest-expo` + `@testing-library/react-native`
- **E2E**: Playwright against Expo web build
- **Type checking**: `bunx tsc --noEmit`
- **Linting**: `bun run lint`

### Running Tests

```bash
bun test                    # All unit + component tests
bun run test:e2e            # Playwright E2E (headless)
bun run test:e2e:headed     # Playwright E2E (headed)
bunx tsc --noEmit           # Type check
bun run lint                # ESLint
```

## GitHub Workflow

- Use GitHub CLI (`gh`) for all GitHub operations
- Branch naming: `feature/description`, `fix/description`, `task/NNN-description`
- Commit messages: imperative mood, reference task number when applicable
- PR descriptions should reference the task file(s) addressed

## File Organization

```
src/
  components/    # React components (presentational + container)
  hooks/         # Custom React hooks
  utils/         # Pure utility functions
  data/          # Data types, services, and storage
  config/        # Configuration constants
  theme/         # Theme provider, colors, style helpers
  navigation/    # React Navigation setup
  screens/       # Screen-level components
```
