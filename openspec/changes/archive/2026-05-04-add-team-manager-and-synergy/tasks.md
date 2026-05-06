## 1. Store Refactoring (Zustand)

- [x] 1.1 Update `src/types/store.ts` to include `TeamProfile` interface and modify `AppState` to use `teams: Record<string, TeamProfile>` and `activeTeamId: string`.
- [x] 1.2 Update `useAppStore.ts` initial state to contain a default "Team 1" if empty.
- [x] 1.3 Add a migration logic in the store initialization (or inside `persist` middleware) to convert the old `team: TeamCard[]` flat array into the new `teams` dictionary format.
- [x] 1.4 Refactor `addTeamMember`, `updateTeamMember`, and `removeTeamMember` to operate on the `teams[activeTeamId].members` array.
- [x] 1.5 Create new actions in the store: `createTeam`, `cloneTeam`, `deleteTeam`, and `setActiveTeam`.
- [x] 1.6 Update `ThreatMatrix` and `LiveSimulator` to read from the active team (`state.teams[state.activeTeamId].members`) instead of `state.team`.

## 2. Visual Enhancements (Sprites & Types)

- [x] 2.1 Update `PokemonCard.tsx` to display an `<img />` tag fetching the sprite from PokeAPI using `pokemonDef.num`.
- [x] 2.2 Create a `<TypeChip />` component that takes a Pokémon type string and renders a colored badge.
- [x] 2.3 Integrate `<TypeChip />` inside `PokemonCard.tsx` to display the base types next to the sprite.

## 3. Team Manager UI

- [x] 3.1 Create a `TeamManager.tsx` component to sit at the top of the `TeamBuilder` page.
- [x] 3.2 Implement a dropdown/list in `TeamManager` to switch between `activeTeamId`.
- [x] 3.3 Display miniature sprites of the 6 Pokémon for each team in the dropdown/list.
- [x] 3.4 Add buttons for "New Team", "Clone Current", and "Delete Current" inside the `TeamManager`.

## 4. Type Synergy Logic & Engine

- [x] 4.1 Create `src/utils/typeChart.ts` containing the 18x18 type matchup multipliers (2x, 0.5x, 0x).
- [x] 4.2 Write a helper function `calculateDefensiveMultiplier(attackingType, defendingTypes)` that multiplies the modifiers of the defending types.

## 5. Type Synergy UI

- [x] 5.1 Create `src/pages/TypeSynergy.tsx` and add it to the router in `App.tsx` and `Layout.tsx`.
- [x] 5.2 Build the 18-row by 8-column grid table (Types vs 6 Active Pokémon + 2 Totals columns).
- [x] 5.3 Iterate through the `TYPE_CHART` and render the intersections with colored background classes (Green for < 1, Red for > 1, Gray for 0).
- [x] 5.4 Implement the row aggregation logic to count total resistances and weaknesses.
- [x] 5.5 Add the conditional formatting to the row label (Red alert if Weaknesses >= 3 AND Resistances <= 1).
- [x] 5.6 Add the "Use Tera" toggle checkbox and wire it to evaluate the matchups using `card.teraType` instead of the base typings.