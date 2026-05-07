## 1. Data Layer — Enrich move options

- [x] 1.1 Import `moves.json` into `PokemonCard.tsx` and create a `getMoveDetail(moveId)` helper that merges `format_data.json` move data with `moves.json` fields (`accuracy`, `priority`, `target`)
- [x] 1.2 Extend the move options mapping in `PokemonCard.tsx` to include enriched metadata (`type`, `basePower`, `category`, `accuracy`) in each `ComboboxOption` via the existing `meta` extension field on the option interface

## 2. Combobox — Add tooltip rendering support

- [x] 2.1 Extend `ComboboxOption` interface with optional `meta?: Record<string, unknown>` field
- [x] 2.2 Add optional `renderTooltip?: (option: ComboboxOption) => React.ReactNode` prop to `Combobox`
- [x] 2.3 Add `onMouseEnter` / `onMouseLeave` handlers on each `<li>` in the Combobox dropdown to track which item is currently hovered (single `hoveredId` state)
- [x] 2.4 Render the tooltip via `renderTooltip` only for the currently hovered item, positioned absolutely relative to the dropdown

## 3. MoveTooltip — Build the visual component

- [x] 3.1 Create `src/components/MoveTooltip.tsx` with props: `name: string`, `type: string`, `category: string`, `basePower: number | string`, `accuracy: number | string | true`
- [x] 3.2 Implement the type badge using the same color system as `TypeChip` (Tailwind classes per type — Fire=red, Water=blue, etc.)
- [x] 3.3 Implement visual indicators for category: "⚔️ Physical", "🔮 Special", "⭕ Status" with distinct styling
- [x] 3.4 Display base power prominently — show number (e.g., "90") for attacks, "--" for Status moves
- [x] 3.5 Display accuracy with color coding: green (100%), yellow (≥80%), red (<80%), "--" for never-miss (`true`)
- [x] 3.6 Apply dark theme styling (`bg-gray-800`, `border-gray-600`, `text-white`) with subtle separators between sections

## 4. Tooltip — Smart positioning

- [x] 4.1 Implement position calculation using `getBoundingClientRect()` — get the hovered `<li>` element's position and the tooltip's dimensions
- [x] 4.2 Default position: tooltip appears to the right of the dropdown (`left: dropdownRight + 8px`, `top: liTop`)
- [x] 4.3 Fallback: if insufficient space on the right (<250px from viewport edge), flip to the left of the dropdown
- [x] 4.4 Add a small delay (150ms) before showing the tooltip to prevent flickering when quickly moving between options
- [x] 4.5 Ensure tooltip renders with `position: fixed` and high `z-index` (`z-50` or higher) so it overlays other content

## 5. Integration — Wire everything in PokemonCard

- [x] 5.1 Pass enriched move options (with `meta` containing type, basePower, category, accuracy) to each `Combobox` in the moves section
- [x] 5.2 Pass `renderTooltip` prop to `Combobox` that renders `<MoveTooltip>` with the enriched data from `option.meta`
- [x] 5.3 Ensure the tooltip does NOT appear for the item/ability Comboboxes (they don't pass `renderTooltip`)

## 6. Polish & Testing

- [x] 6.1 Verify tooltip appears correctly on all 4 move selectors in `PokemonCard`
- [x] 6.2 Verify tooltip positioning works near viewport edges (resize browser, scroll to different positions)
- [x] 6.3 Verify type badge colors match `TypeChip` for all 18 types
- [x] 6.4 Verify Status moves show "--" for power and correct accuracy display
- [x] 6.5 Verify never-miss moves (accuracy: `true`) display "--" for accuracy
- [x] 6.6 Verify tooltip disappears on mouse leave and updates correctly when moving between options
- [x] 6.7 Run `npm run build` to ensure no TypeScript or build errors
- [x] 6.8 Run `npm test` (if tests exist) to ensure no regressions
