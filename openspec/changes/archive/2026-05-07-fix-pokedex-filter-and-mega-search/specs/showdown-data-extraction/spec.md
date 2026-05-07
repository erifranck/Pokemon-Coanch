## MODIFIED Requirements

### Requirement: Extract Format Rules from Showdown
The system SHALL provide a build script to extract format legality rules, valid Pokémon, base stats, and legal items directly from the `pokemon-showdown` library using `TeamValidator.validateSet()` for accurate legality determination.

#### Scenario: Running the extractor script
- **WHEN** the developer runs `npm run update-data` (or the extractor script directly)
- **THEN** the system uses Showdown's TeamValidator to test each species against the format's full ruleset, generates static JSON file(s) containing only the validated legal Pokémon and their data for supported formats (e.g., "Gen 9 Champions Reg M-A").

### Requirement: Filter Illegal Pokémon
The extraction script SHALL exclude any Pokémon that the `TeamValidator` reports as banned, unobtainable, not in the allowed Pokédex, or otherwise illegal for the specified format.

#### Scenario: Filtering pre-evolutions
- **WHEN** the format explicitly bans pre-evolutions (e.g., Charmander is illegal but Charizard is legal)
- **THEN** the generated JSON file SHALL include Charizard but omit Charmander.
