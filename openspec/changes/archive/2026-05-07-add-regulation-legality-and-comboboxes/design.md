## Context

Currently, the Team Builder allows selecting any Pokémon, Ability, Item, or Move that exists in the game, without considering the rules of the selected format (e.g., Champions Reg M-A). Furthermore, the native `<select>` inputs are extremely cumbersome for lists containing hundreds of options (like the 600+ moves in the game). 

## Goals / Non-Goals

**Goals:**
- Provide a responsive, accessible text-search Combobox for selecting Pokémon, Items, Abilities, and Moves.
- Restrict dropdown options to only those legal within the team's selected regulation.
- Gracefully handle pre-existing illegal selections by highlighting them in red rather than automatically deleting user data.
- Efficiently parse and serve Showdown's `learnsets.ts` data to determine move legality per Pokémon.

**Non-Goals:**
- Complex "complex ban" parsing (e.g., "This Pokémon cannot hold this specific item IF it has this specific ability"). We will stick to standard legality (Is the Pokémon legal? Is the move in its learnset? Is the item legal?).
- Backend-enforced validation. All legality checks remain client-side for immediate UX feedback.

## Decisions

### 1. Data Parsing: Handling `learnsets.js`
Showdown's `learnsets` file is massive. To avoid crashing the client browser with a 5MB JSON file, our Node script (`parse-data.js`) will parse `learnsets.js` but will compress the output.
Instead of saving the entire encounter history (how it was learned, what level), we will only save a boolean map or a simple array of move IDs that are legal in Gen 9 / Champions.
*Rationale:* Reduces the `learnsets.json` size from several megabytes to a few hundred kilobytes, ensuring the SPA remains blazing fast.

### 2. Combobox UI: Headless UI or Custom React
We will build a custom React component using `useRef` and absolute positioning for the dropdown, combined with an `<input type="text">` for filtering, rather than pulling in a heavy external library.
*Rationale:* We need extremely specific control over rendering "Illegal" tags and red highlighting inside the dropdown and the input itself. A custom lightweight component avoids fighting with third-party library styling constraints.

### 3. Store Update: Team Regulation
```typescript
export interface TeamProfile {
  id: string;
  name: string;
  regulation: string; // e.g., 'vgc2026regma'
  members: TeamCard[];
}
```
The UI will default to `vgc2026regma`. The parser script will output a `regulations.json` that defines which Pokémon, items, and moves are banned in which formats.

### 4. Legality Checking Logic
The legality check will be a pure utility function:
`checkLegality(pokemonId, type: 'move'|'item'|'ability', valueId, regulation)` -> `boolean`
If it returns false, the `Combobox` component will add a `border-red-500 text-red-500 bg-red-900/50` class to the input.

## Risks / Trade-offs

- **Risk: Client-side memory bloat.** Loading `learnsets.json` into memory might cause lag on lower-end mobile devices when opening the team builder.
  *Mitigation:* Use React's `useMemo` extensively when filtering the 600+ moves to ensure we don't recalculate the filtered dropdown list on every keystroke.
- **Risk: Showdown's obscure format rules.** Some formats inherit bans from others dynamically in Showdown's code.
  *Mitigation:* Our parser will flatten the rules. If a format relies on complex programmatic bans, we will manually hardcode the banlist for the specific "Champions Reg M-A" format in our parser to guarantee accuracy.