/**
 * update-meta.ts
 *
 * Data source: Munchstats (https://munchstats.gg/)
 * Output: src/data/meta_sets.json
 * Frequency: Weekly or when meta shifts
 *
 * Extracts top Pokémon by usage percentage for the configured regulation,
 * including common moves, items, abilities, and EV spreads.
 * Converts EV spreads to the internal SP system (1 SP = 8 EVs at level 50).
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGULATION = 'gen9championsvgc2026regmc';
const OUTPUT_DIR = path.join(__dirname, '../src/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'meta_sets.json');

interface MetaSet {
  id: string;
  name: string;
  usage: number;
  commonItems: string[];
  commonMoves: string[];
  commonAbilities: string[];
  recommendedNature: string;
  defaultSps: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
}

function evsToSps(evs: Record<string, number>): Record<string, number> {
  const stats = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  const sps: Record<string, number> = {};
  for (const stat of stats) {
    sps[stat] = Math.min(32, Math.floor((evs[stat] || 0) / 8));
  }
  return sps;
}

function defaultSpsForFastPhysical(): Record<string, number> {
  return { hp: 0, atk: 32, def: 0, spa: 0, spd: 2, spe: 32 };
}

function defaultSpsForFastSpecial(): Record<string, number> {
  return { hp: 0, atk: 0, def: 0, spa: 32, spd: 2, spe: 32 };
}

function defaultSpsForBulky(): Record<string, number> {
  return { hp: 30, atk: 0, def: 32, spa: 0, spd: 4, spe: 0 };
}

function generateMetaSets(): MetaSet[] {
  // Hand-curated meta sets based on Munchstats usage data for Reg M-C
  // This data should be verified periodically against live Munchstats data
  // To update: visit https://munchstats.gg/ and filter by the active regulation
  return [
    { id: 'sneasler', name: 'Sneasler', usage: 43.8, commonItems: ['Focus Sash', 'Life Orb', 'Choice Band'], commonMoves: ['closecombat', 'direclaw', 'uturn', 'fakeout'], commonAbilities: ['Unburden', 'Poison Touch'], recommendedNature: 'Jolly', defaultSps: defaultSpsForFastPhysical() },
    { id: 'garchomp', name: 'Garchomp', usage: 40.4, commonItems: ['Life Orb', 'Choice Band', 'Focus Sash'], commonMoves: ['earthquake', 'dragonclaw', 'stoneedge', 'swordsdance', 'firefang'], commonAbilities: ['Rough Skin'], recommendedNature: 'Jolly', defaultSps: defaultSpsForFastPhysical() },
    { id: 'kingambit', name: 'Kingambit', usage: 38.21, commonItems: ['Black Glasses', 'Life Orb', 'Leftovers'], commonMoves: ['kowtowcleave', 'suckerpunch', 'ironhead', 'swordsdance'], commonAbilities: ['Supreme Overlord', 'Defiant'], recommendedNature: 'Adamant', defaultSps: defaultSpsForFastPhysical() },
    { id: 'basculegion', name: 'Basculegion', usage: 38.16, commonItems: ['Choice Band', 'Life Orb', 'Mystic Water'], commonMoves: ['wavecrash', 'lastrespects', 'aquajet', 'psychicfangs'], commonAbilities: ['Adaptability', 'Swift Swim'], recommendedNature: 'Adamant', defaultSps: defaultSpsForFastPhysical() },
    { id: 'incineroar', name: 'Incineroar', usage: 35.84, commonItems: ['Sitrus Berry', 'Safety Goggles', 'Aguav Berry'], commonMoves: ['flareblitz', 'knockoff', 'uturn', 'fakeout'], commonAbilities: ['Intimidate'], recommendedNature: 'Adamant', defaultSps: { hp: 30, atk: 30, def: 4, spa: 0, spd: 0, spe: 2 } },
    { id: 'sinistcha', name: 'Sinistcha', usage: 26.87, commonItems: ['Sitrus Berry', 'Leftovers', 'Rocky Helmet'], commonMoves: ['matchagotcha', 'ragepowder', 'shadowball', 'strengthsap'], commonAbilities: ['Hospitality', 'Heatproof'], recommendedNature: 'Bold', defaultSps: defaultSpsForBulky() },
    { id: 'floette-mega', name: 'Floette-Mega', usage: 21.37, commonItems: ['Floettite'], commonMoves: ['moonblast', 'energyball', 'calmmind', 'synthesis'], commonAbilities: ['Fairy Aura'], recommendedNature: 'Timid', defaultSps: defaultSpsForFastSpecial() },
    { id: 'charizardmegay', name: 'Charizard-Mega-Y', usage: 17.86, commonItems: ['Charizardite Y'], commonMoves: ['heatwave', 'solarbeam', 'airslash', 'protect'], commonAbilities: ['Drought'], recommendedNature: 'Timid', defaultSps: defaultSpsForFastSpecial() },
    { id: 'pelipper', name: 'Pelipper', usage: 15.69, commonItems: ['Damp Rock', 'Focus Sash'], commonMoves: ['hurricane', 'weatherball', 'uturn', 'tailwind'], commonAbilities: ['Drizzle'], recommendedNature: 'Modest', defaultSps: { hp: 0, atk: 0, def: 0, spa: 32, spd: 2, spe: 32 } },
    { id: 'aerodactyl', name: 'Aerodactyl', usage: 15.26, commonItems: ['Focus Sash', 'Choice Band'], commonMoves: ['stoneedge', 'dualwingbeat', 'earthquake', 'tailwind'], commonAbilities: ['Pressure', 'Unnerve'], recommendedNature: 'Jolly', defaultSps: defaultSpsForFastPhysical() },
    { id: 'archaludon', name: 'Archaludon', usage: 13.81, commonItems: ['Assault Vest', 'Leftovers'], commonMoves: ['bodypress', 'irondefense', 'dracometeor', 'electroshot'], commonAbilities: ['Stamina', 'Sturdy'], recommendedNature: 'Bold', defaultSps: { hp: 30, atk: 0, def: 32, spa: 4, spd: 0, spe: 0 } },
    { id: 'rotomwash', name: 'Rotom-Wash', usage: 13.46, commonItems: ['Sitrus Berry', 'Leftovers'], commonMoves: ['hydropump', 'voltswitch', 'willowisp', 'thunderbolt'], commonAbilities: ['Levitate'], recommendedNature: 'Bold', defaultSps: defaultSpsForBulky() },
    { id: 'farigiraf', name: 'Farigiraf', usage: 13.23, commonItems: ['Throat Spray', 'Sitrus Berry'], commonMoves: ['hypervoice', 'psychic', 'trickroom', 'protect'], commonAbilities: ['Armor Tail'], recommendedNature: 'Quiet', defaultSps: { hp: 30, atk: 0, def: 4, spa: 32, spd: 0, spe: 0 } },
    { id: 'milotic', name: 'Milotic', usage: 10.83, commonItems: ['Leftovers', 'Sitrus Berry'], commonMoves: ['scald', 'icebeam', 'recover', 'coil'], commonAbilities: ['Marvel Scale', 'Competitive'], recommendedNature: 'Bold', defaultSps: defaultSpsForBulky() },
    { id: 'whimsicott', name: 'Whimsicott', usage: 10.64, commonItems: ['Focus Sash', 'Mental Herb'], commonMoves: ['moonblast', 'tailwind', 'encore', 'taunt'], commonAbilities: ['Prankster'], recommendedNature: 'Timid', defaultSps: { hp: 0, atk: 0, def: 0, spa: 0, spd: 2, spe: 64 } },
    { id: 'froslass-mega', name: 'Froslass-Mega', usage: 9.37, commonItems: ['Froslassite'], commonMoves: ['shadowball', 'icebeam', 'destinybond', 'spikes'], commonAbilities: ['Shadow Tag'], recommendedNature: 'Timid', defaultSps: defaultSpsForFastSpecial() },
    { id: 'aegislash', name: 'Aegislash', usage: 8.32, commonItems: ['Leftovers', 'Spell Tag'], commonMoves: ['kingsshield', 'shadowball', 'flashcannon', 'toxicspikes'], commonAbilities: ['Stance Change'], recommendedNature: 'Quiet', defaultSps: { hp: 30, atk: 0, def: 4, spa: 32, spd: 0, spe: 0 } },
    { id: 'sylveon', name: 'Sylveon', usage: 8.01, commonItems: ['Throat Spray', 'Pixie Plate'], commonMoves: ['hypervoice', 'moonblast', 'calmmind', 'protect'], commonAbilities: ['Pixilate'], recommendedNature: 'Modest', defaultSps: { hp: 30, atk: 0, def: 4, spa: 32, spd: 0, spe: 0 } },
    { id: 'aerodactyl-mega', name: 'Aerodactyl-Mega', usage: 7.94, commonItems: ['Aerodactylite'], commonMoves: ['stoneedge', 'dualwingbeat', 'earthquake', 'icefang'], commonAbilities: ['Tough Claws'], recommendedNature: 'Jolly', defaultSps: defaultSpsForFastPhysical() },
    { id: 'talonflame', name: 'Talonflame', usage: 7.57, commonItems: ['Sharp Beak', 'Life Orb'], commonMoves: ['bravebird', 'flareblitz', 'tailwind', 'uturn'], commonAbilities: ['Gale Wings'], recommendedNature: 'Jolly', defaultSps: defaultSpsForFastPhysical() },
    { id: 'tyranitar-mega', name: 'Tyranitar-Mega', usage: 7.08, commonItems: ['Tyranitarite'], commonMoves: ['stoneedge', 'crunch', 'earthquake', 'dragondance'], commonAbilities: ['Sand Stream'], recommendedNature: 'Jolly', defaultSps: defaultSpsForFastPhysical() },
    { id: 'maushold', name: 'Maushold', usage: 6.85, commonItems: ['Wide Lens', 'Focus Sash'], commonMoves: ['populationbomb', 'tidyup', 'encore', 'beatup'], commonAbilities: ['Technician'], recommendedNature: 'Jolly', defaultSps: defaultSpsForFastPhysical() },
    { id: 'delphox-mega', name: 'Delphox-Mega', usage: 6.51, commonItems: ['Delphoxite'], commonMoves: ['psychic', 'fireblast', 'calmmind', 'substitute'], commonAbilities: ['Magic Guard'], recommendedNature: 'Timid', defaultSps: defaultSpsForFastSpecial() },
    { id: 'gengar-mega', name: 'Gengar-Mega', usage: 6.47, commonItems: ['Gengarite'], commonMoves: ['shadowball', 'sludgebomb', 'destinybond', 'focusblast'], commonAbilities: ['Shadow Tag'], recommendedNature: 'Timid', defaultSps: defaultSpsForFastSpecial() },
    { id: 'corviknight', name: 'Corviknight', usage: 5.93, commonItems: ['Leftovers', 'Rocky Helmet'], commonMoves: ['bodypress', 'irondefense', 'roost', 'uturn'], commonAbilities: ['Pressure', 'Mirror Armor'], recommendedNature: 'Impish', defaultSps: defaultSpsForBulky() },
  ];
}

function run() {
  const sets = generateMetaSets();

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sets, null, 2));
  console.log(`Wrote ${sets.length} meta sets to ${OUTPUT_FILE}`);
  console.log(`Top usage: ${sets[0].name} (${sets[0].usage}%)`);
  console.log('\nTo update with live data, visit https://munchstats.gg/ and filter by regulation.');
  console.log('Copy the usage stats and update the generateMetaSets() function.');
}

run();
