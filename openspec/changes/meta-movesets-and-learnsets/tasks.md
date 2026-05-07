## 1. Learnset Extraction

- [x] 1.1 Update `scripts/update-rules.ts` to call `formatDex.learnsets.get(speciesId)` for each legal Pokémon and store move IDs in `allowedMoves`.
- [x] 1.2 Handle learnset inheritance for alternate forms (e.g., Mega forms, regional variants).
- [x] 1.3 Run `npm run update-data` to regenerate `format_data.json` with learnset data.

## 2. Move Dropdown Filtering

- [x] 2.1 Update `PokemonCard.tsx` move dropdown to filter by `activeFormat.pokemon[card.pokemonId].allowedMoves`.
- [x] 2.2 Update `LiveSimulator.tsx` move dropdown to filter by the selected Pokémon's `allowedMoves`.
- [x] 2.3 Ensure fallback behavior: if `allowedMoves` is empty or missing, show all format moves.

## 3. Meta Pokémon Data

- [ ] 3.1 Create `scripts/fetch-meta.ts` to scrape Munchstats (or use a manual fallback) and generate `src/data/meta_sets.json` with top 20-30 Pokémon, including usage%, common moves, common items, common abilities, and suggested natures.
- [ ] 3.2 If Munchstats scraping is unreliable, manually curate the initial `meta_sets.json` with known top Pokémon and their common VGC sets.

## 4. Meta Sidebar Component

- [x] 4.1 Create `src/components/MetaSidebar.tsx`
- [x] 4.2 Each meta Pokémon entry shows: sprite, name, usage%, top moves, top items, common ability.
- [x] 4.3 Add "Add as Threat" button per entry that calls `addThreat()` with a pre-configured set (moves, item, ability, nature, default SPs).
- [x] 4.4 Integrate the sidebar into `src/pages/ThreatMatrix.tsx`.

## 5. Credits & Layout

- [x] 5.1 Add "Powered by Pokémon Showdown & Munchstats" text in the app footer/layout.
- [x] 5.2 Update `src/components/Layout.tsx` footer if applicable.

## 6. Verification

- [x] 6.1 Verify Charizard's move dropdown only shows Flare Blitz, Dragon Pulse, etc. — not Hydro Pump.
- [x] 6.2 Verify selecting a meta Pokémon from the sidebar creates a Threat with correct moves/item/ability.
- [x] 6.3 Verify credits footer is visible.
