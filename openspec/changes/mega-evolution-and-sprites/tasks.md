## 1. Data Extraction Updates

- [x] 1.1 Update `scripts/update-rules.ts` to extract `megaEvolves` and `megaStone` properties from `formatDex.items.all()` into `legalItems`.
- [x] 1.2 Run `npm run update-data` to regenerate `format_data.json` with the new item properties.

## 2. Stat Calculation and Modifiers

- [x] 2.1 Update `calculateFinalStat` in `src/utils/calcAdapter.ts` to accept an optional `itemName` parameter.
- [x] 2.2 Implement logic in `calculateFinalStat` to apply a `1.5x` multiplier (rounded down via `Math.floor`) for Choice items (Scarf -> Spe, Band -> Atk, Specs -> SpA).
- [x] 2.3 Implement logic in `calculateFinalStat` to apply a `1.5x` multiplier for Eviolite (Def and SpD).
- [x] 2.4 Implement logic in `calculateFinalStat` to apply a `2.0x` multiplier for Light Ball (Pikachu -> Atk, SpA), Thick Club (Pikachu line -> Atk), etc., if relevant/simple to add. (Focus primarily on Choice/Eviolite).

## 3. UI Updates: PokemonCard

- [x] 3.1 Replace the PokeAPI static sprite URL in `PokemonCard.tsx` and `TeamManager.tsx` with `https://play.pokemonshowdown.com/sprites/gen5/{id}.png`.
- [x] 3.2 Add a `previewMode` state (`'mega' | 'base'`) to `PokemonCard.tsx`.
- [x] 3.3 Create logic to determine `activePokemonDef`: if the equipped item's `megaEvolves` matches the current Pokémon's name (and `previewMode` is 'mega'), use the `megaStone` ID to fetch the Mega's definition from `format_data.json`.
- [x] 3.4 Pass the `activePokemonDef.baseStats` and the equipped `card.item` to `calculateFinalStat` when rendering the stat rows.
- [x] 3.5 Render a "View Base Form" / "View Mega Form" toggle button if `isHoldingMegaStone` is true.
- [x] 3.6 Update the Type Chips rendering to use `activePokemonDef.types` so they reflect the Mega Evolution typing.
- [x] 3.7 Add visual styling (e.g., text color change) to final stat values if they are modified by an item (e.g., green if > base calculated).
