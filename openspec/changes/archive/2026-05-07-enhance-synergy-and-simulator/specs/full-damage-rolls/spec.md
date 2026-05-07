## ADDED Requirements

### Requirement: Display Full Damage Roll Range
The Live Simulator SHALL display all 16 possible damage outcomes as a range of HP values and percentages, along with a visual bar indicating the proportion of the defender's HP removed.

#### Scenario: Calculating damage rolls
- **WHEN** a damage calculation is performed for an attacking move
- **THEN** the result displays the minimum and maximum HP damage (e.g., "97 - 111 HP"), the percentage range (e.g., "45.2% - 53.4%"), a visual bar proportional to the damage spread, and a KO indicator (OHKO, 2HKO, 3HKO).

### Requirement: HP-Based Damage Values
Damage results SHALL display actual HP numbers alongside percentage values, calculated against the defender's total HP.

#### Scenario: HP damage display
- **WHEN** a move does 45.2% - 53.4% against a 200 HP defender
- **THEN** the card shows "90 - 106 HP (45.2% - 53.4%)".
