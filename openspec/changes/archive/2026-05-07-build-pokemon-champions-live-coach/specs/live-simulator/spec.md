## ADDED Requirements

### Requirement: Side-by-Side Matchup View
The system SHALL present a side-by-side view showing an active Allied Pokémon and an active Threat Pokémon, with a central dashboard for Field Modifiers.

#### Scenario: Selecting Active Pokémon
- **WHEN** user selects an Allied Pokémon
- **THEN** the system prioritizes displaying the specific Threats the user previously linked to that Pokémon.

### Requirement: Dynamic Speed Tiers
The system SHALL calculate and display the Speed Tier order of the active Pokémon dynamically.

#### Scenario: Tailwind Modifier
- **WHEN** user toggles "Tailwind" on their side of the field
- **THEN** the speed of the Allied Pokémon is doubled and the Speed Tier visual order updates immediately to reflect the new turn order.

### Requirement: Real-time Damage Calculation
The system SHALL display the damage percentages (OHKO, 2HKO, etc.) for both the Allied Pokémon's attacks against the Threat, and the Threat's attacks against the Ally.

#### Scenario: Updating Stats in Combat
- **WHEN** user tweaks the SP of the Allied Pokémon directly in the Live Simulator view
- **THEN** the damage probabilities update instantly without requiring a page reload.