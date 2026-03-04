<!--
Sync Impact Report:
- Version change: N/A → 1.0.0
- Added principles:
  * I. Code Readability
  * II. Test Quality - Protection Against Regression
  * III. Test Quality - Resistance to Refactoring
  * IV. Test Quality - Maintainability
  * V. Simplicity First
- Added sections:
  * Development Workflow
  * Quality Standards
- Removed sections: None
- Templates requiring updates:
  ✅ .specify/templates/plan-template.md - Constitution Check section aligned
  ✅ .specify/templates/spec-template.md - Requirements align with test quality metrics
  ✅ .specify/templates/tasks-template.md - Task categorization reflects testing discipline
- Follow-up TODOs: None
-->

# Guitar Boy Constitution

## Core Principles

### I. Code Readability

Code MUST prioritize human comprehension over cleverness. Every line of code is read far more often than it is written.

**Non-Negotiable Rules:**

- Variable and function names MUST clearly express intent (e.g., `calculateInterval` not `ci`)
- Functions MUST do one thing and have a single level of abstraction
- Complex logic MUST be broken into smaller, named helper functions
- Magic numbers MUST be replaced with named constants
- Comments MUST explain "why", not "what" (code should be self-documenting for "what")
- Consistent formatting enforced via Biome (tabs, double quotes, semicolons)

**Rationale:** In a learning app like Guitar Boy, the domain logic (music theory, intervals, fretboard positions) is inherently complex. Code clarity ensures maintainability and reduces bugs in critical learning paths.

### II. Test Quality - Protection Against Regression

Tests MUST catch bugs before they reach production. Every feature requires tests that fail when the implementation breaks.

**Non-Negotiable Rules:**

- All new features MUST have tests written before implementation (TDD)
- Tests MUST cover:
  - Happy path scenarios
  - Edge cases (boundary conditions, empty states, error states)
  - Critical user journeys (e.g., quiz completion, note identification)
- Unit tests required for:
  - Pure functions in `src/lib/` (music theory helpers, SRS algorithm)
  - Custom hooks (`useLocalStorage`, state management)
- Component tests required for:
  - Interactive components (Fretboard, Quiz modes)
  - User feedback overlays
- Test coverage target: 100% for `src/lib/`, ≥80% for components
- Integration tests MUST validate complete user flows

**Rationale:** Regression bugs in a learning app destroy user trust and learning progress. High test coverage protects the core educational value.

### III. Test Quality - Resistance to Refactoring

Tests MUST focus on behavior, not implementation details, allowing safe refactoring without test breakage.

**Non-Negotiable Rules:**

- Component tests MUST use React Testing Library's user-centric queries (`getByRole`, `getByText`, `getByLabelText`)
- Tests MUST NOT access internal component state or methods directly
- Tests MUST interact with components as users do (click buttons, fill forms, verify visible output)
- Test names MUST describe user-facing behavior (e.g., "displays correct note when fret is clicked")
- Avoid testing implementation details:
  - Internal state variables
  - Private methods
  - CSS class names (unless critical for functionality)
- When refactoring implementation, tests MUST continue to pass without modification

**Rationale:** Tests coupled to implementation details create maintenance burden and resist improvements. Behavior-focused tests enable confident refactoring.

### IV. Test Quality - Maintainability

Test suites MUST remain easy to understand, update, and extend over time.

**Non-Negotiable Rules:**

- Each test file MUST have a clear, descriptive name (e.g., `music.test.ts`, `Fretboard.test.tsx`)
- Tests MUST follow the AAA pattern: Arrange, Act, Assert
- Shared test setup MUST use `beforeEach`/`afterEach` hooks
- Test data MUST be clearly named and represent realistic scenarios
- Avoid:
  - Giant test files (>300 lines) - split by feature/behavior
  - Duplicate test logic - extract to helper functions
  - Brittle selectors that break on minor DOM changes
  - Overly complex test setups - indicates code needs simplification
- When a test fails, the error message MUST clearly indicate what went wrong
- Test files MUST be colocated with source files or in parallel `tests/` structure

**Rationale:** Maintainable tests reduce the cost of adding features and fixing bugs. Poorly maintained test suites become abandoned, defeating their purpose.

