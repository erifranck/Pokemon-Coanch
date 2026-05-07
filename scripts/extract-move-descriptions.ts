/**
 * Extracts move short descriptions from pokemon-showdown Dex API.
 * Run with: npx tsx scripts/extract-move-descriptions.ts
 */
import pkg from 'pokemon-showdown';
const { Dex } = pkg;
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../src/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'move-descriptions.json');

const allMoves = Dex.moves.all();

const descriptions: Record<string, { name: string; shortDesc: string }> = {};

for (const move of allMoves) {
  if (move.shortDesc) {
    descriptions[move.id] = {
      name: move.name,
      shortDesc: move.shortDesc,
    };
  }
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(descriptions, null, 2));
console.log(`Extracted ${Object.keys(descriptions).length} move descriptions to ${OUTPUT_FILE}`);
