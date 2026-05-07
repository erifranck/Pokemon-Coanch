## ADDED Requirements

### Requirement: Offensive coverage matrix display
The system SHALL display a matrix where each row represents a defending type (18 types) and each column represents a team member. Each cell MUST show whether the team member has at least one damaging move that hits the defending type super-effectively (2x or higher).

#### Scenario: Team member has a super-effective move
- **WHEN** a team member has a move whose type hits the defending type for 2x or higher according to TYPE_CHART
- **THEN** the cell displays `✓` indicating coverage

#### Scenario: Team member has a super-effective move with STAB
- **WHEN** a team member has a super-effective move AND the move's type matches one of the team member's own types
- **THEN** the cell displays `✓☆` indicating STAB-enhanced coverage

#### Scenario: Team member has no super-effective move
- **WHEN** a team member has no move that hits the defending type for 2x or higher
- **THEN** the cell displays `✗`

#### Scenario: Status moves are excluded
- **WHEN** a team member only has Status-category moves or moves with basePower of 0 against a defending type
- **THEN** the cell displays `✗` regardless of the move's type

### Requirement: Coverage count column
The system SHALL display a summary column showing the total number of team members that have coverage against each defending type.

#### Scenario: Multiple team members cover the same type
- **WHEN** 3 out of 6 team members have at least one move super-effective against Fire type
- **THEN** the coverage column for the Fire row shows "3"

#### Scenario: No team member covers a type
- **WHEN** 0 team members have a super-effective move against Grass type
- **THEN** the coverage column shows "0" and the row is highlighted with a ⚠️ warning indicator

### Requirement: Tooltip on cell hover
The system SHALL display a tooltip when hovering over a `✓` or `✓☆` cell, listing the specific moves that provide coverage.

#### Scenario: Multiple moves provide coverage
- **WHEN** hovering over a cell where Garchomp covers Fire type with Earthquake (Ground, STAB) and Stone Edge (Rock)
- **THEN** the tooltip lists both moves with their types and indicates STAB where applicable

#### Scenario: No moves provide coverage
- **WHEN** hovering over a cell showing `✗`
- **THEN** no tooltip is displayed

### Requirement: STAB toggle
The system SHALL provide a toggle to enable or disable STAB consideration in the matrix.

#### Scenario: STAB toggle enabled
- **WHEN** the "Consider STAB" toggle is ON
- **THEN** moves that share a type with their Pokémon are indicated with `✓☆` instead of `✓`

#### Scenario: STAB toggle disabled
- **WHEN** the "Consider STAB" toggle is OFF
- **THEN** all super-effective moves are displayed as `✓` regardless of STAB

### Requirement: Navigation integration
The system SHALL provide access to the offensive coverage matrix via a new tab in the main navigation bar.

#### Scenario: User navigates to offensive coverage
- **WHEN** the user clicks "Offensive Cvrg" in the navbar
- **THEN** the offensive coverage matrix page is displayed for the active team
