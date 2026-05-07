## Context

PokePaste is the de facto standard for sharing Pokémon teams in the competitive community. It's a plain-text format where each Pokémon is a block of lines specifying species, item, ability, moves, nature, EVs, and IVs. Pokémon Showdown, Pikalytics, and most VGC tools support it.

## Goals / Non-Goals

**Goals:**
- Parse PokePaste text into our `TeamCard` format (species, item, ability, moves, nature, EVs→SPs).
- Export our team to valid PokePaste text.
- Auto-filter illegal Pokémon during import, showing which were dropped.
- Add delete button on illegal cards in the builder.

**Non-Goals:**
- Full EV-to-SP conversion accuracy (EVs map differently than our SP system; use best-effort mapping).
- Support for every PokePaste edge case (nicknames, shininess, gender, happiness). Focus on competitive-relevant fields.

## Decisions

1. **EV → SP Mapping:** Since our format uses SP (1 SP = 1 stat point) instead of EVs, map EVs proportionally: `SP = Math.round(EV / 8)`. A 252 EV becomes 32 SP (max). A 4 EV becomes 0 or 1 SP.
   - *Rationale:* Simple, intuitive, and works for VGC-level precision.

2. **Parser Design:** Simple line-by-line parser. First line is always `Species @ Item`. Blank lines separate Pokémon blocks. Lines starting with `- ` are moves. `Ability:` line for ability. `Nature` line for nature.
   - *Rationale:* KISS. Don't over-engineer a format that's inherently simple.

3. **Illegal Filtering:** After parsing each Pokémon, check `formatData[regulation].pokemon[id]`. If missing or empty, skip the Pokémon and collect the name in a "dropped" list. Show a toast with the dropped names.
   - *Rationale:* Clean UX — user knows exactly what was removed and why.

4. **Export Button Placement:** Add "Export PokePaste" and "Import PokePaste" buttons next to the existing Clone/Delete buttons in TeamManager.
   - *Rationale:* Keep team-level operations grouped together.

## Risks / Trade-offs

- **Risk:** EV→SP conversion loses precision (a team with 252/252/4 EVs becomes 32/32/0 SP, wasting 2 SP).
  - *Mitigation:* Accept this as a limitation of our SP system. Users can fine-tune after import.
