## Why

The current competitive Pokémon ecosystem (like VGC) lacks dedicated tooling for the "Pokémon Champions Reg M-A" format, which replaces traditional EVs with a 66 Stat Point (SP) system. Players need a fast, intuitive "Live Coach" and Matchup Planner to use during active games, allowing them to visualize speed tiers, link threat responses, calculate damage using the specific Champions mathematics, and seamlessly tweak sets on the fly.

## What Changes

- Create a completely new SPA optimized for fast, in-game VGC consultation.
- Implement a Team Builder module tailored for the 66-SP math, fixed Level 50, and 31 IV assumptions.
- Introduce a Threat Matrix ("Glossary") where users can build enemy sets and explicitly link them to their own Pokémon as checks, counters, or weaknesses.
- Build a "Live Simulator" view that places the selected allied Pokémon alongside its linked threats with a central dashboard for field modifiers (Tailwind, Rain, Trick Room, Auras).
- Integrate a custom damage calculation and speed tier engine by parsing Pokémon Showdown's open-source GitHub data and adapting `@smogon/calc` for the Champions mechanics.

## Capabilities

### New Capabilities
- `team-builder`: Creating and managing a team of 6 Pokémon cards using the 66-SP point system, including nature, items, and Tera types.
- `threat-matrix`: Creating enemy Pokémon profiles and linking them relationally to user team members (check, counter, weakness).
- `live-simulator`: Real-time side-by-side battle dashboard with field modifiers, dynamic speed tiers, and instant damage calculation.
- `champions-data-engine`: Pulling Showdown's `pokedex.js` and `moves.js`, parsing legal sets for Reg M-A, and adapting `@smogon/calc` logic for 66-SP scaling.

### Modified Capabilities
*(None. This is a greenfield project.)*

## Impact

- The app will be built as a client-side Single Page Application (SPA), likely using React/Tailwind.
- State and configurations will be stored locally in the browser (`localStorage`) and exportable to JSON/Pokepaste to avoid backend overhead.
- Relies heavily on external data fetching or periodic scraping of Pokémon Showdown repositories.