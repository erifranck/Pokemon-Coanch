## 1. Core analysis utility

- [x] 1.1 Create `src/utils/coreAnalysis.ts` with interfaces for `CoreResult`, `PairScore`, `TripleScore`
- [x] 1.2 Implement `getWeaknesses(member, activeFormat)`: returns array of types that hit the member for ≥2x, considering dual types, mega evolution, and ability immunities
- [x] 1.3 Implement `getResistances(member, activeFormat)`: returns types the member resists (≤0.5x) or is immune to (0x), including ability immunities
- [x] 1.4 Implement `detectRecognizedCores(team, activeFormat)`: checks 5 pre-defined cores against team types, returns matching groups with scores
- [x] 1.5 Implement `scorePair(memberA, memberB, activeFormat)`: calculates synergy score for a pair
- [x] 1.6 Implement `scoreTriple(memberA, memberB, memberC, activeFormat)`: calculates synergy score for a triple
- [x] 1.7 Implement `analyzeTeamCores(team, activeFormat)`: master function returning all recognized cores, top pairs, and top triples sorted by score

## 2. Core Analysis Modal component

- [x] 2.1 Create `src/components/CoreAnalysisModal.tsx` receiving `team`, `activeFormat`, `isOpen`, `onClose` props
- [x] 2.2 Render recognized cores section with Pokémon sprites, type chips, and score
- [x] 2.3 Render top pairs section with expandable rows showing covered/uncovered weaknesses
- [x] 2.4 Render top triples section similar to pairs
- [x] 2.5 Implement expand/collapse toggle per entry to show/hide weakness coverage details
- [x] 2.6 Apply dark theme styling matching the app (bg-gray-800, border, scrollable sections)
- [x] 2.7 Handle empty state: "No cores detected for this team" or "Add more Pokémon to analyze cores"

## 3. Integration with Type Synergy

- [x] 3.1 Add "Analyze Cores" button in TypeSynergy.tsx header area (next to existing toggles)
- [x] 3.2 Import and render `CoreAnalysisModal`, controlling open/close state
- [x] 3.3 Pass team members and activeFormat to the modal

## 4. Verification

- [x] 4.1 Run `npm run build` to ensure no TypeScript or build errors
- [x] 4.2 Run `npm test` to ensure no regressions
- [x] 4.3 Verify recognized cores are detected with a test team (Fire/Water/Grass types present)
- [x] 4.4 Verify pairs and triples are scored and displayed correctly
- [x] 4.5 Verify ability immunities affect weakness calculations (Levitate → Ground not counted)
