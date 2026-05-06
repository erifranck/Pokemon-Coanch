## Why

Currently, the Team Builder displays all Pokémon, moves, and items without filtering them by the rules of specific competitive formats (e.g., Champions Reg M-A). This leads to players accidentally creating illegal sets. Additionally, finding specific moves or items in native HTML `<select>` dropdowns containing hundreds of options is a terrible user experience.

## What Changes

- **BREAKING**: Expand the data parser to download and process Pokémon Showdown's `learnsets.ts` to map exactly which moves each Pokémon can legally learn.
- Enhance the Zustand store so that every saved Team Profile is tied to a specific `regulation` (defaulting to "Gen 9 Champions Reg M-A").
- Replace all native `<select>` dropdowns in the `PokemonCard` (Items, Abilities, Moves) with a custom React Combobox/Autocomplete component.
- The new Comboboxes will filter available options based on the team's selected regulation.
- If a user changes a team's regulation, or if an invalid set is loaded, illegal elements will not be deleted; instead, they will be styled in red with a warning tooltip indicating they are illegal in the current format.

## Capabilities

### New Capabilities
- `regulation-legality`: The system parsing learnsets and formats to enforce rule-based legality checking for Pokémon, abilities, items, and moves.
- `searchable-combobox`: A reusable UI component replacing native selects, providing text-search filtering for large datasets (moves, items, abilities).

### Modified Capabilities
- `team-manager`: Modified to store and switch the `regulation` string associated with each team.
- `team-builder`: Modified to use the new `searchable-combobox` components and to display visual warnings (red text/borders) for illegal choices based on the active team's regulation.

## Impact

- The Node data parser script will significantly increase in complexity and execution time due to processing the massive `learnsets.ts` file.
- The `pokedex.json`, `moves.json`, and new `learnsets.json` payloads might increase the bundle/fetch size of the client application.
- We will likely introduce a new headless UI library (like `downshift` or `@headlessui/react`) to build the accessible Comboboxes without reinventing wheel navigation and focus management.