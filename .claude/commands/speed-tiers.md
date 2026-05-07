---
description: Calculate speed tiers for the current team and compare against top meta threats
---

Calculate speed tiers for the team in this session:

1. Call `get_usage_stats` with `regulation="M-A"` and `top_n=15` to get meta Pokemon names
2. Call `calculate_speed_tiers` with:
   - `pokemon_list`: all team Pokemon with EVs/nature if known from session context
   - `meta_pokemon`: top 15 Pokemon names from usage stats

Then present:

**Team Speed Tiers** — For each team member, sorted fastest to slowest:
- Base speed stat (with EVs/nature if known)
- Speed with Choice Scarf (+50%)
- Speed under Tailwind (×2)
- Speed at -1 (Icy Wind, Scary Face, Electroweb)
- Which top-meta Pokemon it outspeeds / is outsped by at each tier

**Key Speed Relationships** — The 3-5 speed benchmarks that matter most for this team:
- "Your [Pokemon] at [speed] outspeeds [threat] at base but not under Scarf"
- "Tailwind flips the matchup against [threat]"

**Speed Control Gaps** — Does this team have a reliable way to control speed? If the speed control is removed, which meta threats become unmanageable?

**Recommendations** — If speed EV investment is suboptimal, suggest specific EV spreads with reasoning.

$ARGUMENTS
