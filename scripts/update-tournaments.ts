/**
 * update-tournaments.ts
 *
 * Data source: Limitless TCG API (https://play.limitlesstcg.com/api/)
 * Output: src/data/tournament_data.json
 * Frequency: Weekly or after major tournaments
 *
 * Fetches VGC tournaments in the configured regulation, extracts top 10
 * standings with full team compositions (Pokemon, items, abilities, moves).
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGULATION = 'gen9championsvgc2026regmc';
const LIMITLESS_API = 'https://play.limitlesstcg.com/api';
const OUTPUT_DIR = path.join(__dirname, '../src/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'tournament_data.json');

interface TournamentTeam {
  placement: number;
  player: string;
  members: {
    pokemonId: string;
    name: string;
    item: string;
    ability: string;
    nature: string;
    moves: [string, string, string, string];
  }[];
}

interface TournamentEntry {
  name: string;
  date: string;
  players: number;
  regulation: string;
  topCut: { position: number; player: string; team: string[] }[];
  topPokemon: { id: string; name: string; usagePercent: number }[];
  teams: TournamentTeam[];
}

interface TournamentData {
  generatedAt: string;
  regulation: string;
  dataSources: string[];
  topPokemon: { id: string; name: string; usagePercent: number }[];
  recentTournaments: TournamentEntry[];
}

async function fetchJson(url: string): Promise<any> {
  console.log(`  GET ${url}`);
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

function cleanMoveId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function cleanItemId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function run() {
  console.log('Fetching VGC tournament data from Limitless API...\n');

  // Step 1: Fetch recent VGC tournaments in Reg M-C
  // Note: the Limitless API `format` field lags behind (M-C events are often
  // labelled M-B or CUSTOM), so we filter by tournament name as a fallback.
  console.log('Step 1: Fetching tournament list...');
  let tournaments: any[];
  try {
    tournaments = await fetchJson(
      `${LIMITLESS_API}/tournaments?game=vgc&order=-date&limit=30`,
    );
    tournaments = tournaments.filter((t: any) =>
      (t.name || '').toLowerCase().includes('m-c') ||
      (t.format || '').toUpperCase() === 'M-C'
    ).slice(0, 5);
  } catch (err) {
    console.error(`Failed to fetch tournaments: ${(err as Error).message}`);
    return;
  }

  console.log(`Found ${tournaments.length} VGC Reg M-C tournaments\n`);

  // Step 2: For each tournament, fetch standings with decklists
  const recentTournaments: TournamentEntry[] = [];

  for (const t of tournaments) {
    console.log(`Step 2: Fetching standings for "${t.name}" (${t.players} players)...`);

    let standings: any[];
    try {
      standings = await fetchJson(
        `${LIMITLESS_API}/tournaments/${t.id}/standings?limit=10`,
      );
    } catch (err) {
      console.log(`  Skipping: ${(err as Error).message}`);
      continue;
    }

    const teams: TournamentTeam[] = [];
    const pokemonUsage: Record<string, { name: string; count: number }> = {};

    for (let i = 0; i < Math.min(standings.length, 10); i++) {
      const entry = standings[i];
      if (!entry.decklist || !Array.isArray(entry.decklist)) continue;

      const members = entry.decklist.map((card: any) => {
        const pokemonId = (card.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const moves = (card.attacks || []).slice(0, 4).map(cleanMoveId);
        while (moves.length < 4) moves.push('');

        if (pokemonId) {
          pokemonUsage[pokemonId] = pokemonUsage[pokemonId] || { name: card.name, count: 0 };
          pokemonUsage[pokemonId].count++;
        }

        return {
          pokemonId,
          name: card.name || pokemonId,
          item: card.item || '',
          ability: card.ability || '',
          nature: 'Serious',
          moves: moves as [string, string, string, string],
        };
      });

      teams.push({
        placement: i + 1,
        player: entry.name || `Player ${i + 1}`,
        members,
      });
    }

    const totalEntries = standings.length || 1;
    const topPokemon = Object.entries(pokemonUsage)
      .map(([id, data]) => ({
        id,
        name: data.name,
        usagePercent: Math.round((data.count / totalEntries) * 100),
      }))
      .sort((a, b) => b.usagePercent - a.usagePercent)
      .slice(0, 15);

    recentTournaments.push({
      name: t.name,
      date: t.date ? t.date.slice(0, 10) : '',
      players: t.players || 0,
      regulation: REGULATION,
      topCut: [],
      topPokemon,
      teams,
    });

    console.log(`  Extracted ${teams.length} teams, ${topPokemon.length} top Pokemon`);
  }

  // Step 3: Write output
  const data: TournamentData = {
    generatedAt: new Date().toISOString(),
    regulation: REGULATION,
    dataSources: ['Limitless TCG API (https://play.limitlesstcg.com/api/)'],
    topPokemon: [],
    recentTournaments,
  };

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  console.log(`\nWrote tournament data to ${OUTPUT_FILE}`);
  console.log(`Tournaments: ${recentTournaments.length}`);
  console.log(`Total teams: ${recentTournaments.reduce((s, t) => s + t.teams.length, 0)}`);
  console.log(`Generated at: ${data.generatedAt}`);
}

run().catch(console.error);
