## Context

The Team Builder currently relies on `pokedexData` (a static PokeAPI export) and external sprite URLs based on numerical IDs, which breaks for alternate forms, Mega Evolutions, and new DLC Pokémon (like Floette-Eternal). Additionally, users calculating EVs/SPs need to see how their investments affect both the base form (before Mega Evolving) and the final Mega form, as well as how competitive items (Choice Scarf, Band, Specs, Eviolite) affect the final stats.

## Goals / Non-Goals

**Goals:**
- Replace PokeAPI sprite URLs with Pokémon Showdown static image URLs (`play.pokemonshowdown.com/sprites/gen5/`) that naturally support all IDs (including megas and alternate forms).
- Extract `megaEvolves` and `megaStone` properties for items using the extraction script.
- Automatically detect when a Pokémon holds its corresponding Mega Stone.
- Add a UI toggle to let users view calculations using the Base stats vs. Mega stats without modifying their inputted SPs.
- Apply stat multipliers during calculation for choice items and Eviolite.

**Non-Goals:**
- Animated sprites (we will stick to static Gen 5 style sprites for consistency and performance).
- Handling form changes triggered by moves (e.g., Relic Song) or weather (Castform). We will focus strictly on Mega Evolutions via items.

## Decisions

1.  **Sprite Source:** We will use `https://play.pokemonshowdown.com/sprites/gen5/{id}.png`.
    - *Rationale:* Showdown URLs perfectly match the string IDs we already extract in `update-rules.ts` (e.g., `charizardmegax`, `floetteeternal`).
2.  **Item Data Extraction:** Modify `scripts/update-rules.ts` to copy `item.megaEvolves` and `item.megaStone` from the Showdown library into our `format_data.json`.
    - *Rationale:* Gives the client all the mapping data needed to know "If Item X is held, switch to Form Y".
3.  **UI State vs Store State:** The Mega toggle will be purely a visual view state inside the React component (`PokemonCard.tsx`).
    - *Rationale:* The underlying SP configuration belongs to the *Base* Pokémon. Mega Evolution is an in-battle transformation, so the data structure shouldn't fundamentally change; only the rendering of the final stats and sprite should change.
4.  **Item Modifiers:** We will update `calculateFinalStat` to accept an `item` string and apply multipliers (e.g., `Math.floor(stat * 1.5)` for Choice Scarf/Spe).
    - *Rationale:* Keeps math centralized. Using `Math.floor` accurately reflects Pokémon's integer-based stat arithmetic.

## Risks / Trade-offs

- **Risk:** The Showdown CDN for sprites goes down or changes URL structure.
  - *Mitigation:* We can fall back to the old PokeAPI error handler or host the sprites ourselves in the future.
- **Risk:** Form changes might not trigger properly if strings don't match (e.g., capitalization).
  - *Mitigation:* We will rely strictly on the lowercase, alphanumeric ID strings from Showdown (`megaStone.toLowerCase().replace(/[^a-z0-9]/g, '')`).
