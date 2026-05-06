## 1. Data Parsing Expansion (Learnsets)

- [x] 1.1 Update `scripts/download-data.js` to also download `learnsets.js` from the Showdown repository.
- [x] 1.2 Update `scripts/parse-data.js` to process `learnsets.js`, extracting an array of legal move IDs for each Pokémon.
- [x] 1.3 Ensure the parser exports a lightweight `learnsets.json` containing only the allowed moves per Pokémon.
- [x] 1.4 Create a dummy/hardcoded `regulations.json` output that defines the `vgc2026regma` format (which Pokémon, items, and abilities are explicitly banned).

## 2. Store & Utility Updates

- [x] 2.1 Update `TeamProfile` interface in `src/types/store.ts` to include `regulation: string`.
- [x] 2.2 Update `useAppStore` so new teams default to `regulation: 'vgc2026regma'`.
- [x] 2.3 Create `src/utils/legality.ts` with a `checkLegality` function that evaluates a Pokémon/Move/Item against `learnsets.json` and `regulations.json`.

## 3. UI Component: Combobox

- [x] 3.1 Build `src/components/Combobox.tsx`, a custom React component using an `<input type="text">` for filtering and an absolutely positioned `<ul>` for the dropdown options.
- [x] 3.2 Ensure the Combobox accepts a list of options, supports text filtering, and allows selecting an option via click.
- [x] 3.3 Add an `isIllegal` boolean prop to the Combobox that, when true, applies red text/border styling to indicate an invalid choice.

## 4. Integrating Comboboxes into Team Builder

- [x] 4.1 Update `TeamManager.tsx` to include a dropdown to select the `regulation` for the active team.
- [x] 4.2 Replace the native Item `<select>` in `PokemonCard.tsx` with the new `<Combobox />`.
- [x] 4.3 Replace the native Ability `<select>` in `PokemonCard.tsx` with the new `<Combobox />`.
- [x] 4.4 Replace the 4 native Move `<select>` inputs in `PokemonCard.tsx` with the new `<Combobox />`.
- [x] 4.5 Wire up the `isIllegal` prop on each Combobox using the `checkLegality` utility based on the active team's regulation.