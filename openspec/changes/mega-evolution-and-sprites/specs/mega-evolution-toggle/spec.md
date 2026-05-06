## ADDED Requirements

### Requirement: Automatic Mega Form Detection
The system SHALL detect when a Pokémon is holding a Mega Stone that corresponds to its species, and default to calculating and displaying the Mega Evolution's stats, types, and sprite.

#### Scenario: Equipping a Mega Stone
- **WHEN** a user equips a "Charizardite X" to a "Charizard"
- **THEN** the Pokémon card updates to display the sprite for Mega Charizard X, updates the typing to Fire/Dragon, and calculates the final stats based on Mega Charizard X's base stats.

### Requirement: Base Form Toggle
The system SHALL provide a toggle allowing the user to view the Base form's stats and sprite even while the Mega Stone is equipped, without altering their inputted SP values.

#### Scenario: Toggling to Base Form
- **WHEN** the user clicks the "View Base Form" toggle on a Mega-Evolved Pokémon card
- **THEN** the card switches back to displaying the Base form's sprite, typing, and calculates final stats using the Base form's base stats, while maintaining the same SP/Nature inputs.
