## 1. Shared Utilities

- [x] 1.1 Create `src/utils/megaUtils.ts` extracting mega detection logic from `PokemonCard.tsx` into a shared `getMegaFormId(itemDefObj, basePokemonDef)` function.
- [x] 1.2 Create `src/utils/abilityImmunities.ts` with a static lookup mapping ability names to immune types (Levitate→Ground, Water Absorb→Water, Volt Absorb→Electric, Flash Fire→Fire, Sap Sipper→Grass).

## 2. Type Synergy Migration & Enhancements

- [x] 2.1 Migrate `TypeSynergy.tsx` data layer from `pokedexData` to `formatData`
- [x] 2.2 Replace PokeAPI sprite URLs with Showdown Gen 5 static sprite CDN URLs.
- [x] 2.3 Integrate `getMegaFormId()` to resolve Mega Evolution types
- [x] 2.4 Add "Consider Abilities" checkbox toggle.
- [x] 2.5 When toggle is active, apply `abilityImmunities` overrides to the defensive multiplier calculation

## 3. calcAdapter Refactoring

- [x] 3.1 Update `createChampionsPokemon` to accept `boosts` (stat stages), `status`, and pass them to `@smogon/calc`'s `Pokemon` constructor.
- [x] 3.2 Update `createChampionsPokemon` to integrate `getMegaFormId()` and use Mega base stats when a compatible item is held.
- [x] 3.3 Create `calculateFullDamageResult()` that returns `{ rolls: number[], minHp, maxHp, minPct, maxPct }` using `result.damage` array from `@smogon/calc`.
- [x] 3.4 Pass `ability` option through to `Pokemon` constructor so abilities like Adaptability, Sheer Force, Fairy Aura affect calculations.

## 4. Live Simulator Overhaul

- [x] 4.1 Migrate `LiveSimulator.tsx` data layer from `pokedexData`/`movesData` to `formatData`.
- [x] 4.2 Replace PokeAPI sprite URLs with Showdown Gen 5 static sprite CDN URLs.
- [x] 4.3 Integrate `getMegaFormId()` for Mega Evolution in both ally and enemy Pokemon.
- [x] 4.4 Add full stat display (HP, Atk, Def, SpA, SpD, Spe) with nature/item color indicators replacing the current HP/Spe-only display.
- [x] 4.5 Add stat stage boost selectors (-6 to +6) for all 6 stats on both ally and enemy panels.
- [x] 4.6 Add checkbox toggles: Light Screen, Reflect, Aurora Veil, Ally Burn, Enemy Burn, Helping Hand.
- [x] 4.7 Pass toggles through to `Field` and `Pokemon` objects before damage calculation.
- [x] 4.8 Refactor damage cards to show: move name + BP + category, HP damage range (minHP - maxHP), percentage range, visual percentage bar, KO indicator (OHKO/2HKO/3HKO), and hoverable tooltip with all 16 individual damage rolls.

## 9. Verification

- [x] 9.1 Run `npm test` and verify all tests pass.
- [x] 9.2 Verify Type Synergy correctly uses Mega Charizard X types when Charizard holds Charizardite X.
- [x] 9.3 Verify ability immunity toggle correctly marks Ground as 0 for a Levitate Pokemon.
- [x] 9.4 Verify Live Simulator shows all 6 stats with correct nature/item colors.
- [x] 9.5 Verify +2 Atk stage correctly multiplies damage output.
- [x] 9.6 Verify Reflect halves physical damage and updates rolls immediately.
- [x] 9.7 Verify Burn correctly halves attacker's physical Atk in calculations.
- [x] 9.8 Verify 16 damage rolls display correct HP values and percentage range.
