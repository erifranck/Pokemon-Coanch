## MODIFIED Requirements

### Requirement: Type Synergy Matrix Data Source
The Type Synergy matrix SHALL use `format_data.json` as its data source for Pokémon definitions (types, sprites, abilities) instead of the legacy `pokedex.json`.

#### Scenario: Loading team member types
- **WHEN** the Type Synergy page loads
- **THEN** each team member's types are resolved from `formatData[regulation].pokemon[id].types`.

### Requirement: Mega Evolution Type Integration
The Type Synergy matrix SHALL detect when a team member holds a compatible Mega Stone and use the Mega Evolution's types instead of the base form's types.

#### Scenario: Charizard with Charizardite X
- **WHEN** a team member with pokemonId "Charizard" holds the item "Charizardite X"
- **THEN** the matrix uses the Fire/Dragon typing of Mega Charizard X for that member's defensive calculations.

### Requirement: Showdown Sprites
The Type Synergy matrix SHALL display Pokémon sprites using Pokémon Showdown's static Gen 5 sprite CDN.

#### Scenario: Rendering team sprites
- **WHEN** the matrix header renders each team member
- **THEN** the sprite URL is `https://play.pokemonshowdown.com/sprites/gen5/{id}.png` (using the active form ID when Mega-detected).
