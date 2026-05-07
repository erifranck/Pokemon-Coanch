## Why

The app currently uses a custom JSON export/import format that is incompatible with the Pokémon competitive community's standard: **PokePaste** (the text format used by Pokémon Showdown). Adding PokePaste support allows users to import teams from Showdown, Pikalytics, and other tools, and share their teams with the broader community. Additionally, when importing a PokePaste containing Pokémon not legal in the active regulation, the import should automatically discard them instead of leaving the user with a broken team and no way to remove the illegal entries.

## What Changes

- Create a PokePaste parser (`src/utils/pokepaste.ts`) to convert PokePaste text into our internal `TeamCard` format.
- Create a PokePaste exporter to convert a team into PokePaste-formatted text.
- Add "Import from PokePaste" and "Export to PokePaste" buttons in the TeamManager UI.
- On import, validate each Pokémon against the active regulation's legal Pokémon list. Illegals are automatically skipped with a warning toast/notification showing which Pokémon were dropped.
- Add a "Delete" button on illegal Pokémon cards in the Team Builder so users can manually remove them.

## Capabilities

### New Capabilities
- `pokepaste-io`: Parse and generate PokePaste format for team import/export.

### Modified Capabilities
- `team-manager`: Add import/export buttons for PokePaste; auto-filter illegal Pokémon on import.

## Impact

- **Code:** New `src/utils/pokepaste.ts`, modified `src/components/TeamManager.tsx`, modified `src/components/PokemonCard.tsx` (delete button for illegal mons)
- **UI:** New buttons in TeamManager; delete button on illegal cards; toast/notification for filtered imports
