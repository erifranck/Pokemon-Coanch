## Context

The application currently holds a single global `team` array in its Zustand store. As we add the ability to manage multiple teams and evaluate type synergies, the data layer needs to support a normalized dictionary of teams. We also need to introduce visual enhancements (Sprites and Type chips) mapped to PokeAPI to improve the UX, and a new mathematical matrix to evaluate defensive typing synergies.

## Goals / Non-Goals

**Goals:**
- Refactor `useAppStore` to safely migrate existing users from a single team to a multi-team structure.
- Build a fast, client-side type matchup matrix that iterates over the active team.
- Fetch sprites directly from GitHub/PokeAPI using static URLs based on the `num` property from our `pokedex.json`.

**Non-Goals:**
- Downloading and hosting all 1000+ Pokémon sprites locally. We will hotlink to the official open-source PokeAPI GitHub raw URLs.
- Evaluating offensive synergy in the matrix (we are focusing strictly on defensive resistances/weaknesses).

## Decisions

### 1. Data Store Migration
Instead of `team: TeamCard[]`, the store will have:
```typescript
interface TeamProfile {
  id: string;
  name: string;
  members: TeamCard[];
}
teams: Record<string, TeamProfile>;
activeTeamId: string;
```
*Rationale:* Using a Record dictionary allows O(1) lookups and easy switching. The `activeTeamId` acts as a pointer. The `relationships` dictionary will continue mapping `TeamCard.id -> ThreatCard.id`, meaning threats are global, but links are specific to the unique UUID of the card inside a specific team.

### 2. Sprite Hotlinking
We will construct URLs using: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.num}.png`.
*Rationale:* Prevents bloating the repository size. If a user is offline, the alt text will fallback gracefully.

### 3. Type Synergy Logic
We need a static map of Type matchups (18x18 grid). Since `@smogon/calc` doesn't expose a clean, simple type-chart dictionary natively in an easy-to-iterate format, we will write a static `TYPE_CHART` constant mapping types to their defensive multipliers (2x, 0.5x, 0x). The grid will iterate over this chart against the types of the 6 active Pokémon.

### 4. Tera Type Toggle
The grid will accept a boolean prop `useTera`. When `true`, the matrix calculation will use `card.teraType` instead of `pokemon.types` for the defensive calculation.

## Risks / Trade-offs

- **Risk: Breaking existing user data.** Since Zustand uses `persist`, changing the state shape might crash the app for someone who already saved a `team` array. 
  *Mitigation:* Write a small migration function in the Zustand `persist` configuration (or handle it gracefully in the initialization) that wraps the legacy `team` array into a new `TeamProfile` called "My First Team" and sets it as active.
- **Risk: Missing sprites for very new Pokémon.** PokeAPI sometimes lags behind the newest DLC Pokémon.
  *Mitigation:* Use an `onError` handler on the `<img />` tag to fallback to a generic Pokéball icon if the 404 triggers.