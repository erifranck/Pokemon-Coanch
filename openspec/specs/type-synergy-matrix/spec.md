## ADDED Requirements

### Requirement: Matrix Generation
The system SHALL generate an 18-row by 8-column grid (Types vs 6 Pokémon + 2 Totals) evaluating defensive synergies for the active team.

#### Scenario: Rendering the grid
- **WHEN** the user navigates to the Type Synergy tab
- **THEN** the system iterates through the 18 Pokémon types and checks them against the defensive typings of the 6 active Pokémon, marking Resistances (Green), Weaknesses (Red), Immunities (Gray), and Neutrals (Empty/White).

### Requirement: Structural Weakness Alert
The system SHALL sum the total resistances and weaknesses for each row (attacking type) and highlight structural flaws.

#### Scenario: Highlighting a structural weakness
- **WHEN** the team has 3 or more weaknesses AND 1 or fewer resistances against a specific type (e.g., Flying)
- **THEN** that specific Type row is highlighted in Red with an alert indicator to warn the user.

### Requirement: Tera Type Evaluation
The system SHALL allow the user to evaluate the grid using the assigned Tera Types instead of the base typings.

#### Scenario: Toggling Tera Mode
- **WHEN** the user activates the "Use Tera" toggle
- **THEN** the matrix recalculates all defensive matchups assuming every Pokémon on the team has Terastallized into their assigned Tera Type.