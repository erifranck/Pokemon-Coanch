## ADDED Requirements

### Requirement: Restrict Pokémon Selection
The UI SHALL restrict the selectable Pokémon based on the currently active team's format, using the dynamically generated format JSON.

#### Scenario: Searching for a Pokémon
- **WHEN** a user searches or opens the Pokémon selection dropdown
- **THEN** only Pokémon legal in the current format are displayed.

### Requirement: Validate Existing Teams
The system SHALL validate Pokémon already present in a team against the currently selected format.

#### Scenario: Changing a team's format
- **WHEN** a user changes the format of a team containing Pokémon that are illegal in the new format
- **THEN** the system SHALL display a visual warning or error on the illegal Pokémon cards, without deleting the data.
