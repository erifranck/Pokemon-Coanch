## ADDED Requirements

### Requirement: Stat Modification via Items
The system SHALL apply competitive item modifiers to the calculated final stats. This includes Choice items (Scarf, Specs, Band) providing a 1.5x multiplier to their respective stats, and Eviolite providing a 1.5x multiplier to Defense and Special Defense.

#### Scenario: Equipping a Choice Scarf
- **WHEN** a user equips a "Choice Scarf" to a Pokémon
- **THEN** the final Speed (Spe) stat calculation is multiplied by 1.5 and rounded down (Math.floor), and the stat is visually highlighted to indicate modification.

#### Scenario: Equipping an Eviolite
- **WHEN** a user equips an "Eviolite" to a Pokémon
- **THEN** the final Defense (Def) and Special Defense (SpD) stats are multiplied by 1.5 and rounded down, and visually highlighted.
