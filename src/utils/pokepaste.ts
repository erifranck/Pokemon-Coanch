import type { TeamCard, StatMap } from '../types/store';
import formatData from '../data/format_data.json';

interface PartialTeamCard {
  pokemonId: string;
  name: string;
  item: string;
  ability: string;
  nature: string;
  teraType: string;
  sps: StatMap;
  moves: [string, string, string, string];
}

/**
 * Parse a PokePaste-formatted string into an array of TeamCard-like objects.
 * Each Pokémon block is separated by blank lines.
 */
export function parsePokePaste(text: string, regulation: string): { cards: PartialTeamCard[], dropped: string[] } {
  const blocks = text.split(/\n\s*\n/).filter(b => b.trim());
  const cards: PartialTeamCard[] = [];
  const dropped: string[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length === 0) continue;

    const pokemon = parsePokemonBlock(lines, regulation);
    if (!pokemon) continue;

    // Check legality
    const format = (formatData as any)[regulation];
    const isLegal = format && format.pokemon[pokemon.pokemonId];
    
    if (!isLegal) {
      dropped.push(pokemon.name || pokemon.pokemonId);
      continue;
    }

    cards.push(pokemon);
  }

  return { cards, dropped };
}

function parsePokemonBlock(lines: string[], regulation: string): PartialTeamCard | null {
  // First line: "Species @ Item" or just "Species"
  let species = '';
  let item = '';
  const firstLine = lines[0];
  const atIndex = firstLine.indexOf(' @ ');
  if (atIndex >= 0) {
    species = firstLine.substring(0, atIndex).trim();
    item = firstLine.substring(atIndex + 3).trim();
  } else {
    species = firstLine.trim();
  }

  if (!species) return null;

  // Resolve pokemonId from species name
  const format = (formatData as any)[regulation];
  let pokemonId = '';
  let displayName = species;
  
  if (format) {
    // Try exact match on species name
    const lowerName = species.toLowerCase();
    for (const [id, def] of Object.entries(format.pokemon) as [string, any][]) {
      if (def.name.toLowerCase() === lowerName) {
        pokemonId = id;
        displayName = def.name;
        break;
      }
    }
    // Try matching by ID directly
    if (!pokemonId) {
      const id = species.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (format.pokemon[id]) {
        pokemonId = id;
        displayName = format.pokemon[id].name;
      }
    }
  }

  if (!pokemonId) {
    // Could not resolve species
    return null;
  }

  let ability = '';
  let nature = 'Serious';
  let teraType = 'Normal';
  const sps: StatMap = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const moves: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Ability line
    if (line.startsWith('Ability: ')) {
      ability = line.substring(9).trim();
    }
    // Tera Type
    else if (line.startsWith('Tera Type: ')) {
      teraType = line.substring(11).trim();
    }
    // EVs line: "EVs: 252 Atk / 4 SpD / 252 Spe"
    else if (line.startsWith('EVs: ')) {
      const evStr = line.substring(5).trim();
      const evParts = evStr.split('/').map(p => p.trim());
      for (const part of evParts) {
        const match = part.match(/(\d+)\s+(\w+)/i);
        if (match) {
          const val = parseInt(match[1]);
          const stat = evToStat(match[2].toLowerCase()) as keyof StatMap | null;
          if (stat && sps[stat] !== undefined) {
            sps[stat] = Math.min(32, Math.round(val / 8));
          }
        }
      }
    }
    // Nature line: "Jolly Nature" or "Timid Nature"
    else if (line.toLowerCase().includes('nature')) {
      const natureMatch = line.match(/^(\w+)\s+Nature/i);
      if (natureMatch) {
        nature = natureMatch[1];
      }
    }
    // Move line: "- Flare Blitz"
    else if (line.startsWith('- ')) {
      const moveName = line.substring(2).trim();
      // Resolve move name to move ID
      let moveId = '';
      if (format && format.moves) {
        const lowerMove = moveName.toLowerCase();
        for (const [id, def] of Object.entries(format.moves) as [string, any][]) {
          if (def.name.toLowerCase() === lowerMove) {
            moveId = id;
            break;
          }
        }
      }
      // Fallback: use the name directly (cleaned)
      if (!moveId) {
        moveId = moveName.toLowerCase().replace(/[^a-z0-9]/g, '');
      }
      moves.push(moveId);
    }
    // IVs line: "IVs: 0 Atk" — we can skip (we use 31 IVs always)
  }

  // Fill missing moves to 4 slots
  while (moves.length < 4) moves.push('');
  const finalMoves = moves.slice(0, 4) as [string, string, string, string];

  return {
    pokemonId,
    name: displayName,
    item,
    ability,
    nature,
    teraType,
    sps,
    moves: finalMoves,
  };
}

function evToStat(ev: string): string | null {
  const map: Record<string, string> = {
    'hp': 'hp', 'atk': 'atk', 'def': 'def', 'attack': 'atk', 'defense': 'def',
    'spa': 'spa', 'spatk': 'spa', 'specialattack': 'spa',
    'spd': 'spd', 'spdef': 'spd', 'specialdefense': 'spd',
    'spe': 'spe', 'speed': 'spe',
  };
  return map[ev] || null;
}

/**
 * Export a team to PokePaste format.
 */
export function exportToPokePaste(team: { members: TeamCard[] }, regulation: string): string {
  const format = (formatData as any)[regulation];
  if (!format) return '';

  const blocks: string[] = [];

  for (const member of team.members) {
    const def = format.pokemon[member.pokemonId];
    if (!def) continue;

    const lines: string[] = [];

    // Species @ Item
    const itemLine = member.item ? `${def.name} @ ${member.item}` : def.name;
    lines.push(itemLine);

    // Ability
    if (member.ability) {
      lines.push(`Ability: ${member.ability}`);
    }

    // Level
    lines.push('Level: 50');

    // Tera Type
    lines.push(`Tera Type: ${member.teraType || def.types[0]}`);

    // EVs (reverse SP → EV)
    const evParts: string[] = [];
    for (const stat of ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const) {
      const sp = member.sps[stat] || 0;
      if (sp > 0) {
        const ev = sp * 8;
        const statLabel = stat === 'spa' ? 'SpA' : stat === 'spd' ? 'SpD' : stat === 'spe' ? 'Spe' : stat.charAt(0).toUpperCase() + stat.slice(1);
        evParts.push(`${ev} ${statLabel}`);
      }
    }
    if (evParts.length > 0) {
      lines.push(`EVs: ${evParts.join(' / ')}`);
    }

    // Nature
    lines.push(`${member.nature} Nature`);

    // IVs (default all 31, skip)
    // lines.push('IVs: 31 HP / 31 Atk / 31 Def / 31 SpA / 31 SpD / 31 Spe');

    // Moves
    for (const moveId of member.moves) {
      if (!moveId) continue;
      const moveDef = format.moves?.[moveId];
      const moveName = moveDef?.name || moveId;
      lines.push(`- ${moveName}`);
    }

    blocks.push(lines.join('\n'));
  }

  return blocks.join('\n\n');
}
