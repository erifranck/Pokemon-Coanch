## ADDED Requirements

### Requirement: Ability-Based Type Immunities
The system SHALL provide a lookup table of abilities that grant type immunities (e.g., Levitate → Ground immunity, Water Absorb → Water immunity) and apply these overrides when the "Consider Abilities" toggle is active in the Type Synergy matrix.

#### Scenario: Levitate grants Ground immunity
- **WHEN** a team member has the Levitate ability AND the "Consider Abilities" toggle is enabled
- **THEN** the Ground type attack multiplier against that Pokémon is overridden to 0, and the cell displays "Immune (Ability)".

### Requirement: Toggleable Ability Consideration
The Type Synergy matrix SHALL include a checkbox to enable or disable ability-based immunity overrides.

#### Scenario: Toggling abilities off
- **WHEN** the user unchecks the "Consider Abilities" checkbox
- **THEN** the matrix reverts to pure type-based calculations without ability overrides.
