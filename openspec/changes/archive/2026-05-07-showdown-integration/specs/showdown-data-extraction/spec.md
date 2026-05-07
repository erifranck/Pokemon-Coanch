## ADDED Requirements

### Requirement: Extract Format Rules from Showdown
The system SHALL provide a build script to extract format legality rules, valid Pokémon, base stats, and legal items directly from the `pokemon-showdown` library.

#### Scenario: Running the extractor script
- **WHEN** the developer runs `npm run update-data` (or the extractor script directly)
- **THEN** the system generates static JSON file(s) containing the whitelisted Pokémon and their data for supported formats (e.g., "Gen 9 Champions Reg M-A").

### Requirement: Filter Illegal Pokémon
The extraction script SHALL exclude any Pokémon marked as `isNonstandard` or having an `Illegal` tier for the specified format.

#### Scenario: Filtering pre-evolutions
- **WHEN** the format explicitly bans pre-evolutions (e.g., Charmander is illegal but Charizard is UU/legal)
- **THEN** the generated JSON file SHALL include Charizard but omit Charmander.