### V. Simplicity First

Favor simplicity over verbosity. When bogged down, seek suggestions before adding complexity.

**Non-Negotiable Rules:**

- Start with the simplest solution that works (YAGNI - You Aren't Gonna Need It)
- Avoid premature optimization - measure before optimizing
- Prefer built-in React features (Context, useReducer) over external libraries unless clear benefit
- Code MUST be justified by current requirements, not hypothetical future needs
- When complexity feels necessary:
  1. STOP and document the specific problem requiring complexity
  2. Propose the simplest alternative that solves the problem
  3. If no simple solution exists, document why complexity is unavoidable
  4. Seek team/input review before proceeding
- Refactor when:
  - Code becomes hard to understand
  - Duplication exceeds 3 instances
  - Functions exceed 20-30 lines
- Delete dead code aggressively

**Rationale:** Guitar Boy's domain (music theory) is inherently complex. Implementation simplicity prevents compounding complexity and keeps the codebase approachable for contributors.

## Development Workflow

### Code Review Standards

- All code changes MUST pass automated checks (typecheck, lint, tests) before review
- Reviews MUST verify:
  - Code readability (Principle I)
  - Test coverage and quality (Principles II-IV)
  - Simplicity justification (Principle V)
- Reviewers MUST suggest simpler alternatives when complexity is unnecessary

### Testing Discipline

- Red-Green-Refactor cycle enforced:
  1. Write failing test
  2. Verify test fails for the right reason
  3. Implement minimal code to pass
  4. Refactor while keeping tests green
- Test commands:
  - `yarn test` - Run all tests
  - `yarn test:watch` - Interactive test development
  - `yarn test:coverage` - Verify coverage targets

### Quality Gates

- Pre-commit: Biome format + lint
- Pre-push: TypeScript typecheck + all tests passing
- CI pipeline:
  1. `yarn lint`
  2. `yarn typecheck`
  3. `yarn test:coverage`
  4. Coverage thresholds MUST be met (100% lib, ≥80% components)

## Quality Standards

### Test Quality Metrics

Tests MUST satisfy three dimensions:

1. **Protection Against Regression** (Principle II)
   - Measured by: Coverage percentage, bug escape rate
   - Target: 100% lib coverage, ≥80% component coverage

2. **Resistance to Refactoring** (Principle III)
   - Measured by: Test stability during refactors
   - Indicator: Tests pass after implementation-only changes

3. **Maintainability** (Principle IV)
   - Measured by: Test clarity, setup simplicity, failure message quality
   - Indicator: New team members can understand tests quickly

### Code Quality Metrics

- **Readability** (Principle I): Code review approval requires clear naming and structure
- **Simplicity** (Principle V): Complexity must be documented and justified

### When Bogged Down

If stuck on implementation or design:

1. Document the specific blocker
2. List attempted approaches
3. Propose 2-3 alternative solutions
4. Seek input from:
   - Team members (if available)
   - Technical design docs (TECH_DESIGN.md)
   - External resources (documentation, examples)
5. Prefer reversible decisions - iterate rather than over-engineer

## Governance

### Amendment Procedure

- Constitution changes MUST be documented with version bump
- MAJOR version: Backward-incompatible principle removals/redefinitions
- MINOR version: New principles or materially expanded guidance
- PATCH version: Clarifications, wording fixes, non-semantic refinements
- All amendments MUST include rationale and impact assessment

### Versioning Policy

- Semantic versioning (MAJOR.MINOR.PATCH)
- Version history tracked in Sync Impact Report (HTML comment at top of file)

### Compliance Review

- All PRs MUST verify compliance with constitution principles
- Constitution supersedes conflicting practices
- Violations MUST be documented with justification in Complexity Tracking table
- Regular reviews ensure principles remain relevant and actionable

### Runtime Guidance

- For implementation guidance aligned with these principles, see TECH_DESIGN.md
- For testing patterns and examples, see existing test files in `src/lib/*.test.ts`

**Version**: 1.0.0 | **Ratified**: 2026-03-04 | **Last Amended**: 2026-03-04
