import fs from 'fs';
import path from 'path';
import vm from 'vm';

const RAW_DIR = path.join(process.cwd(), 'scripts', 'raw_data');
const OUT_DIR = path.join(process.cwd(), 'src', 'data');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const loadShowdownFile = (filename) => {
  const filePath = path.join(RAW_DIR, filename);
  const code = fs.readFileSync(filePath, 'utf-8');
  const sandbox = { exports: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  
  // Return the first key exported (e.g. BattlePokedex, BattleMoves, etc.)
  const keys = Object.keys(sandbox.exports);
  return sandbox.exports[keys[0]];
};

const run = () => {
  console.log('Parsing Showdown data...');
  
  const pokedex = loadShowdownFile('pokedex.js');
  const moves = loadShowdownFile('moves.js');
  const items = loadShowdownFile('items.js');
  const abilities = loadShowdownFile('abilities.js');
  const formatsData = loadShowdownFile('formats-data.js'); // For tier checking
  
  // We want to filter out illegal Pokemon (usually those not in Gen 9, or custom stuff).
  // In VGC / Champions, typically standard Pokemon are allowed.
  // We will include everything that exists in formatsData and doesn't have isNonstandard = 'Past' or 'Custom' etc.
  
  const cleanPokedex = {};
  for (const [key, pokemon] of Object.entries(pokedex)) {
    const format = formatsData[key] || {};
    
    // Filter logic: Include if it has a tier or if it's explicitly allowed. 
    // We exclude Custom, CAP, etc.
    if (pokemon.num > 0 && !pokemon.isNonstandard) {
      // It's a standard Pokemon.
      cleanPokedex[key] = {
        name: pokemon.name,
        types: pokemon.types,
        baseStats: pokemon.baseStats,
        abilities: pokemon.abilities,
        weightkg: pokemon.weightkg,
        tier: format.tier || 'Unknown'
      };
    }
  }

  const cleanMoves = {};
  for (const [key, move] of Object.entries(moves)) {
    if (!move.isNonstandard && move.num > 0) {
      cleanMoves[key] = {
        name: move.name,
        type: move.type,
        category: move.category,
        basePower: move.basePower,
        accuracy: move.accuracy,
        priority: move.priority,
        target: move.target
      };
    }
  }
  
  const cleanItems = {};
  for (const [key, item] of Object.entries(items)) {
    if (!item.isNonstandard) {
      cleanItems[key] = {
        name: item.name,
        desc: item.desc || item.shortDesc
      };
    }
  }
  
  const cleanAbilities = {};
  for (const [key, ability] of Object.entries(abilities)) {
    if (!ability.isNonstandard) {
      cleanAbilities[key] = {
        name: ability.name,
        desc: ability.desc || ability.shortDesc
      };
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, 'pokedex.json'), JSON.stringify(cleanPokedex, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'moves.json'), JSON.stringify(cleanMoves, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'items.json'), JSON.stringify(cleanItems, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'abilities.json'), JSON.stringify(cleanAbilities, null, 2));

  console.log(`Extracted:
  - ${Object.keys(cleanPokedex).length} Pokemon
  - ${Object.keys(cleanMoves).length} Moves
  - ${Object.keys(cleanItems).length} Items
  - ${Object.keys(cleanAbilities).length} Abilities
  `);
};

run();