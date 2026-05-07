## 1. Route & Navigation

- [x] 1.1 Add new route `/coverage` in `src/App.tsx` pointing to `OffensiveCoverage` component
- [x] 1.2 Add "Offensive Cvrg" tab in `src/components/Layout.tsx` navbar between "Type Synergy" and "Threat Matrix"

## 2. Coverage calculation logic

- [x] 2.1 Create `src/utils/offensiveCoverage.ts` with function `getOffensiveCoverage(team, activeFormat)` that returns coverage data per defending type per team member
- [x] 2.2 Filter only damaging moves: `category !== 'Status'` and `basePower > 0`
- [x] 2.3 For each defending type, check if any move's type hits it for ≥2x using `TYPE_CHART[atkType][defType]`
- [x] 2.4 Detect STAB: `moveType ∈ pokemon.types[]` (consider mega forms and Tera type)
- [x] 2.5 Handle Tera type in STAB detection via a boolean parameter

## 3. Offensive Coverage page

- [x] 3.1 Create `src/pages/OffensiveCoverage.tsx` with layout matching `TypeSynergy.tsx` style (table, dark theme)
- [x] 3.2 Table rows: 18 defending types from `TYPES` array; columns: team members; extra column: coverage count
- [x] 3.3 Cell rendering: `✓` (green), `✓☆` (green + star), `✗` (gray) based on coverage data
- [x] 3.4 Coverage count column: show number of team members covering each type, highlight ⚠️ for 0
- [x] 3.5 Team member headers: show Pokemon sprite, name, and type chips (reuse from TypeSynergy)
- [x] 3.6 Respect mega evolution when resolving Pokemon types for STAB calculation

## 4. Tooltip on cell hover

- [x] 4.1 Add `onMouseEnter`/`onMouseLeave` handlers on `✓`/`✓☆` cells
- [x] 4.2 Tooltip shows list of covering moves: move name, type, STAB indicator if applicable
- [x] 4.3 Tooltip positioned with `absolute`/`fixed` to avoid clipping, following dark theme

## 5. STAB Toggle

- [x] 5.1 Add "Highlight STAB" checkbox toggle at top of the page (matching TypeSynergy toggles)
- [x] 5.2 When toggled OFF, all `✓☆` become `✓`

## 6. Empty state

- [x] 6.1 Show message "Your active team is empty" when no team members exist (matching TypeSynergy)

## 7. Verification

- [x] 7.1 Run `npm run build` to ensure no TypeScript or build errors
- [x] 7.2 Run `npm test` to ensure no regressions
- [x] 7.3 Verify navigation tab appears and routes correctly
- [x] 7.4 Verify STAB toggle works correctly
- [x] 7.5 Verify status moves are excluded from coverage
