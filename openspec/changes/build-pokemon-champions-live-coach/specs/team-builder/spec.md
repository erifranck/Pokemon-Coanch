## ADDED Requirements

### Requirement: Configure Pokémon with SP
The system SHALL allow users to create Pokémon cards and configure their stats using Stat Points (SP), with a maximum of 66 total SP and 32 SP per stat.

#### Scenario: Allocating SP
- **WHEN** user increases SP for a specific stat
- **THEN** the SP total increases, the specific stat bar reflects the new value visually, and the actual stat number updates based on Level 50 and 31 IVs math.

#### Scenario: Reaching SP Caps
- **WHEN** user attempts to allocate more than 32 SP to a single stat OR more than 66 SP across all stats
- **THEN** the system SHALL prevent the allocation and show a visual cap indicator.

### Requirement: Assign Items, Abilities, and Natures
The system SHALL allow the user to select legal items, abilities, and natures for the Pokémon.

#### Scenario: Changing Nature
- **WHEN** the user selects a Nature
- **THEN** the system SHALL apply the 1.1x / 0.9x modifier to the corresponding stats visually on the card.