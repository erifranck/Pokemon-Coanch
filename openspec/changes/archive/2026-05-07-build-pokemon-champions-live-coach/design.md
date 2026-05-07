## Context

The "Pokémon Champions Live Coach" is designed for competitive players in the "Reg M-A" format. The tool requires zero latency during live games to calculate speed tiers and damage percentages on the fly. Because the Reg M-A format replaces traditional EVs with a 66-SP (Stat Point) system (capped at 32 SP per stat), existing tools like Pokémon Showdown's native builder or Smogon's calculator don't offer the UX required for live, relational matchup tracking.

## Goals / Non-Goals

**Goals:**
- Provide a blazing fast, zero-latency client-side app (SPA) that does not require a backend for normal usage.
- Adapt the Pokémon Showdown data structure and `@smogon/calc` engine to the 66-SP math logic.
- Implement an entity relationship system locally to map allied Pokémon to their respective meta threats.

**Non-Goals:**
- Creating a centralized database of shared teams/accounts (users will share via JSON/Pokepaste).
- Simulating full 6v6 or 4v4 battle states turn-by-turn (it evaluates 1v1 matchups with field modifiers).
- Maintaining our own proprietary stats database (we will rely entirely on Showdown's open-source definitions).

## Decisions

### 1. Frontend Framework: React + Vite + Tailwind CSS
We need a highly reactive UI for the "cards" and the live simulator. React with Tailwind CSS allows rapid prototyping of complex grids and dynamic conditional styling (like colored SP bars).

### 2. State Management: Zustand + LocalStorage
The state of the application consists of user-created entities (Team Cards, Threat Cards) and their mappings (Relationships). 
- *Rationale:* Zustand offers a tiny footprint and native `persist` middleware to automatically sync state with `localStorage`, guaranteeing data survival across sessions without requiring a backend.

### 3. Data Source Architecture: Static Pre-parsed Showdown Data
Rather than making network requests to an API like PokeAPI or Showdown during usage, we will periodically run a build script that fetches `pokedex.js`, `moves.js`, and `formats-data.js` from Pokémon Showdown, parses them into JSON, and bundles them into the client application.
- *Rationale:* Ensures 0 latency in the live simulator.

### 4. Calculation Engine: Adapting `@smogon/calc`
We will import `@smogon/calc` and build an adapter layer. In standard Pokémon, EVs affect stats through a formula `floor(EV/4)`. In Champions M-A, 1 SP = 1 direct point to the stat at Level 50. Our adapter will bypass standard EV calculations and inject the SP directly into the final stat before passing the raw stat numbers to the damage formulas.
- *Rationale:* Prevents us from having to rewrite the complex math for STAB, weather modifiers, Tera types, and ability interactions.

## Risks / Trade-offs

- **Risk: Showdown changes their data format.** Showdown's `.js` data files are not stable APIs. 
  *Mitigation:* Keep the data parsing script strongly typed and isolated, so if their format changes, we only need to update the parser.
- **Risk: `@smogon/calc` compatibility with custom stats.** The library usually expects EVs/IVs to calculate stats internally. 
  *Mitigation:* Use the library's ability to accept pre-calculated `raw` stats (overrides) so we can handle the SP math ourselves and let the engine just do the damage calculation.