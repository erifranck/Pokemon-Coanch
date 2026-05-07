---
description: Fetch and explain the current Pokemon Champions Regulation M-A meta from Limitless tournament data
---

Fetch the current meta for Pokemon Champions Regulation M-A:

1. Call `get_usage_stats` with `regulation="M-A"` and `top_n=20`
2. Call `get_top_teams` with `regulation="M-A"` and `top_n=5`

Then explain:

**Top Threats** — For each of the top 10 Pokemon by usage:
- Why it's dominant (typing, stats, ability, key moves)
- What role it usually plays (restricted anchor / speed control / redirection / wallbreaker)
- What's the best way to handle it

**Meta Archetypes** — What team structures appear most in the top teams? (e.g. "Calyrex-Ice + TR support is ~40% of top cuts")

**Meta Gaps** — What types or strategies are underrepresented that could be exploited?

If data comes back with `stale: true`, note that the data is a snapshot and may not reflect the latest tournaments.
