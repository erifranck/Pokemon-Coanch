## ADDED Requirements

### Requirement: Pre-defined core detection
The system SHALL detect recognized type cores in the team by checking if the team's Pokémon collectively possess the required types for each core.

#### Scenario: Fire/Water/Grass core detected
- **WHEN** the team has at least one Pokémon with Fire type, one with Water type, and one with Grass type (including dual types)
- **THEN** the Fire/Water/Grass core is listed with those Pokémon and a synergy score

#### Scenario: Dual-type Pokémon participates in multiple cores
- **WHEN** a Pokémon has dual types (e.g., Fire/Flying) and both types are needed for different cores
- **THEN** the Pokémon appears in both detected cores

#### Scenario: Core not detected due to missing type
- **WHEN** the team lacks a Pokémon with Dragon type
- **THEN** the Fantasy core (Fairy/Dragon/Steel) is NOT listed

### Requirement: Algorithmic synergy scoring for pairs and triples
The system SHALL compute a synergy score for every pair and triple of team members based on how many weaknesses are covered by teammates.

#### Scenario: Perfect synergy pair
- **WHEN** a pair of Pokémon covers 100% of each other's weaknesses
- **THEN** the score shows 100% with a green progress bar

#### Scenario: Partial synergy pair
- **WHEN** a pair covers 3 out of 5 total weaknesses
- **THEN** the score shows 60% with a yellow progress bar

#### Scenario: Weak synergy pair
- **WHEN** a pair covers 1 out of 5 total weaknesses
- **THEN** the score shows 20% with a red progress bar

### Requirement: Ability-based immunity consideration
The system SHALL adjust weakness calculations based on the Pokémon's selected ability when it grants type immunities.

#### Scenario: Levitate makes Ground immunity
- **WHEN** a Pokémon has the Levitate ability
- **THEN** Ground is NOT counted as a weakness for that Pokémon, and the Pokémon is considered to resist Ground for its teammates

#### Scenario: Flash Fire makes Fire immunity
- **WHEN** a Pokémon has the Flash Fire ability
- **THEN** Fire is NOT counted as a weakness for that Pokémon

### Requirement: Core analysis modal
The system SHALL display core analysis results in a modal accessible from a button on the Type Synergy page.

#### Scenario: Modal opens from Type Synergy
- **WHEN** the user clicks the "Analyze Cores" button on the Type Synergy page
- **THEN** a modal appears showing recognized cores, top pairs, and top triples

#### Scenario: Modal displays team member details
- **WHEN** the core analysis modal is open
- **THEN** each listed Pokémon shows its sprite, name, and type chips

#### Scenario: Modal can be closed
- **WHEN** the user clicks the close button or outside the modal
- **THEN** the modal closes and the Type Synergy page is visible again

### Requirement: Expansion of coverage details
The system SHALL allow the user to expand each core/pair/triple to see which specific weaknesses are covered.

#### Scenario: Expanded detail view
- **WHEN** the user clicks to expand a core entry
- **THEN** a detailed breakdown shows each member's weaknesses and which teammate covers each one

#### Scenario: Unexpanded summary view
- **WHEN** the user has not expanded a core entry
- **THEN** only the Pokémon sprites, names, and overall score are shown
