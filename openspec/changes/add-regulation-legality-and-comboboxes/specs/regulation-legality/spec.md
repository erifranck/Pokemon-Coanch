## ADDED Requirements

### Requirement: Learnset Data Parsing
The system SHALL parse Pokémon Showdown's `learnsets.js` to build a mapping of legal moves for every allowed Pokémon.

#### Scenario: Running the parser
- **WHEN** the developer runs the data extraction script
- **THEN** it downloads `learnsets.js`, parses it, and creates a lightweight `learnsets.json` containing arrays of legal move IDs per Pokémon.

### Requirement: Legality Checking
The system SHALL provide a utility to evaluate if a selected item, ability, or move is legal for a specific Pokémon under a given regulation.

#### Scenario: Checking an illegal move
- **WHEN** the utility is asked to validate a move that does not exist in the Pokémon's parsed learnset array
- **THEN** it SHALL return false (illegal).