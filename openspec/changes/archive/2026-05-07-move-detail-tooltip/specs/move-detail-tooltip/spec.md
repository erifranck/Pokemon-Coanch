## ADDED Requirements

### Requirement: Move detail tooltip on hover
The system SHALL display a detailed tooltip when the user hovers over any move option in the move selector Combobox. The tooltip MUST include the move's elemental type (with type-specific color coding), power (basePower), category (Physical/Special/Status with a visual indicator), and accuracy percentage.

#### Scenario: Hover over a Physical attack move
- **WHEN** the user hovers over a move option with category "Physical" (e.g., "Earthquake")
- **THEN** a tooltip appears showing the move name, type badge with the elemental color, power value (e.g., "100"), a "Physical" category indicator, and accuracy percentage (e.g., "100%")

#### Scenario: Hover over a Special attack move
- **WHEN** the user hovers over a move option with category "Special" (e.g., "Thunderbolt")
- **THEN** a tooltip appears showing the move name, type badge with the elemental color, power value (e.g., "90"), a "Special" category indicator, and accuracy percentage (e.g., "100%")

#### Scenario: Hover over a Status move
- **WHEN** the user hovers over a move option with category "Status" (e.g., "Swords Dance")
- **THEN** a tooltip appears showing the move name, type badge with the elemental color, power shown as "--", a "Status" category indicator, and accuracy (if applicable, or "--" for self-targeting moves)

#### Scenario: Hover over a move with non-standard accuracy
- **WHEN** the user hovers over a move with accuracy value `true` (never miss, e.g., "Aerial Ace")
- **THEN** the tooltip displays accuracy as "--" (never misses) instead of a percentage

#### Scenario: Mouse leaves the move option
- **WHEN** the user moves the mouse away from the hovered move option
- **THEN** the tooltip disappears immediately

### Requirement: Tooltip visual design
The tooltip SHALL use the application's dark theme and display information in a structured, color-coded layout. The type badge MUST match the color scheme used by the existing `TypeChip` component.

#### Scenario: Type badge color consistency
- **WHEN** a tooltip is displayed for any move
- **THEN** the type badge uses the same background color as `TypeChip` for that type (e.g., Fire = red, Water = blue, Electric = yellow)

#### Scenario: Tooltip layout
- **WHEN** a tooltip is displayed
- **THEN** the layout shows the move name at the top, followed by the type badge, then power and category on one row, and accuracy below, all within a bordered card with the dark theme styling

### Requirement: Tooltip positioning
The tooltip SHALL be positioned intelligently to avoid being clipped by viewport edges. By default it appears to the right of the hovered option, but MUST flip to the left if there is insufficient space on the right side of the viewport.

#### Scenario: Tooltip appears to the right by default
- **WHEN** the user hovers over a move option and there is more than 250px of space to the right of the dropdown
- **THEN** the tooltip appears to the right of the hovered item

#### Scenario: Tooltip flips to the left when near viewport edge
- **WHEN** the user hovers over a move option and there is less than 250px of space to the right of the dropdown
- **THEN** the tooltip appears to the left of the dropdown instead

### Requirement: Data enrichment for move options
The system SHALL enrich move options with data from `moves.json` to populate the tooltip. For each move in the Combobox options, the system MUST look up `accuracy` and any other fields not present in `format_data.json` from the `moves.json` dataset.

#### Scenario: Accuracy lookup from moves.json
- **WHEN** a move is displayed in the Combobox dropdown
- **THEN** the tooltip data includes the `accuracy` value from `moves.json` for that move, even though `format_data.json` does not contain accuracy

#### Scenario: Missing move in moves.json
- **WHEN** a move exists in `format_data.json` but not in `moves.json`
- **THEN** the tooltip still displays available data (type, category, power) from `format_data.json` and shows "--" for accuracy

### Requirement: Combobox tooltip support
The `Combobox` component SHALL support an optional `renderTooltip` prop that, when provided, renders a tooltip when hovering over dropdown items. The tooltip MUST only render for the currently hovered item (not all items at once).

#### Scenario: Combobox without renderTooltip prop
- **WHEN** a Combobox is used without the `renderTooltip` prop (e.g., for Item or Ability selectors)
- **THEN** the dropdown behaves exactly as before with no tooltip functionality

#### Scenario: Combobox with renderTooltip prop
- **WHEN** a Combobox is used with the `renderTooltip` prop (e.g., for Move selectors)
- **THEN** hovering over any dropdown item calls `renderTooltip` with that item's data and the tooltip is displayed

### Requirement: Only one tooltip visible at a time
The system SHALL ensure that at most one tooltip is visible at any given time across all move selectors.

#### Scenario: Moving hover between different move selectors
- **WHEN** the user moves the mouse from a move option in Move 1 selector to a move option in Move 2 selector
- **THEN** the tooltip for Move 1 disappears and a new tooltip for Move 2 appears

#### Scenario: Quickly moving between options in the same selector
- **WHEN** the user moves the mouse quickly between multiple move options in the same selector
- **THEN** the tooltip updates smoothly to reflect the currently hovered option without flickering or showing multiple tooltips
