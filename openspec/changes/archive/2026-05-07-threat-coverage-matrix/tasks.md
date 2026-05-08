## 1. Threat coverage calculation logic

- [x] 1.1 Create `src/utils/threatCoverage.ts` with `MatchupResult` interface (speed, threatDamage, myDamage, threatKOPotential, myKOPotential)
- [x] 1.2 Implement `calculateMatchup(threat, teamMember, activeFormat, gen)`: creates Pokemon objects, computes best move damage in both directions, returns MatchupResult
- [x] 1.3 Implement `analyzeAllMatchups(threats, team, activeFormat, gen)`: runs calculations for all threat × team member pairs, returns results matrix
- [x] 1.4 Pre-create team Pokemon objects once and reuse across all threat calculations
- [x] 1.5 Determine KO potential: OHKO if min damage ≥ defender HP, 2HKO if min×2 ≥ HP, 3HKO if min×3 ≥ HP
- [x] 1.6 Compute speed comparison: compare final speed stats including nature, SPs, and Choice Scarf

## 2. Threat Coverage Modal

- [x] 2.1 Create `src/components/ThreatCoverageModal.tsx` receiving `team`, `threats`, `activeFormat`, `isOpen`, `onClose`
- [x] 2.2 Table header: team member sprites, names, and type chips as columns
- [x] 2.3 Table rows: threat sprite, name, type chips as sticky first column
- [x] 2.4 Cell rendering: compact indicator (speed arrow + KO text) with color coding (red/green/yellow)
- [x] 2.5 Cell tooltip on hover: detailed damage values (HP range, percentage, rolls)
- [x] 2.6 Row summary column: count of endangered team members, ⚠️ for 3+ threatened
- [x] 2.7 Loading state: spinner or skeleton while calculations run
- [x] 2.8 Horizontal + vertical scroll with sticky threat name column
- [x] 2.9 Empty state: message when no threats exist
- [x] 2.10 Dark theme styling matching the app

## 3. Integration with Threat Matrix

- [x] 3.1 Add "Analyze Coverage" button in ThreatMatrix.tsx header area
- [x] 3.2 Import and render ThreatCoverageModal, controlling open/close state
- [x] 3.3 Pass team members, threats, and activeFormat to the modal

## 4. Verification

- [x] 4.1 Run `npm run build` to ensure no TypeScript or build errors
- [x] 4.2 Run `npm test` to ensure no regressions
- [x] 4.3 Verify matrix opens and shows all threats vs team members
- [x] 4.4 Verify speed comparisons and damage calculations are correct
- [x] 4.5 Verify threat warnings highlight correctly (3+ endangered members)
- [x] 4.6 Verify loading state appears for large threat lists
