## Why

The search filter `!key.includes('mega')` accidentally excludes valid base Pokémon like Meganium (which contains "mega" in its ID/name). Additionally, the `update-rules.ts` extraction script iterates over ALL Gen 9 species instead of accurately applying the Champions mod's tier overrides via Showdown's TeamValidator, resulting in 328 extracted Pokémon when there should be 272 tier-valid species. The search also displays Mega form entries directly instead of only exposing them through the Mega Stone equipment toggle.

## What Changes

- Fix the UI search filter to correctly exclude Mega forms (`name.includes('-Mega')`) without filtering base species like Meganium.
- Rewrite `scripts/update-rules.ts` to use Showdown's `TeamValidator` for accurate species legality checking against the Champions mod's format rules, instead of manual tier checks.
- Update `TeamBuilder.tsx` and `ThreatMatrix.tsx` search to use the corrected filter.
- Verify the extracted data is complete and accurate.

## Capabilities

### Modified Capabilities
- `showdown-data-extraction`: The extraction script must use Showdown's validation engine for accurate format legality rather than manual tier/isNonstandard checks.
- `format-validation`: The UI search filter must correctly distinguish between base Pokémon and Mega Evolution forms.

## Impact

- **Code:** `scripts/update-rules.ts`, `src/pages/TeamBuilder.tsx`, `src/pages/ThreatMatrix.tsx`
- **Data:** Regenerated `src/data/format_data.json`
- **UI:** Pokemon search dropdown, Pokemon cards
