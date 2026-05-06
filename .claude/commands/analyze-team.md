---
description: Full Pokemon Champions team analysis — core, type coverage, speed tiers, meta matchups, and suggestions
---

Analyze the team I'm about to provide. Follow this exact sequence using the MCP tools:

1. Call `parse_team` with the team input
2. Call `get_pokemon_info` for each of the 6 Pokemon (can do in parallel)
3. Call `calculate_type_coverage` with all 6 Pokemon names
4. Call `calculate_speed_tiers` with all 6 Pokemon (include EVs/nature if known from the paste)
5. Call `get_usage_stats` with `regulation="M-A"` and `top_n=20`

Then provide a complete analysis structured as:

**Team Core** — Name the 2-4 Pokemon that form the win condition and the archetype (Trick Room / Tailwind / Weather / Hyper Offense / etc.)

**Type Coverage** — Concentrated weaknesses (3+ mons weak), key resistances, notable immunities

**Speed Control** — How the team controls speed (who sets tailwind/TR, fast leads, speed tiers that matter)

**Meta Matchups** — For each of the top 5 meta threats, how does this team handle it? (good / poor / weak)

**Suggestions** — 2-3 specific, explained improvements. For each: what changes, why it helps, what synergy it creates, any tradeoffs.

$ARGUMENTS
