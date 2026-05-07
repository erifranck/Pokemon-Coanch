## 1. UI Filter Fix

- [x] 1.1 Fix `src/pages/TeamBuilder.tsx` search filter: change `!key.includes('mega')` to `!def.name.includes('-Mega')` so Meganium and other base Pokémon aren't accidentally excluded.
- [x] 1.2 Fix `src/pages/ThreatMatrix.tsx` search filter with the same correction.

## 2. Data Extraction Accuracy

- [x] 2.1 Rewrite the species legality check in `scripts/update-rules.ts` to use `TeamValidator.validateSet()` with a minimal Pokémon set, checking for ban-related errors to determine legality.
- [x] 2.2 Run `npm run update-data` to regenerate `format_data.json` with the corrected, validated species list.
- [x] 2.3 Verify that the extracted data includes expected Pokémon (Meganium, etc.) and excludes illegal ones (pre-evolutions that are not in the format).

## 3. Verification

- [x] 3.1 Confirm the search dropdown no longer shows Mega forms as selectable entries.
- [x] 3.2 Confirm Meganium appears in the search dropdown.
- [x] 3.3 Confirm equipping Meganiumite on Meganium triggers the Mega Toggle correctly.
- [x] 3.4 Confirm all 272+ tier-valid Pokémon from the Champions mod are present in the extracted data.
