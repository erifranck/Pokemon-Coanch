## ADDED Requirements

### Requirement: Multiple Teams Management
The system SHALL support creating, saving, loading, cloning, and deleting multiple independent team profiles.

#### Scenario: Creating a new team
- **WHEN** user clicks "New Team" in the Team Manager
- **THEN** an empty team profile is created, set as active, and the builder clears to allow 6 new Pokémon.

#### Scenario: Switching between teams
- **WHEN** user selects a different team from the saved teams list
- **THEN** the active team context switches, and the Team Builder populates with the newly selected team's Pokémon.

### Requirement: Team Previews
The system SHALL display miniature previews of the Pokémon within a saved team.

#### Scenario: Viewing the saved teams list
- **WHEN** the user views the Team Manager dropdown or list
- **THEN** each team entry displays the sprites of its current members alongside the team name.