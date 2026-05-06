## Context

The current `regulations.json` is hardcoded, which leads to inaccuracies like allowing pre-evolutions (e.g., Charmander) in formats where only the final evolutions are legal (e.g., "Gen 9 Champions Reg M-A"). The `pokemon-showdown` npm package is the source of truth for all formats, bans, and rulesets in the competitive Pokémon community. Generating our data directly from Showdown's engine ensures perfectly accurate data.

## Goals / Non-Goals

**Goals:**
- Extract legal Pokémon, base stats, moves, and legal items for specified formats.
- Generate a static JSON file at build time so the client application doesn't have to compute or load the full `pokemon-showdown` library.
- Restrict UI selection to only valid Pokémon for the currently selected format.

**Non-Goals:**
- Client-side validation using the `pokemon-showdown` library (too heavy).
- Implementing the battle engine itself.
- Supporting legacy formats not present in the current `pokemon-showdown` ruleset.

## Decisions

- **Build-Time Extraction:** We will use a Node.js script (`scripts/update-rules.ts`) to extract data. The script will invoke `Dex.forFormat(...)` to query format legality, iterate through the Pokédex, and check `tier: "Illegal"` or `isNonstandard` to filter valid Pokémon.
  - *Rationale:* Ensures 100% accuracy matching Showdown's servers while keeping our client bundle size small.
- **Dynamic JSON Output:** Output a `champions_dex.json` or `format_data.json` instead of a minimal `regulations.json`.
  - *Rationale:* We need more than just bans. We need a whitelisted index of what *is* legal.
- **UI Fallback:** If a user selects an imported team with an illegal Pokémon, show a warning rather than silently deleting the Pokémon.

## Risks / Trade-offs

- **Risk:** Showdown updates may break the extractor script if internal APIs change.
  - *Mitigation:* Pin the `pokemon-showdown` dependency version. Update it manually when rules change.
- **Trade-off:** Build process gets slightly slower due to the generation step.
  - *Mitigation:* The data generation script will run explicitly via `npm run update-data` and is not required for hot-reloading development unless updating formats.
