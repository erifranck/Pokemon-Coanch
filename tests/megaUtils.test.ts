import { describe, it, expect } from 'vitest';
import { getMegaFormId } from '../src/utils/megaUtils';

describe('getMegaFormId', () => {
  const charizarditeX = {
    name: 'Charizardite X',
    megaStone: { 'Charizard': 'Charizard-Mega-X' },
    megaEvolves: null,
  };
  const charizarditeY = {
    name: 'Charizardite Y',
    megaStone: { 'Charizard': 'Charizard-Mega-Y' },
    megaEvolves: null,
  };
  const abomasite = {
    name: 'Abomasite',
    megaStone: { 'Abomasnow': 'Abomasnow-Mega' },
    megaEvolves: null,
  };
  const choiceScarf = {
    name: 'Choice Scarf',
    megaStone: null,
    megaEvolves: null,
  };
  const charizard = { name: 'Charizard' };
  const abomasnow = { name: 'Abomasnow' };

  it('returns correct mega ID for Charizardite X → Charizard', () => {
    expect(getMegaFormId(charizarditeX, charizard)).toBe('charizardmegax');
  });

  it('returns correct mega ID for Charizardite Y → Charizard', () => {
    expect(getMegaFormId(charizarditeY, charizard)).toBe('charizardmegay');
  });

  it('returns correct mega ID for Abomasite → Abomasnow', () => {
    expect(getMegaFormId(abomasite, abomasnow)).toBe('abomasnowmega');
  });

  it('returns null for non-mega items (Choice Scarf)', () => {
    expect(getMegaFormId(choiceScarf, charizard)).toBeNull();
  });

  it('returns null when Pokemon does not match the stone', () => {
    expect(getMegaFormId(charizarditeX, abomasnow)).toBeNull();
  });

  it('returns null when itemDefObj is null', () => {
    expect(getMegaFormId(null, charizard)).toBeNull();
  });

  it('returns null when basePokemonDef is null', () => {
    expect(getMegaFormId(charizarditeX, null)).toBeNull();
  });
});
