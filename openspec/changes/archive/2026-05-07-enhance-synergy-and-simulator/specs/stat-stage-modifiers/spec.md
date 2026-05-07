## ADDED Requirements

### Requirement: Stat Stage Modifier Selectors
The Live Simulator SHALL provide -6 to +6 stat stage selector controls for all 6 stats (HP excluded from stages) for both the ally and enemy Pokemon.

#### Scenario: Boosting Attack stat
- **WHEN** the user sets the ally's Attack stage to +2
- **THEN** the displayed Atk stat value is recalculated with the ×2 multiplier, and all damage calculations using that Pokemon's Attack are updated.

### Requirement: Stage-Modified Stat Display
The Live Simulator SHALL display the effective stat value after applying stat stage modifiers, alongside the base stat and the current stage level.

#### Scenario: Displaying boosted speed
- **WHEN** the ally's Speed stage is set to +1 and base Spe is 152
- **THEN** the display shows "Spe: 228 (+1)" with visual emphasis on the modified value.
