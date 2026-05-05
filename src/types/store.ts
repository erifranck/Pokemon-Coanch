export type StatMap = {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
};

export interface PokemonCard {
  id: string;
  pokemonId: string; // The key from pokedex.json
  name: string;      // Display name
  nature: string;
  item: string;
  ability: string;
  teraType: string;
  sps: StatMap;      // 0 to 32
  moves: [string, string, string, string]; // Keys from moves.json
}

export interface TeamCard extends PokemonCard {
  isTeamMember: true;
}

export interface ThreatCard extends PokemonCard {
  isTeamMember: false;
  threatLevel: 'low' | 'medium' | 'high';
}

export interface TeamProfile {
  id: string;
  name: string;
  regulation: string; // e.g., 'vgc2026regma'
  members: TeamCard[];
}

// Maps a TeamCard ID to an array of ThreatCard IDs that it specifically counters/checks
export type Relationships = Record<string, string[]>;
