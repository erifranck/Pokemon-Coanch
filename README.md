# Pokémon Coach — Competitive Team Builder

[🇪🇸 Español](README.es.md)

A professional Pokémon VGC team builder for the **Pokémon Champions** format (Regulation M-A), powered by **Pokémon Showdown** and **Munchstats**.

## Features

- **Team Builder** — Build 6-Pokémon teams using the 66-SP stat system with full legality validation
- **Mega Evolution Toggle** — Automatic Mega form detection with base/mega stat comparison
- **Type Synergy Matrix** — Defensive type chart with ability-based immunity overrides (Levitate, Water Absorb, etc.)
- **Threat Matrix** — Manage meta threats with pre-built sets from Munchstats usage data
- **Live Damage Simulator** — Calculate damage with 16 rolls, stat stages, screens, weather, terrain, burn, Helping Hand, Fairy/Dark Aura
- **Unit Tests** — 55 tests covering stat math, type chart, mega detection, and ability immunities

## Powered By

| Source | Data |
|---|---|
| [Pokémon Showdown](https://pokemonshowdown.com/) | Pokémon data, learnsets, format rules, sprites |
| [Munchstats](https://munchstats.com/) | Competitive usage statistics, common sets |

## Development

```bash
npm install
npm run update-data    # Extract format rules from Showdown
npm run dev            # Start dev server
npm test               # Run tests
npm run build          # Production build
npm run deploy         # Deploy to GitHub Pages
```

## Tech Stack

React 19 · TypeScript · Zustand · Tailwind CSS · @smogon/calc · Vitest
