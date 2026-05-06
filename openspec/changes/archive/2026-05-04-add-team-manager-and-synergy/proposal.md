## Why

As the user begins to build more complex teams for the Pokémon Champions format, managing a single global team in the Team Builder is insufficient. Players need the ability to save, swap, and iterate on multiple team compositions without losing their previous work. Furthermore, evaluating structural weaknesses (Type Synergy) is a critical component of VGC teambuilding that is currently missing, forcing users to mentalize or use external tools to find overlapping type weaknesses.

## What Changes

- **BREAKING**: Modify the underlying Zustand store. Instead of a single `team: TeamCard[]` array, it will shift to a dictionary `teams: Record<string, TeamCard[]>` with an `activeTeamId` pointer to support multiple independent teams.
- Enhance the `PokemonCard` UI to fetch and display the official Pokémon sprite from PokeAPI and render visual chips for the Pokémon's typings.
- Introduce a new "Team Manager" UI component within the Team Builder tab to create, load, clone, and delete entire team presets. It will display miniature sprites of the 6 Pokémon as a quick preview.
- Introduce a new "Type Synergy" tab. This view will render a grid calculating resistances, immunities, and weaknesses of the active team across all 18 types. It will highlight structural flaws (e.g., a type is marked red if the team has >= 3 weaknesses and <= 1 resistance against it).
- Add a "Use Tera" toggle within the Type Synergy matrix to recalculate defensive type matchups based on the assigned Tera types instead of base types.

## Capabilities

### New Capabilities
- `team-manager`: Creating, switching, cloning, and deleting multiple independent team profiles within the local storage.
- `type-synergy-matrix`: A visual grid analyzing the defensive type matchups of the active 6-Pokémon team, with custom highlighting rules for structural weaknesses.

### Modified Capabilities
- `team-builder`: Enhancing the card UI with sprites and type chips, and adapting the data layer to point to the active team from the new Team Manager.

## Impact

- The Zustand `useAppStore` will undergo a structural change affecting how the Team Builder and Live Simulator query the "active" team. 
- A new dependency or fetch logic will be added to retrieve sprites from PokeAPI (`https://raw.githubusercontent.com/PokeAPI/sprites/...`).
- A new routing path `/synergy` will be added.