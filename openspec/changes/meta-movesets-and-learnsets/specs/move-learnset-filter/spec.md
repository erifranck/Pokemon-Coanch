## ADDED Requirements

### Requirement: Pokémon-Specific Move Filtering
The move selection dropdowns SHALL display only moves that the currently selected Pokémon can legally learn in the active format, using the learnset data extracted from Pokémon Showdown.

#### Scenario: Filtering moves for Charizard
- **WHEN** a Charizard is selected in the Team Builder or Live Simulator
- **THEN** the move dropdown displays only moves from Charizard's learnset (e.g., Flare Blitz, Air Slash, Dragon Pulse) and excludes moves it cannot learn (e.g., Hydro Pump, Thunderbolt).

#### Scenario: Fallback when learnset is empty
- **WHEN** the selected Pokémon has an empty or missing learnset in the data
- **THEN** the move dropdown displays all format-legal moves as a fallback.
