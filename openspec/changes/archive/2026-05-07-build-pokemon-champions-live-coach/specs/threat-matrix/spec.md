## ADDED Requirements

### Requirement: Create Threat Cards
The system SHALL allow users to create profiles (Threat Cards) for popular meta Pokémon, including their expected EV/SP spreads, items, and moves.

#### Scenario: Saving a Threat
- **WHEN** user inputs data for an enemy Flutter Mane and saves it
- **THEN** it is stored locally in the Threat Glossary.

### Requirement: Relational Linking
The system SHALL allow users to link a Threat Card to one of their Team Cards with a specific relational tag (Check, Counter, Weakness).

#### Scenario: Linking a Check
- **WHEN** user selects Amoonguss and adds Urshifu as a "Check"
- **THEN** the relationship is saved, and Urshifu will automatically appear as a priority threat when Amoonguss is selected in the live simulator.