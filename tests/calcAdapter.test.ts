import { describe, it, expect } from 'vitest';
import {
  calculateBaseStat50,
  calculateFinalStat,
  getNatureModifier,
  NATURES,
} from '../src/utils/calcAdapter';

describe('calculateBaseStat50', () => {
  it('calculates HP correctly for Charizard (base 78)', () => {
    // HP = floor((2*78 + 31) * 50 / 100) + 60
    //    = floor((156 + 31) * 0.5) + 60
    //    = floor(187 * 0.5) + 60
    //    = floor(93.5) + 60
    //    = 93 + 60 = 153
    expect(calculateBaseStat50('hp', 78)).toBe(153);
  });

  it('calculates non-HP stat correctly for Charizard (base 100 spe)', () => {
    // Spe = floor((2*100 + 31) * 50 / 100) + 5
    //     = floor(231 * 0.5) + 5
    //     = floor(115.5) + 5
    //     = 115 + 5 = 120
    expect(calculateBaseStat50('spe', 100)).toBe(120);
  });

  it('calculates non-HP stat correctly for base 130', () => {
    // floor((2*130 + 31) * 0.5) + 5
    // = floor(291 * 0.5) + 5 = floor(145.5) + 5 = 150
    expect(calculateBaseStat50('atk', 130)).toBe(150);
  });
});

describe('getNatureModifier', () => {
  it('Adamant: Atk +1.1, SpA -0.9', () => {
    expect(getNatureModifier('atk', 'Adamant')).toBe(1.1);
    expect(getNatureModifier('spa', 'Adamant')).toBe(0.9);
    expect(getNatureModifier('def', 'Adamant')).toBe(1.0);
  });

  it('Jolly: Spe +1.1, SpA -0.9', () => {
    expect(getNatureModifier('spe', 'Jolly')).toBe(1.1);
    expect(getNatureModifier('spa', 'Jolly')).toBe(0.9);
  });

  it('Serious: all neutral', () => {
    expect(getNatureModifier('atk', 'Serious')).toBe(1.0);
    expect(getNatureModifier('spe', 'Serious')).toBe(1.0);
  });
});

describe('calculateFinalStat', () => {
  it('calculates HP at level 50 with 0 SP and 0 IVs-like math', () => {
    // Charizard base 78 HP + 0 SP = 153
    expect(calculateFinalStat('hp', 78, 0)).toBe(153);
  });

  it('adds 1 SP = +1 to final stat', () => {
    expect(calculateFinalStat('spe', 100, 0)).toBe(120);
    expect(calculateFinalStat('spe', 100, 4)).toBe(124);
  });

  it('applies Jolly nature correctly (Spe ×1.1)', () => {
    // base 100 Spe + 4 SP = 124, ×1.1 = 136.4 → floor = 136
    expect(calculateFinalStat('spe', 100, 4, 1.1)).toBe(136);
  });

  it('applies negative nature correctly (Spe ×0.9)', () => {
    // base 100 Spe + 4 SP = 124, ×0.9 = 111.6 → floor = 111
    expect(calculateFinalStat('spe', 100, 4, 0.9)).toBe(111);
  });

  it('Choice Scarf ×1.5 Spe', () => {
    // base 100 Spe + 4 SP = 124, neutral nature = 124, ×1.5 = 186
    expect(calculateFinalStat('spe', 100, 4, 1.0, 'Choice Scarf')).toBe(186);
  });

  it('Choice Band ×1.5 Atk', () => {
    // base 130 Atk + 0 SP = 150, ×1.5 = 225
    expect(calculateFinalStat('atk', 130, 0, 1.0, 'Choice Band')).toBe(225);
  });

  it('Choice Specs ×1.5 SpA', () => {
    expect(calculateFinalStat('spa', 130, 0, 1.0, 'Choice Specs')).toBe(225);
  });

  it('Eviolite ×1.5 Def', () => {
    expect(calculateFinalStat('def', 100, 0, 1.0, 'Eviolite')).toBe(180);
  });

  it('Eviolite ×1.5 SpD', () => {
    expect(calculateFinalStat('spd', 100, 0, 1.0, 'Eviolite')).toBe(180);
  });

  it('HP is never affected by nature', () => {
    const withNature = calculateFinalStat('hp', 78, 0, 1.1);
    const withoutNature = calculateFinalStat('hp', 78, 0, 1.0);
    expect(withNature).toBe(withoutNature);
  });

  it('Light Ball ×2.0 Atk (Pikachu base 55)', () => {
    // base 55: floor((110+31)×0.5)+5 = floor(70.5)+5 = 75, ×2 = 150
    expect(calculateFinalStat('atk', 55, 0, 1.0, 'Light Ball')).toBe(150);
  });

  it('Thick Club ×2.0 Atk (Marowak base 80)', () => {
    // base 80: floor((160+31)×0.5)+5 = floor(95.5)+5 = 100, ×2 = 200
    expect(calculateFinalStat('atk', 80, 0, 1.0, 'Thick Club')).toBe(200);
  });

  it('item name is case-insensitive', () => {
    const upper = calculateFinalStat('spe', 100, 0, 1.0, 'CHOICE SCARF');
    const lower = calculateFinalStat('spe', 100, 0, 1.0, 'choice scarf');
    expect(upper).toBe(lower);
  });
});

describe('NATURES lookup', () => {
  it('has 17 entries (12 beneficial + 5 neutral)', () => {
    expect(Object.keys(NATURES)).toHaveLength(17);
  });

  it('neutral natures return null effect', () => {
    expect(NATURES['Hardy']).toBeNull();
    expect(NATURES['Serious']).toBeNull();
    expect(NATURES['Docile']).toBeNull();
  });
});
