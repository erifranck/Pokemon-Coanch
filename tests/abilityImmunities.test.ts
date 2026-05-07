import { describe, it, expect } from 'vitest';
import { getImmunityTypes, ABILITY_TYPE_IMMUNITIES } from '../src/utils/abilityImmunities';

describe('ABILITY_TYPE_IMMUNITIES', () => {
  it('Levitate grants Ground immunity', () => {
    expect(getImmunityTypes('Levitate')).toEqual(['Ground']);
  });

  it('Water Absorb grants Water immunity', () => {
    expect(getImmunityTypes('Water Absorb')).toEqual(['Water']);
  });

  it('Storm Drain grants Water immunity', () => {
    expect(getImmunityTypes('Storm Drain')).toEqual(['Water']);
  });

  it('Volt Absorb grants Electric immunity', () => {
    expect(getImmunityTypes('Volt Absorb')).toEqual(['Electric']);
  });

  it('Lightning Rod grants Electric immunity', () => {
    expect(getImmunityTypes('Lightning Rod')).toEqual(['Electric']);
  });

  it('Motor Drive grants Electric immunity', () => {
    expect(getImmunityTypes('Motor Drive')).toEqual(['Electric']);
  });

  it('Flash Fire grants Fire immunity', () => {
    expect(getImmunityTypes('Flash Fire')).toEqual(['Fire']);
  });

  it('Sap Sipper grants Grass immunity', () => {
    expect(getImmunityTypes('Sap Sipper')).toEqual(['Grass']);
  });

  it('Dry Skin grants Water immunity', () => {
    expect(getImmunityTypes('Dry Skin')).toEqual(['Water']);
  });

  it('unknown ability returns empty array', () => {
    expect(getImmunityTypes('Blaze')).toEqual([]);
  });

  it('empty string returns empty array', () => {
    expect(getImmunityTypes('')).toEqual([]);
  });

  it('lookup table has exactly 9 entries', () => {
    expect(Object.keys(ABILITY_TYPE_IMMUNITIES)).toHaveLength(9);
  });
});
