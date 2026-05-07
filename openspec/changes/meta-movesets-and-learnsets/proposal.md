## Why

Currently, the move dropdown in `PokemonCard.tsx` and `LiveSimulator.tsx` shows ALL moves from the format instead of filtering to only what the selected Pokémon can learn. This makes team building tedious (700+ moves to scroll through) and allows impossible combinations. Additionally, competitive team building requires quick access to popular meta Pokémon and their common sets (moves, items, abilities, spreads). Integrating data from Munchstats and properly extracting learnsets from Showdown will fill both gaps.

## What Changes

- Fix `scripts/update-rules.ts` to properly extract per-Pokémon move learnsets using Showdown's `Dex.learnsets` and store them in `format_data.json`.
- Update `PokemonCard.tsx` and `LiveSimulator.tsx` move dropdowns to filter options to only legal moves for the selected Pokémon.
- Create a `MetaSidebar.tsx` component displaying popular meta Pokémon with their common sets fetched from Munchstats.
- Add a "Quick Add to Threats" button on each meta set to instantly populate the Threat Matrix with a pre-configured set.
- Add a new "Meta" tab/section in the app navigation.
- Display "Powered by Pokémon Showdown & Munchstats" credits in the footer/sidebar.

## Capabilities

### New Capabilities
- `meta-pokemon-sidebar`: Displays popular competitive Pokémon with usage stats and pre-built common sets, powered by Munchstats data.
- `move-learnset-filter`: Filters move selection to only moves that the selected Pokémon can legally learn in the current format.

### Modified Capabilities
- `showdown-data-extraction`: Update the extraction script to include per-Pokémon legal move lists in the generated data.
- `live-simulator`: Move dropdowns now show only learnable moves for the selected Pokémon.

## Impact

- **Code:** `scripts/update-rules.ts`, `src/components/PokemonCard.tsx`, `src/pages/LiveSimulator.tsx`, new `src/components/MetaSidebar.tsx`, `src/App.tsx` (routing/layout)
- **Data:** `format_data.json` now includes `allowedMoves` arrays per Pokémon; new `src/data/meta_sets.json` from Munchstats
- **UI:** New sidebar/tab component, move dropdown filtering, credits footer
