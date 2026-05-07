## Why

The Type Synergy matrix and Live Simulator are the two most strategically powerful features of the team builder, but both are incomplete. The synergy matrix doesn't account for Mega Evolution type changes or ability-based immunities (Levitate, Water Absorb, etc.). The Live Simulator only shows a single damage number and HP/Speed — missing the full 16 damage rolls, stat stage modifiers (-6 to +6), screen effects, burn, Helping Hand, and other competitive modifiers that determine real match outcomes. `@smogon/calc` natively supports all of these; the code simply doesn't wire them up.

## What Changes

- Migrate `TypeSynergy.tsx` from `pokedexData` to `formatData` with Showdown sprites.
- Detect Mega Evolution in Type Synergy: use Mega form types when a team member holds a compatible Mega Stone.
- Add an ability immunity toggle to Type Synergy, overring type chart for Levitate, Water Absorb, Volt Absorb, Flash Fire, Sap Sipper.
- Migrate `LiveSimulator.tsx` from `pokedexData`/`movesData` to `formatData`.
- Display all 6 stats (HP/Atk/Def/SpA/SpD/Spe) with stat stage boost selectors (-6 to +6) for both ally and enemy.
- Add toggleable combat modifiers: Light Screen, Reflect, Aurora Veil, Burn, Helping Hand.
- Refactor `calcAdapter.ts` to pass boosts, status, and abilities into `@smogon/calc`'s `Pokemon` constructor.
- Show full 16 damage rolls with HP% range, visual bar, and KO threshold indicator (2HKO, 3HKO, etc.).

## Capabilities

### New Capabilities
- `ability-immunities`: Overrides for type chart calculations based on abilities like Levitate, Water Absorb.
- `full-damage-rolls`: Display all 16 possible damage outcomes with HP percentages.
- `stat-stage-modifiers`: UI controls for -6 to +6 stat stages on all 6 stats for both Pokemon.

### Modified Capabilities
- `type-synergy-matrix`: Migrate data source, add Mega Evolution integration, add ability immunity toggle.
- `live-simulator`: Migrate data source, overhaul damage cards to match Nerd of Now style, integrate Mega Evolution.
- `champions-data-engine`: Add booster/stage/status/ability support to `calcAdapter.ts`.

## Impact

- **Code:** `src/pages/TypeSynergy.tsx`, `src/pages/LiveSimulator.tsx`, `src/utils/calcAdapter.ts`, `src/utils/typeChart.ts`
- **Data:** Both pages migrate from `pokedexData` + `movesData` to `formatData`
- **UI:** New toggles, stat boost selectors, damage roll bars, Mega integration across both features
