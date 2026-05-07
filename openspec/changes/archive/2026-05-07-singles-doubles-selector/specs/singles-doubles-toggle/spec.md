## ADDED Requirements

### Requirement: Singles/Doubles toggle in Live Simulator
The system SHALL display a toggle control in the Live Simulator UI that allows the user to select between `'Singles'` and `'Doubles'` battle format. The selected value MUST be passed as `gameType` to the `@smogon/calc` `Field` constructor for all damage calculations on the page.

#### Scenario: Default state is Doubles
- **WHEN** the Live Simulator page loads for the first time or with no persisted state
- **THEN** the toggle shows `'Doubles'` as the selected option

#### Scenario: User switches to Singles
- **WHEN** the user clicks the `'Singles'` button on the toggle
- **THEN** the toggle highlights `'Singles'`, and all subsequent damage calculations use `gameType: 'Singles'` in the `Field` object

#### Scenario: User switches back to Doubles
- **WHEN** the user clicks the `'Doubles'` button after having selected Singles
- **THEN** the toggle highlights `'Doubles'`, and all subsequent damage calculations use `gameType: 'Doubles'` in the `Field` object

### Requirement: Spread move damage penalty in Doubles
The system SHALL apply the 0.75x spread move damage penalty when `gameType` is `'Doubles'` and the move's target is `'allAdjacent'` or `'allAdjacentFoes'`.

#### Scenario: Heat Wave in Doubles
- **WHEN** `gameType` is `'Doubles'` and a spread move like Heat Wave (target: `'allAdjacentFoes'`) is calculated
- **THEN** the damage result reflects the 0.75x spread penalty

#### Scenario: Heat Wave in Singles
- **WHEN** `gameType` is `'Singles'` and a spread move like Heat Wave is calculated
- **THEN** the damage result uses full damage with no spread penalty

#### Scenario: Single-target move is unaffected
- **WHEN** `gameType` is `'Doubles'` and a single-target move like Thunderbolt (target: `'normal'`) is calculated
- **THEN** the damage result uses full damage regardless of game type

### Requirement: Screen reduction adjusted for game type
The system SHALL apply the correct screen damage reduction based on `gameType`: 0.5x for Singles, ~0.667x for Doubles, affecting Reflect, Light Screen, and Aurora Veil.

#### Scenario: Light Screen in Singles
- **WHEN** `gameType` is `'Singles'` and Light Screen is active on the defender's side for a Special move
- **THEN** the damage is reduced by 50% (0.5x multiplier)

#### Scenario: Light Screen in Doubles
- **WHEN** `gameType` is `'Doubles'` and Light Screen is active on the defender's side for a Special move
- **THEN** the damage is reduced to approximately 66.7% (~0.667x multiplier)

### Requirement: Game type persistence
The system SHALL persist the selected `gameType` value in `sessionStorage` so it survives page refreshes during the same browser session.

#### Scenario: Persisted state after refresh
- **WHEN** the user selects `'Singles'` and refreshes the page
- **THEN** the toggle still shows `'Singles'` as the selected option

#### Scenario: New session defaults to Doubles
- **WHEN** the user opens the Live Simulator in a new browser tab or after clearing session storage
- **THEN** the toggle defaults to `'Doubles'`

### Requirement: Both damage directions use same game type
The system SHALL apply the same `gameType` value to both `Field` objects used for damage calculation (ally attacking threat, and threat attacking ally).

#### Scenario: Consistent game type for both calculations
- **WHEN** `gameType` is `'Doubles'` and both ally→threat and threat→ally damage are calculated
- **THEN** both calculations use `gameType: 'Doubles'` in their respective `Field` objects
