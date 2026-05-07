## 1. PokePaste Parser

- [x] 1.1 Create `src/utils/pokepaste.ts` with `parsePokePaste(text: string)` function that returns an array of partial `TeamCard` objects.
- [x] 1.2 Implement EV→SP mapping: `Math.round(EV / 8)`.
- [x] 1.3 Handle multi-line move parsing, ability line, nature line, item parsing.

## 2. PokePaste Exporter

- [x] 2.1 Create `exportToPokePaste(team: TeamProfile)` function that generates PokePaste text from the active team.
- [x] 2.2 SP→EV reverse mapping: `SP * 8` for export.

## 3. Import/Export UI

- [x] 3.1 Add "Import PokePaste" button in `TeamManager.tsx` that opens a textarea modal for pasting.
- [x] 3.2 Add "Export PokePaste" button in `TeamManager.tsx` that copies generated text to clipboard.
- [x] 3.3 On import, validate each Pokémon against `formatData[regulation].pokemon`. Skip illegals and show a toast with dropped names.

## 4. Delete Illegal Pokémon

- [x] 4.1 In `PokemonCard.tsx`, when the card's Pokémon is not in `formatData[regulation].pokemon`, show a yellow border and a "Remove Illegal" button.
- [x] 4.2 Remove button triggers `onRemove()` to delete the card from the team.

## 5. Verification

- [x] 5.1 Test import with a valid Champions Reg M-A PokePaste (Charizard, Garchomp, etc.).
- [x] 5.2 Test import with a PokePaste containing Charmander (illegal) — verify it's skipped.
- [x] 5.3 Test export and verify the output is valid PokePaste format.
- [x] 5.4 Test that illegal cards show a delete button.
