## ADDED Requirements

### Requirement: Threat coverage matrix display
The system SHALL display a matrix in a modal accessible from the Threat Matrix page, where each row represents a registered threat and each column represents a team member. Each cell MUST show a compact matchup summary including speed comparison and damage potential in both directions.

#### Scenario: Modal opens from Threat Matrix
- **WHEN** the user clicks the "Analyze Coverage" button on the Threat Matrix page
- **THEN** a full-width modal opens showing the threat coverage matrix

#### Scenario: Matrix shows all threats
- **WHEN** the modal is open and threats exist in the Threat Matrix
- **THEN** every threat appears as a row with its sprite, name, and type chips

#### Scenario: Empty state
- **WHEN** no threats have been added to the Threat Matrix
- **THEN** the modal shows a message "No threats to analyze. Add threats first."

### Requirement: Real damage calculations per matchup
The system SHALL use `@smogon/calc` via `createChampionsPokemon` and `calculateFullDamageResult` to compute actual damage for each threat-team member pair, in both directions.

#### Scenario: Threat attacks team member
- **WHEN** calculating a matchup cell
- **THEN** the system computes the threat's best damaging move against the team member and determines KO potential (OHKO/2HKO/3HKO)

#### Scenario: Team member attacks threat
- **WHEN** calculating a matchup cell
- **THEN** the system computes the team member's best damaging move against the threat and determines KO potential

#### Scenario: Speed comparison
- **WHEN** calculating a matchup cell
- **THEN** the system compares final speed stats (including nature, SPs, items like Choice Scarf) and displays ↑ (threat faster), ↓ (threat slower), or = (tie)

#### Scenario: Loading state during calculations
- **WHEN** damage calculations are running
- **THEN** a loading indicator is displayed and the matrix is not yet visible

### Requirement: Cell rendering with color coding
The system SHALL render each cell with a compact indicator and color code based on the matchup outcome.

#### Scenario: Threat is faster and can OHKO
- **WHEN** the threat outspeeds and can OHKO the team member
- **THEN** the cell shows "↑ 💀 OHKO" with red background

#### Scenario: Team member can OHKO the threat
- **WHEN** the team member can OHKO the threat regardless of speed
- **THEN** the cell shows "💀 OHKO" on team member's attack side with green background

#### Scenario: Cell hover tooltip
- **WHEN** the user hovers over a cell
- **THEN** a tooltip shows detailed damage values (exact HP, percentage range, 15/16 rolls)

### Requirement: Row summary with threat warnings
The system SHALL show a summary per threat row indicating how many team members are at risk, and highlight threats where 3+ members are in danger.

#### Scenario: Threat endangers multiple team members
- **WHEN** a threat outspeeds and can OHKO or 2HKO at least 3 team members
- **THEN** the row is highlighted with ⚠️ and marked as a serious threat

#### Scenario: Threat is well covered
- **WHEN** a threat endangers 0-2 team members
- **THEN** the row appears normal without warning highlighting

### Requirement: Scrollable modal
The system SHALL support horizontal scrolling for team member columns and vertical scrolling for threat rows within the modal.

#### Scenario: Many threats require vertical scroll
- **WHEN** there are more threats than fit in the modal height
- **THEN** the threat rows are vertically scrollable

#### Scenario: Many team members require horizontal scroll
- **WHEN** there are 6 team members whose columns exceed the modal width
- **THEN** the team member columns are horizontally scrollable with sticky threat name column
