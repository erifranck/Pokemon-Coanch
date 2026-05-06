## MODIFIED Requirements

### Requirement: Configure Pokémon with SP
The system SHALL allow users to create Pokémon cards and configure their stats using Stat Points (SP), with a maximum of 66 total SP and 32 SP per stat. The cards SHALL now also display the official Pokémon sprite fetched via PokeAPI and visual chips representing their typings. The configured Pokémon belongs to the currently active team profile.

#### Scenario: Allocating SP
- **WHEN** user increases SP for a specific stat
- **THEN** the SP total increases, the specific stat bar reflects the new value visually, and the actual stat number updates based on Level 50 and 31 IVs math.

#### Scenario: Reaching SP Caps
- **WHEN** user attempts to allocate more than 32 SP to a single stat OR more than 66 SP across all stats
- **THEN** the system SHALL prevent the allocation and show a visual cap indicator.

#### Scenario: Visualizing Sprites and Types
- **WHEN** a Pokémon is added to the Team Builder
- **THEN** the card renders the official sprite using its Pokédex number and displays colored chips corresponding to its base types.