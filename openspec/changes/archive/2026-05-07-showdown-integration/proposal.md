## Why

The current `regulations.json` file is hardcoded and incomplete, making it difficult to maintain accurate format legality (especially for custom community formats like "Pokémon Champions Reg M-A"). The current system allows illegal pre-evolutions (like Charmander) while missing nuanced bans that are natively handled by the Showdown engine. By integrating `pokemon-showdown` as a build dependency, we can extract perfectly accurate formats, legal Pokémon, stats, moves, and items without doing manual data entry.

## What Changes

- Add `pokemon-showdown` as a development dependency.
- Create an extractor script (`scripts/update-rules.ts`) to programmatically read formats and generate static JSON data with only legal Pokémon (and their stats, movesets, etc.).
- Update the Team Builder UI to load these generated dynamic rule lists instead of the manual `regulations.json`.
- Provide accurate visual feedback in the UI when a user searches or selects a Pokémon, restricting choices to valid ones for the active format.

## Capabilities

### New Capabilities
- `showdown-data-extraction`: Build scripts to parse `pokemon-showdown` rulesets and generate static JSONs of legal Pokémon, their allowed stats, moves, and items.
- `format-validation`: Real-time validation in the UI based on the extracted format rules, ensuring only legal Pokémon can be selected or configured for a team.

### Modified Capabilities
- `team-manager`: Updating to load the dynamic regulations and formats instead of `regulations.json`.

## Impact

- **Code:** `src/store/useAppStore.ts`, `src/components/TeamManager.tsx`, `src/components/PokemonCard.tsx`, and the `scripts/` directory.
- **Data:** Replacement of manual `src/data/regulations.json` with generated JSON files.
- **Dependencies:** Addition of `pokemon-showdown` package.
