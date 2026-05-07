## MODIFIED Requirements

### Requirement: Live Simulator Data Source
The Live Simulator SHALL use `format_data.json` as its data source for Pokémon definitions (stats, types, moves) instead of legacy `pokedex.json` and `moves.json`.

#### Scenario: Loading ally/threat data
- **WHEN** an ally or threat is selected
- **THEN** their base stats, types, and move data are resolved from `formatData[regulation].pokemon` and `formatData[regulation].moves`.

### Requirement: Complete Stat Display
The Live Simulator SHALL display all 6 stats (HP, Atk, Def, SpA, SpD, Spe) with their calculated values for both the ally and enemy Pokemon, including visual indicators for nature modifiers and item modifiers.

#### Scenario: Viewing ally stats
- **WHEN** an ally Pokémon is selected with a Jolly nature and Choice Scarf
- **THEN** the stat panel shows all 6 stats with Spe highlighted (green for item boost), Atk slightly red (nature penalty), and Spe in green (nature + item).

### Requirement: Combat Modifier Toggles
The Live Simulator SHALL provide toggleable checkboxes for competitive combat modifiers including: Light Screen, Reflect, Aurora Veil, Burn (per Pokemon), and Helping Hand.

#### Scenario: Enabling Reflect
- **WHEN** the user checks the "Reflect" toggle on the enemy side
- **THEN** all physical damage calculations against the enemy are multiplied by 0.5 (or 2/3 in doubles), and the damage display updates immediately.

### Requirement: Mega Evolution in Simulator
The Live Simulator SHALL detect when the selected ally or threat holds a compatible Mega Stone and use the Mega Evolution's base stats, types, and abilities for all calculations.

#### Scenario: Mega Charizard X in simulator
- **WHEN** the selected ally is Charizard holding Charizardite X
- **THEN** the Pokemon is created with Mega Charizard X's base stats (Atk 130 instead of 84), types (Fire/Dragon), and ability (Tough Claws), and all damage/speed calculations use these values.

### Requirement: Showdown Sprites in Simulator
The Live Simulator SHALL display Pokémon sprites using Pokémon Showdown's static Gen 5 sprite CDN.

#### Scenario: Rendering simulator sprites
- **WHEN** displaying the ally or enemy Pokémon
- **THEN** the sprite URL is `https://play.pokemonshowdown.com/sprites/gen5/{id}.png` (using the active form ID when Mega-detected).
