## Context

The current data extraction in `scripts/update-rules.ts` manually checks `isNonstandard`, `tier`, and `ruleTable.isBannedSpecies` to determine legality. This is fragile and inaccurate for VGC formats that use "Obtainable" rules (checking Pokédex membership). The proper way is to use Showdown's `TeamValidator.validateSet()` which runs ALL format rules. Additionally, the UI filter `!key.includes('mega')` is a substring match that catches "Meganium" and other non-mega Pokémon.

## Goals / Non-Goals

**Goals:**
- Use `TeamValidator.validateSet()` in the extraction script to get exactly what's legal in the format.
- Fix the search filter to exclude only Mega Evolution forms (`-Mega` pattern in name) not substring matches.
- Regenerate `format_data.json` with accurate data.

**Non-Goals:**
- Full move/item validation via TeamValidator (only species extraction).

## Decisions

1. **TeamValidator for Species:** Use `new TeamValidator(format.id)` with a minimal Pokemon set and parse validation errors. If ANY error indicates the species is banned/illegal, exclude it.
   - *Rationale:* The validator runs ALL format rules including "Obtainable", Pokedex restrictions, banlists, and mod-specific overrides.

2. **Filter pattern `-Mega`:** Use `!def.name.includes('-Mega')` to filter mega forms from search.
   - *Rationale:* All Mega Evolution names in the Champions mod follow the pattern `BaseName-Mega` or `BaseName-Mega-X/Y`. Base Pokémon like Meganium don't contain `-Mega`.

## Risks / Trade-offs

- **Risk:** `TeamValidator.validateSet()` may be slower (validating thousands of species one by one).
  - *Mitigation:* Accept the build-time cost (~30 seconds max) since the script is run explicitly via `npm run update-data`.
