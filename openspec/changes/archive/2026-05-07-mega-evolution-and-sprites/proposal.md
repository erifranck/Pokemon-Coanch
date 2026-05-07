## Why

The current team builder uses static PokeAPI sprites that do not support alternative forms, Megas, or accurate competitive sprites. Furthermore, when configuring a Pokémon, users need to visualize the final calculated stats, including the effects of Mega Evolution (when a Mega Stone is equipped) or specific stat-modifying items (like Choice Scarf), without losing their base SP (EV) inputs. This allows for accurate damage and speed calculations during team building.

## What Changes

- Switch from PokeAPI static sprites to Pokémon Showdown's Gen 5 style sprites (which support all forms and Megas perfectly using Showdown IDs).
- Modify the data extraction script to link Mega Stones to their corresponding Mega forms.
- Implement an automatic Mega Evolution toggle in the UI that activates when a Mega Stone is equipped.
- Allow users to toggle between viewing the Base form stats and the Mega form stats while preserving their original SP (EV) inputs.
- Update the final stat calculations to apply item-based modifiers (e.g., Choice Scarf = 1.5x Spe).

## Capabilities

### New Capabilities
- `mega-evolution-toggle`: Support for automatically transitioning a Pokémon card into its Mega Evolution form when holding the correct Mega Stone, while preserving base SPs.
- `item-stat-modifiers`: Application of competitive item modifiers (e.g., Choice items, Eviolite) to the final displayed stats.

### Modified Capabilities
- `team-builder`: Updating the visual sprite rendering mechanism to use Showdown URLs and handling the display of alternate form calculations.

## Impact

- **Code:** `src/components/PokemonCard.tsx`, `src/utils/calcAdapter.ts`, `scripts/update-rules.ts`.
- **Data:** Changes to the structure of `src/data/format_data.json` to include `megaEvolves` and `megaStone` properties for items.
- **UI:** New toggle button and enhanced stat display colors/indicators on the Pokémon card.
