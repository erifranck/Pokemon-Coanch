/**
 * Static lookup of abilities that grant type immunities.
 * When the "Consider Abilities" toggle is active in Type Synergy,
 * these overrides are applied to the defensive multiplier calculation.
 * 
 * Only covers VGC-relevant, unconditional immunities.
 * Abilities with conditional immunities (e.g., Wonder Guard) are excluded.
 */

export const ABILITY_TYPE_IMMUNITIES: Record<string, string[]> = {
  'Levitate': ['Ground'],
  'Water Absorb': ['Water'],
  'Storm Drain': ['Water'],
  'Dry Skin': ['Water'],
  'Volt Absorb': ['Electric'],
  'Lightning Rod': ['Electric'],
  'Motor Drive': ['Electric'],
  'Flash Fire': ['Fire'],
  'Sap Sipper': ['Grass'],
};

/**
 * Returns an array of types against which the given ability grants immunity.
 * Returns an empty array if the ability doesn't grant any immunities.
 */
export function getImmunityTypes(abilityName: string): string[] {
  return ABILITY_TYPE_IMMUNITIES[abilityName] || [];
}
