## ADDED Requirements

### Requirement: Popular Meta Pokémon Display
The system SHALL display a sidebar listing the top competitive Pokémon for the active format (e.g., Champions Reg M-A) with usage percentages, powered by Munchstats data.

#### Scenario: Viewing meta sidebar
- **WHEN** the user opens the Threat Matrix page
- **THEN** a collapsible sidebar displays the top 20-30 meta Pokémon with their usage stats, common items, common moves, and recommended natures/abilities.

### Requirement: One-Click Threat Addition
The system SHALL allow users to add a meta Pokémon directly to the Threat Matrix with a single click, pre-populating the threat with a common competitive set.

#### Scenario: Adding a meta Pokémon as a threat
- **WHEN** the user clicks "Add as Threat" on a meta Pokémon card in the sidebar
- **THEN** a new Threat is created in the Threat Matrix with the Pokémon's common moves, item, ability, nature, and default SP spread.

### Requirement: Data Source Attribution
The system SHALL display "Powered by Pokémon Showdown & Munchstats" credits in the application footer or meta sidebar.
