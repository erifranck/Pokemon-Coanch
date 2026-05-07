import { describe, it, expect } from 'vitest';
import { calculateDefensiveMultiplier, TYPES } from '../src/utils/typeChart';

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
});
