## MODIFIED Requirements

### Requirement: Multiple Teams Management
The system SHALL support creating, saving, loading, cloning, and deleting multiple independent team profiles. Each team profile SHALL also store a `regulation` identifier (defaulting to 'vgc2026regma') to dictate the legality rules for that specific team.

#### Scenario: Creating a new team
- **WHEN** user clicks "New Team" in the Team Manager
- **THEN** an empty team profile is created with the default regulation, set as active, and the builder clears to allow 6 new Pokémon.

#### Scenario: Switching between teams
- **WHEN** user selects a different team from the saved teams list
- **THEN** the active team context switches, and the Team Builder populates with the newly selected team's Pokémon.

#### Scenario: Changing a team's regulation
- **WHEN** the user selects a different regulation from the Team Manager dropdown
- **THEN** the active team's profile is updated, triggering a re-evaluation of legality for all Pokémon within that team.

### Requirement: Team Previews
The system SHALL display miniature previews of the Pokémon within a saved team.

#### Scenario: Viewing the saved teams list
- **WHEN** the user views the Team Manager dropdown or list
- **THEN** each team entry displays the sprites of its current members alongside the team name.