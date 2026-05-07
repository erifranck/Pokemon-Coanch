## ADDED Requirements

### Requirement: Parse PokePaste to TeamCards
The system SHALL parse PokePaste-formatted text into an array of `TeamCard` objects, extracting species, item, ability, moves, nature, and mapping EVs to SPs.

#### Scenario: Parsing a valid PokePaste
- **WHEN** the user pastes a PokePaste containing a Charizard with Charizardite X, Blaze ability, Timid nature, and four moves
- **THEN** the system returns a `TeamCard` with `pokemonId: "charizard"`, `item: "Charizardite X"`, `ability: "Blaze"`, `nature: "Timid"`, and the four move IDs.

### Requirement: Export Team to PokePaste
The system SHALL export the active team as valid PokePaste-formatted text.

#### Scenario: Exporting a team
- **WHEN** the user clicks "Export PokePaste"
- **THEN** the system generates PokePaste text with one block per team member, including species, item, ability, nature, SPs as EVs, and moves, and copies it to clipboard or shows it in a modal.

### Requirement: Filter Illegal Pokémon on Import
The system SHALL validate each imported Pokémon against the active regulation's legal Pokémon list and automatically discard any that are not legal.

#### Scenario: Importing a team with an illegal Pokémon
- **WHEN** a PokePaste contains Charmander (illegal in Champions Reg M-A) alongside legal Pokémon
- **THEN** Charmander is skipped and a notification displays "Skipped 1 illegal Pokémon: Charmander".
