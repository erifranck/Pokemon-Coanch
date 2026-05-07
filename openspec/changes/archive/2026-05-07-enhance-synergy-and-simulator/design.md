## Context

Both `TypeSynergy.tsx` and `LiveSimulator.tsx` still load data from legacy `pokedex.json` and `moves.json` instead of the dynamically generated `format_data.json`. The `@smogon/calc` library (already installed) natively supports stat stages, status conditions, screens, weather, terrain, and abilities — but the current code bypasses most of this. The `createChampionsPokemon()` function only passes nature and raw stats, ignoring boosts, status, and abilities.

## Goals / Non-Goals

**Goals:**
- Migrate data layer to `formatData` in both pages.
- Integrate Mega Evolution detection (reuse pattern from `PokemonCard.tsx`).
- Expose all 6 stats with -6 to +6 boost selectors in Live Simulator.
- Show 16 damage rolls as HP counts/percentages with visual bars.
- Add toggleable screens, burn, Helping Hand, weather, terrain.
- Pass abilities through to `@smogon/calc` for correct damage modifiers (Adaptability, Sheer Force, etc.).
- Add ability immunity overrides to Type Synergy.

**Non-Goals:**
- Full battle simulation (turn-by-turn). This is a single-hit calculator.
- Support for every edge-case ability interaction. Focus on the most impactful VGC abilities.
- Changes to the damage formula itself (we rely on `@smogon/calc`).

## Decisions

1. **Reuse Mega Detection Logic:** Extract mega detection from `PokemonCard.tsx` into a shared utility (`src/utils/megaUtils.ts`) to keep it DRY across Type Synergy, Live Simulator, and PokemonCard.
   - *Rationale:* Same logic needed in 3+ components.

2. **Immune Ability Map:** Define a static lookup in `typeChart.ts` rather than querying Showdown.
   - *Rationale:* The set of immunity-granting abilities is small and stable (~10). No need for runtime queries.

3. **Damage Roll Display:** Use `result.damage` (16-element array from `@smogon/calc`) to render each individual HP value + a visual percentage bar.
   - *Rationale:* This is exactly how Nerd of Now and Pikalytics present data.

4. **Stat Boosts On `Pokemon` Object:** Pass `boosts` directly to `@smogon/calc`'s `Pokemon` constructor rather than manually applying stat multipliers.
   - *Rationale:* The library handles stat stage math correctly including edge cases (Unaware, Simple, etc.).

## Risks / Trade-offs

- **Risk:** Performance of 16 damage rolls × 8 moves × 2 Pokemon = 256 calculations on every state change.
  - *Mitigation:* `@smogon/calc` is fast (~1ms per calc). The user won't notice on modern hardware.
- **Risk:** Mega detection might miss edge-case forms (Primal Reversion, Ultra Burst, Gigantamax).
  - *Mitigation:* Champions mod primarily uses standard Mega Stones. Edge cases can be added later.

## Testing Strategy

- **Framework:** Vitest (integrates natively with Vite, zero-config for TypeScript/JSX).
- **Rendering:** @testing-library/react + jsdom for component tests.
- **Coverage targets:**
  - `src/utils/megaUtils.ts`: 100% — pure function, simple logic, critical for correctness.
  - `src/utils/abilityImmunities.ts`: 100% — static lookup table.
  - `src/utils/calcAdapter.ts`: Core math functions (`calculateFinalStat`, `calculateFullDamageResult`).
  - `src/utils/typeChart.ts`: All type combinations verified.
- **What we DON'T test:** UI rendering of React components (LiveSimulator, TypeSynergy) — these are visual and iterative, better verified manually during development. Focus tests on pure logic and data transformations.
