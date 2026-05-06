## ADDED Requirements

### Requirement: Autocomplete Filtering
The system SHALL provide a Combobox component that allows text input to filter a list of options dynamically.

#### Scenario: Typing to search
- **WHEN** the user types "protect" in the Move Combobox
- **THEN** the dropdown list filters to show only moves containing the string "protect".

### Requirement: Legal Options Filtering
The Combobox SHALL only display options in the dropdown list that are considered legal for the current Pokémon and Regulation.

#### Scenario: Opening a move dropdown
- **WHEN** the user opens the Move Combobox for "Pikachu"
- **THEN** the dropdown list only contains the 50-80 moves Pikachu can legally learn, not the full 600+ move database.

### Requirement: Visualizing Illegal State
The Combobox SHALL NOT delete a selected value if it is evaluated as illegal; instead, it SHALL apply a distinct visual warning styling.

#### Scenario: Loading a legacy team with illegal items
- **WHEN** the user loads a team where a Pokémon has a banned item
- **THEN** the Combobox displays the item name but the input field is styled with a red border and red text to indicate the legality violation.