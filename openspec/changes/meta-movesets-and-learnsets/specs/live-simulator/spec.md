## MODIFIED Requirements

### Requirement: Per-Pokémon Move Filtering in Simulator
The Live Simulator SHALL filter available moves to only those from the selected Pokémon's learnset, displaying all format-legal moves as a fallback if learnset data is unavailable.

#### Scenario: Filtering moves for selected Pokémon
- **WHEN** a Pokémon is selected as the ally or enemy in the Live Simulator
- **THEN** the move dropdown for that slot displays only moves from that Pokémon's `allowedMoves` array in the format data.
