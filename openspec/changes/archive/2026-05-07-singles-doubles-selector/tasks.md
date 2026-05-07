## 1. Persistence — Extend simulator state

- [x] 1.1 Add `gameType: 'Singles' | 'Doubles'` to the `SimulatorState` interface in `useSimulatorState.ts`
- [x] 1.2 Set `gameType: 'Doubles'` as the default value in the initial state
- [x] 1.3 Add `setGameType` action to the hook's returned API

## 2. UI — Toggle component in Live Simulator

- [x] 2.1 Add a "Battle Format" section label in the Live Simulator UI (near the existing field conditions like Weather/Terrain)
- [x] 2.2 Implement a pill-style toggle with two buttons: "Singles" and "Doubles", styled with the app's dark theme (`bg-gray-700` inactive, `bg-blue-600` active)
- [x] 2.3 Wire the toggle to `gameType` state from `useSimulatorState` and `setGameType` action

## 3. Damage calculation — Pass gameType to Field

- [x] 3.1 Pass `gameType` to both `Field` constructors in the `resolveField` or inline field creation logic (ally→threat and threat→ally directions)
- [x] 3.2 Ensure the `gameType` value is typed correctly as `'Singles' | 'Doubles'` (matching `@smogon/calc`'s `GameType`)

## 4. Verification

- [x] 4.1 Verify the toggle defaults to Doubles on first load
- [x] 4.2 Verify switching to Singles updates damage calculations (spread move like Heat Wave shows higher damage since no 0.75x penalty)
- [x] 4.3 Verify screen reductions change between Singles (50%) and Doubles (~67%)
- [x] 4.4 Verify state persists across page refreshes within the same browser session
- [x] 4.5 Run `npm run build` to ensure no TypeScript or build errors
- [x] 4.6 Run `npm test` to ensure no regressions
