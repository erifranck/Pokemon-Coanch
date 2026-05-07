## 1. Project Initialization

- [x] 1.1 Scaffold React app with Vite, TypeScript, and Tailwind CSS.
- [x] 1.2 Install state management (`zustand`) and calculation library (`@smogon/calc`).
- [x] 1.3 Setup routing for Team Builder, Threat Matrix, and Live Simulator views.

## 2. Data Extraction Engine

- [x] 2.1 Write a Node.js script to download `pokedex.js`, `moves.js`, and `formats-data.js` from Pokémon Showdown GitHub.
- [x] 2.2 Parse the Showdown files to extract legal Pokémon, moves, abilities, and items for the Reg M-A format.
- [x] 2.3 Output parsed data as clean JSON bundles accessible by the React frontend.

## 3. Calculation Engine Adapter

- [x] 3.1 Implement a utility to calculate Level 50 stats with 31 IVs.
- [x] 3.2 Implement the SP to Stat modifier logic (1 SP = 1 Stat point).
- [x] 3.3 Create a wrapper function around `@smogon/calc` that overrides `rawStats` with the custom SP-calculated stats.

## 4. State Management (Zustand + LocalStorage)

- [x] 4.1 Define TypeScript interfaces for `TeamCard`, `ThreatCard`, and `Relationships`.
- [x] 4.2 Create the Zustand store with `persist` middleware to save/load from `localStorage`.
- [x] 4.3 Implement actions: `addCard`, `updateCard`, `linkThreat`, and `export/import JSON`.

## 5. UI: Team Builder

- [x] 5.1 Build the Team Builder layout with 6 slots.
- [x] 5.2 Build the `PokemonCard` component with visual SP allocation bars (0 to 32 max per stat, 66 total).
- [x] 5.3 Implement selectors for Nature, Item, Ability, Tera Type, and 4 Moves using the parsed JSON data.

## 6. UI: Threat Matrix

- [x] 6.1 Build the Threat Matrix layout to list saved meta threats.
- [x] 6.2 Implement the form to create/edit a Threat Card (similar to Team Builder but globally saved).
- [x] 6.3 Add a "Link to Team Member" modal/dropdown to assign relations (Check, Counter, Weakness) from the Team Builder view.

## 7. UI: Live Simulator

- [x] 7.1 Build the side-by-side view (Allied Pokémon vs Threat Pokémon) and the central Field Modifiers dashboard.
- [x] 7.2 Implement the threat selector on the Allied side (prioritizing linked threats from the Threat Matrix).
- [x] 7.3 Implement the Speed Tiers visual queue based on current field modifiers and stats.
- [x] 7.4 Integrate the calculation engine adapter to show real-time damage percentiles for all attacks on both sides.
- [x] 7.5 Add inline SP tweaking controls on the Allied Pokémon to calculate survival margins on the fly and save the changes.