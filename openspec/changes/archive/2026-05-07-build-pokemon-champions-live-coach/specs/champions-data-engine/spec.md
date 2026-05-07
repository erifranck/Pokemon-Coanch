## ADDED Requirements

### Requirement: Showdown Data Parsing
The system SHALL extract Pokémon data, legal movesets, and base stats directly from the Pokémon Showdown GitHub repository files for the Champions format.

#### Scenario: Script Execution
- **WHEN** the developer runs the data extraction script
- **THEN** it downloads `pokedex.js` and `moves.js` and outputs clean JSON bundles containing only legal Pokémon and moves for Reg M-A.

### Requirement: Champions SP Math Adapter
The system SHALL calculate base stats at Level 50 with 31 IVs and apply 1 SP as 1 direct stat point (instead of `EV/4`), before passing the stats to `@smogon/calc`.

#### Scenario: Adapting Smogon Calc
- **WHEN** the application passes an attacker and defender to `@smogon/calc`
- **THEN** it passes them as "raw stats" overrides so that `@smogon/calc` uses the Champions math instead of attempting to calculate traditional EVs internally.