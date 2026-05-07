## ADDED Requirements

### Requirement: Extract Per-Pokémon Learnset Data
The extraction script SHALL query `Dex.learnsets` for each legal Pokémon and store the list of move IDs that the species can learn.

#### Scenario: Extracting learnsets
- **WHEN** the update script processes legal Pokémon
- **THEN** each Pokémon entry in the output JSON includes an `allowedMoves` array containing lowercase move IDs that the species can learn in the current generation.
