## MODIFIED Requirements

### Requirement: Restrict Pokémon Selection
The UI SHALL restrict the selectable Pokémon based on the currently active team's format, using the dynamically generated format JSON. Mega Evolution forms SHALL only be accessible via the Mega Stone equipment toggle, NOT as directly selectable entries in the search dropdown.

#### Scenario: Searching for a Pokémon
- **WHEN** a user searches or opens the Pokémon selection dropdown
- **THEN** only base Pokémon legal in the current format are displayed; Mega Evolution forms are excluded from search results (they appear via the card's Mega Toggle when holding a compatible Mega Stone).
