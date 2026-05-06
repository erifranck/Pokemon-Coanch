## 1. Setup and Build Infrastructure

- [x] 1.1 Install `pokemon-showdown` as a development dependency.
- [x] 1.2 Create `scripts/update-rules.ts` to instantiate Showdown (`Dex.forFormat`) and iterate over the Pokédex to filter Pokémon with `tier !== 'Illegal'` and `!isNonstandard`.
- [x] 1.3 Enhance `update-rules.ts` to extract base stats, allowed moves, and allowed items for the legal Pokémon.
- [x] 1.4 Save the extracted data into `src/data/format_data.json` during the script execution.
- [x] 1.5 Add `npm run update-data` script to `package.json` that executes `scripts/update-rules.ts`.

## 2. Store and Data Layer Updates

- [x] 2.1 Update `src/store/useAppStore.ts` to import and utilize the new `src/data/format_data.json` instead of the legacy `regulations.json`.
- [x] 2.2 Update `team-manager` slice/actions in the store to support format selection based on the new data structure.
- [x] 2.3 Create a utility function in the store or utils to query if a given Pokémon/Item/Move is legal for a specific format.

## 3. UI Implementation

- [x] 3.1 Update `src/components/TeamManager.tsx` format dropdown to load options from the generated format list.
- [x] 3.2 Update Pokémon selection dropdown/Combobox to filter options dynamically, allowing only legal Pokémon for the currently selected format.
- [x] 3.3 Add visual warning indicators on `PokemonCard` components for Pokémon that are currently illegal based on the active format rules.

## 4. Cleanup and Verification

- [x] 4.1 Delete the deprecated manual `src/data/regulations.json`.
- [x] 4.2 Verify that selecting "Gen 9 Champions Reg M-A" correctly excludes pre-evolutions like Charmander but includes Charizard.
- [x] 4.3 Verify that switching a team's format updates the legality checks on its existing members correctly.
