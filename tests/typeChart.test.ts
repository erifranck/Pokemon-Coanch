import { describe, it, expect } from 'vitest';
import { calculateDefensiveMultiplier, TYPE_CHART, TYPES } from '../src/utils/typeChart';

describe('calculateDefensiveMultiplier', () => {
  it('Water vs Fire = 2x (super effective)', () => {
    expect(calculateDefensiveMultiplier('Water', ['Fire'])).toBe(2);
  });

  it('Fire vs Water = 0.5x (not very effective)', () => {
    expect(calculateDefensiveMultiplier('Fire', ['Water'])).toBe(0.5);
  });

  it('Normal vs Ghost = 0 (immune)', () => {
    expect(calculateDefensiveMultiplier('Normal', ['Ghost'])).toBe(0);
  });

  it('Fighting vs Rock/Steel = 4x (double weak)', () => {
    expect(calculateDefensiveMultiplier('Fighting', ['Rock', 'Steel'])).toBe(4);
  });

  it('Bug vs Grass/Poison = 1x (2×0.5 cancels)', () => {
    // Bug ×2 vs Grass, ×0.5 vs Poison → 1
    expect(calculateDefensiveMultiplier('Bug', ['Grass', 'Poison'])).toBe(1);
  });

  it('Fighting vs Normal/Ghost = 0 (one type immune)', () => {
    // Fighting ×2 vs Normal, ×0 vs Ghost → 0
    expect(calculateDefensiveMultiplier('Fighting', ['Normal', 'Ghost'])).toBe(0);
  });

  it('Fire vs Grass/Water = 1x (neutral via canceled weaknesses)', () => {
    // Fire is 2x vs Grass, 0.5x vs Water: 2 * 0.5 = 1
    expect(calculateDefensiveMultiplier('Fire', ['Grass', 'Water'])).toBe(1);
  });

  it('Dragon vs Fairy = 0 (immune)', () => {
    expect(calculateDefensiveMultiplier('Dragon', ['Fairy'])).toBe(0);
  });

  it('Electric vs Ground = 0 (immune)', () => {
    expect(calculateDefensiveMultiplier('Electric', ['Ground'])).toBe(0);
  });

  it('Ground vs Flying = 0 (immune)', () => {
    expect(calculateDefensiveMultiplier('Ground', ['Flying'])).toBe(0);
  });

  it('Steel vs Fairy = 2x', () => {
    expect(calculateDefensiveMultiplier('Steel', ['Fairy'])).toBe(2);
  });

  it('Fairy vs Dragon = 2x', () => {
    expect(calculateDefensiveMultiplier('Fairy', ['Dragon'])).toBe(2);
  });

  it('Dark vs Psychic = 2x', () => {
    expect(calculateDefensiveMultiplier('Dark', ['Psychic'])).toBe(2);
  });

  it('returns 1 for unknown attacking type', () => {
    expect(calculateDefensiveMultiplier('Unknown', ['Normal'])).toBe(1);
  });

  it('TYPES array has 18 entries', () => {
    expect(TYPES).toHaveLength(18);
  });

  it('Ground vs Water = 1x (neutral)', () => {
    expect(calculateDefensiveMultiplier('Ground', ['Water'])).toBe(1);
  });
});

// Official Gen 9 type chart (attacker -> defender). Only non-neutral
// interactions are listed; everything else must resolve to 1.
const OFFICIAL_CHART: Record<string, Record<string, number>> = {
  Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying: { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Fairy: { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 },
};

describe('TYPE_CHART matches the official Gen 9 chart', () => {
  for (const attacker of TYPES) {
    for (const defender of TYPES) {
      const expected = OFFICIAL_CHART[attacker]?.[defender] ?? 1;
      it(`${attacker} vs ${defender} = ${expected}x`, () => {
        expect(calculateDefensiveMultiplier(attacker, [defender])).toBe(expected);
        // Row must not store redundant neutral entries
        const stored = TYPE_CHART[attacker]?.[defender];
        if (stored !== undefined) {
          expect(stored).not.toBe(1);
        }
      });
    }
  }
});
