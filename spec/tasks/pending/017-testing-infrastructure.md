# Task 017: Testing Infrastructure Setup

## Status: pending
## Priority: P0
## Dependencies: 001

## Description

Set up testing infrastructure for the project. Install jest-expo, @testing-library/react-native, and Playwright. Configure test scripts in package.json. Create the test directory structure (`tests/{unit,component,e2e}/`). Write initial smoke tests to verify the setup works.

## Key Files

- `package.json` - Add test dependencies and scripts
- `jest.config.js` - Jest configuration for jest-expo
- `playwright.config.ts` - Playwright configuration for Expo web
- `tests/unit/` - Unit test directory
- `tests/component/` - Component test directory
- `tests/e2e/` - E2E test directory

## Implementation Notes

- Use `jest-expo` preset for React Native compatibility
- Use `@testing-library/react-native` for component testing
- Playwright targets `http://localhost:8081` (Expo web dev server)
- Test scripts: `test`, `test:unit`, `test:component`, `test:e2e`, `test:e2e:headed`
- Default headless for CI, `--headed` flag for local debugging
- Add `@task-017` tags to all setup verification tests

## Acceptance Criteria

- [ ] jest-expo and @testing-library/react-native installed
- [ ] Playwright installed and configured
- [ ] Test directory structure created
- [ ] `bun test` runs unit + component tests
- [ ] `bun run test:e2e` runs Playwright tests
- [ ] Smoke test passes for each test type
- [ ] TypeScript types for test utilities configured

## Tests

- `tests/unit/smoke.test.ts` - Verify Jest runs (`@task-017`)
- `tests/component/smoke.test.tsx` - Verify component rendering (`@task-017`)
- `tests/e2e/smoke.spec.ts` - Verify Playwright connects to Expo web (`@task-017`)
