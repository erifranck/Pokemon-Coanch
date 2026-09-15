/**
 * Netlify Function: AI Coach
 *
 * POST /.netlify/functions/coach
 *
 * Receives user query + team context, builds a grounded system prompt
 * from format data, calls the selected LLM provider, validates response,
 * returns parsed cards for the frontend to render.
 *
 * Supported providers: deepseek, openai, claude, gemini
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

interface CoachRequest {
  query: string;
  team: TeamMember[];
  threats: ThreatMember[];
  enemyTeams?: EnemyTeamData[];
  regulation: string;
  apiKey: string;
  provider: 'deepseek' | 'openai' | 'claude' | 'gemini';
  model: string;
  memory?: {
    previousSessionIds: string[];
    summaries: string[];
  };
  dryRun?: boolean;
}

interface TeamMember {
  id: string;
  pokemonId: string;
  name: string;
  nature: string;
  item: string;
  ability: string;
  teraType: string;
  sps: Record<string, number>;
  moves: [string, string, string, string];
  isTeamMember: true;
}

interface ThreatMember {
  id: string;
  pokemonId: string;
  name: string;
  nature: string;
  item: string;
  ability: string;
  teraType: string;
  sps: Record<string, number>;
  moves: [string, string, string, string];
  threatLevel: 'low' | 'medium' | 'high';
}

interface EnemyTeamData {
  id: string;
  name: string;
  tournamentName: string;
  placement: number;
  patternFlags: string[];
  threatScore?: number;
  members: TeamMember[];
}

interface ParsedCard {
  type: 'threat' | 'set' | 'swap' | 'import';
  validated: boolean;
  validationError?: string;
  data: Record<string, unknown>;
}

interface CoachResponse {
  text: string;
  cards: ParsedCard[];
  validationErrors: string[];
}

// Load bundled data files
let _formatDataCache: Record<string, unknown> | null = null;
let _metaSetsCache: Record<string, unknown>[] | null = null;
let _tournamentCache: Record<string, unknown> | null = null;

function loadFormatData(): Record<string, unknown> {
  if (_formatDataCache) return _formatDataCache;
  const filePath = path.resolve(__dirname, '../../src/data/format_data.json');
  _formatDataCache = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return _formatDataCache!;
}

function loadMetaSets(): Record<string, unknown>[] {
  if (_metaSetsCache) return _metaSetsCache;
  const filePath = path.resolve(__dirname, '../../src/data/meta_sets.json');
  _metaSetsCache = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return _metaSetsCache!;
}

function loadTournamentData(): Record<string, unknown> | null {
  if (_tournamentCache !== null) return _tournamentCache;
  const filePath = path.resolve(__dirname, '../../src/data/tournament_data.json');
  try {
    _tournamentCache = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    _tournamentCache = null;
  }
  return _tournamentCache;
}

function buildWallSection(fmt: Record<string, unknown>): string {
  const pokemon = (fmt as any).pokemon as Record<string, any>;
  const items = (fmt as any).items as Record<string, any>;
  const pokemonIds = Object.keys(pokemon);
  const itemIds = Object.keys(items);

  let wall = '═══ POKÉMON LEGALES — SOLO ESTOS EXISTEN EN ESTA REGULACIÓN ═══\n\n';
  wall += `Total: ${pokemonIds.length} Pokémon\n\n`;

  for (const id of pokemonIds) {
    const p = pokemon[id];
    const types = (p.types || []).join('/');
    const stats = `${p.baseStats?.hp}/${p.baseStats?.atk}/${p.baseStats?.def}/${p.baseStats?.spa}/${p.baseStats?.spd}/${p.baseStats?.spe}`;
    const abilities = Object.values(p.abilities || {}).join(', ');
    wall += `${p.name} [${types}] ${stats} | Ab: ${abilities}\n`;
  }

  wall += '\n═══ ITEMS LEGALES — SOLO ESTOS ═══\n\n';
  wall += itemIds.join(', ');
  wall += '\n';

  return wall;
}

function buildRealitySection(metaSets: Record<string, unknown>[]): string {
  let reality = '═══ META ACTUAL — LO QUE LA GENTE USA (datos reales) ═══\n\n';

  for (const set of metaSets.slice(0, 25)) {
    const sps = (set as any).defaultSps || {};
    reality += `${set.name} (${set.usage}%): `;
    reality += `Items: ${(set as any).commonItems?.slice(0, 3).join('/')}, `;
    reality += `Moves: ${(set as any).commonMoves?.slice(0, 4).map((m: string) => m.charAt(0).toUpperCase() + m.slice(1)).join('/')}, `;
    reality += `Ab: ${(set as any).commonAbilities?.join('/')}, `;
    reality += `${set.recommendedNature}, `;
    reality += `SP: ${sps.hp}/${sps.atk}/${sps.def}/${sps.spa}/${sps.spd}/${sps.spe}\n`;
  }

  return reality;
}

function buildContextSection(
  team: TeamMember[],
  threats: ThreatMember[],
  enemyTeams: EnemyTeamData[],
  tournamentData: Record<string, unknown> | null,
): string {
  let context = '═══ TU EQUIPO ═══\n\n';

  for (let i = 0; i < team.length; i++) {
    const m = team[i];
    context += `${i + 1}. ${m.name} (${m.pokemonId}) `;
    context += `Item: ${m.item}, Ab: ${m.ability}, Nature: ${m.nature}, Tera: ${m.teraType}\n`;
    context += `   Moves: ${m.moves.join(', ')}\n`;
    const sps = m.sps;
    context += `   SP: ${sps.hp}/${sps.atk}/${sps.def}/${sps.spa}/${sps.spd}/${sps.spe}\n`;
  }

  context += '\n═══ TUS AMENAZAS REGISTRADAS ═══\n\n';

  if (threats.length === 0) {
    context += '(No tienes amenazas registradas)\n';
  } else {
    for (const t of threats) {
      context += `• ${t.name} [${t.threatLevel}] — `;
      context += `Item: ${t.item}, Moves: ${t.moves.join(', ')}\n`;
    }
  }

  if (enemyTeams && enemyTeams.length > 0) {
    context += '\n═══ EQUIPOS ENEMIGOS REGISTRADOS ═══\n\n';
    for (const et of enemyTeams) {
      context += `• ${et.name}`;
      if (et.tournamentName) context += ` (${et.tournamentName} #${et.placement})`;
      if (et.patternFlags?.length > 0) context += ` [${et.patternFlags.join(', ')}]`;
      if (et.threatScore !== undefined) context += ` — Threat: ${et.threatScore}%`;
      context += '\n';
      context += `  Members: ${et.members.map((m) => m.name).join(', ') || '(none)'}\n`;
    }
  }

  if (tournamentData && (tournamentData as any).recentTournaments?.length > 0) {
    context += '\n═══ DATOS DE TORNEOS RECIENTES ═══\n\n';
    const tournaments = (tournamentData as any).recentTournaments;
    for (const t of tournaments.slice(0, 3)) {
      context += `• ${t.name} (${t.date}), ${t.players} jugadores\n`;
    }
  }

  return context;
}

function buildRulesSection(): string {
  return `═══ REGLAS ABSOLUTAS ═══

1. SOLO puedes sugerir Pokémon de la lista LEGAL POKÉMON proporcionada arriba.
   Lo que NO está en esa lista → NO EXISTE en este universo.

2. SOLO puedes sugerir items de la lista LEGAL ITEMS.

3. Los stats base SON FIJOS e INMUTABLES. No inventes ni modifiques valores.

4. SP máximo por stat: 32. SP máximo total: 66.

5. Las naturalezas válidas son: Hardy, Lonely, Adamant, Naughty, Brave,
   Bold, Impish, Lax, Relaxed, Modest, Mild, Rash, Quiet, Calm, Gentle,
   Careful, Sassy, Timid, Hasty, Jolly, Naive, Serious.

6. Cada Pokémon solo puede usar movimientos LEGALES en esta regulación.

7. Los Pokémon Mega son entidades SEPARADAS (ej: charizardmegay).

8. Si no tienes datos reales para respaldar una afirmación, admítelo.
   No inventes estadísticas ni usage percentages.

9. NO uses datos de otras generaciones o regulaciones. SOLO Reg M-C.

10. NO puedes sugerir cambiar la regulación. Trabajas exclusivamente
    con la regulación activa del equipo del usuario.

11. ITEM CLAUSE: NO puede haber dos Pokémon con el mismo objeto en un equipo.
    Antes de sugerir un set, revisa si ese item ya lo usa otro miembro.
    Los Mega Stones son la excepción — cada Pokémon Mega usa su propia piedra.`;
}

function buildAnalysisFramework(): string {
  return `═══ MARCO DE ANÁLISIS ═══

Al auditar un equipo, evalúa:

1. COBERTURA DEFENSIVA: ¿El equipo comparte debilidades a tipos comunes?
2. COBERTURA OFENSIVA: ¿Puede golpear super-efectivo a los tipos del meta?
3. MATCHUP CONTRA META: ¿Cómo le va contra los top 10 del meta?
4. SINERGIA DE ROLES: ¿Hay speed control, redirection, intimidate?
5. CONSISTENCIA: ¿Depende de condiciones frágiles (Trick Room, weather)?
6. AMENAZAS NO REGISTRADAS: ¿Faltan amenazas importantes en la threat matrix?`;
}

function buildCoachingStyleSection(): string {
  return `═══ ESTILO DE COACHING ═══

Eres un COACH, no una enciclopedia. Tu trabajo es:

1. CUESTIONAR — si mis decisiones son cuestionables, dilo directamente:
   "Llevar X lead contra Y es un error porque Z..."

2. PENSAR ESCENARIOS — analiza jugadas alternativas:
   "Si en vez de hacer X hacías Y, el resultado era distinto porque..."

3. RECONSTRUIR — si describo parte de un equipo enemigo, sugiere qué otros
   Pokémon completarían la estrategia basándote en patrones del meta:
   "Por lo que describes, esto suena a un core de [tipo]. Los Pokémon que
   suelen acompañar esto son... ¿tenía algo como X o Y?"

4. ANALIZAR LÍNEAS DE JUEGO — no solo el lead, sino el turno 1 y 2:
   "Si empiezas con X vs su lead Y, en turno 1 probablemente hará Z.
   Tu respuesta debería ser..."

5. SER CRÍTICO — no me des la razón si mi análisis es incorrecto.
   "Entiendo tu razonamiento, pero hay un problema: ..."

6. PENSAR COMO JUGADOR — asume que el rival es competente y buscará
   castigar tus debilidades. Anticipa sus jugadas.

Ejemplo de buen diálogo:
"Veo que llevaste Whimsicott + Kleavor. Contra Volcarona + Weavile, ese
lead es problemático: Weavile amenaza OHKO a ambos con Triple Axel/Ice
Spinner, y tu Fake Out no los para porque Weavile es más rápido. Si
hubieras llevado Basculegion + Kleavor, podías amenazar OHKO a Volcarona
con Wave Crash ignorando el Sash por Aqua Jet, y Kleavor presionaba con
su speed tier..."

El usuario quiere UN COACH, no un reporte. Dialoga, discute, cuestiona.`;
}

function buildCardFormatSection(): string {
  return `═══ FORMATO DE RESPUESTA ═══

Cuando hagas una sugerencia ACCIONABLE, usa bloques [CARD] que la UI
convertirá en botones interactivos.

Tipos de CARD:

[CARD:threat]
pokemon: <id del pokemon>
name: <nombre>
reason: <por qué es relevante, torneo, usage%>
moves: <move1>, <move2>, <move3>, <move4>
item: <item>
ability: <ability>
nature: <nature>
sps: <hp>/<atk>/<def>/<spa>/<spd>/<spe>
[/CARD]

[CARD:set]
target: <pokemonId del miembro actual del equipo>
moves: <move1>, <move2>, <move3>, <move4>
item: <item>
ability: <ability>
nature: <nature>
sps: <hp>/<atk>/<def>/<spa>/<spd>/<spe>
reason: <explicación>
[/CARD]

[CARD:swap]
remove: <pokemonId del miembro a remover>
add: <id del pokemon a agregar>
name: <nombre del nuevo>
moves: <move1>, <move2>, <move3>, <move4>
item: <item>
ability: <ability>
nature: <nature>
sps: <hp>/<atk>/<def>/<spa>/<spd>/<spe>
reason: <explicación>
[/CARD]

[CARD:import]
name: <nombre del equipo>
members:
  - <pokemonId1>, <item1>, <ability1>, <nature1>, <sps1>, <move1>/<move2>/<move3>/<move4>
  - <pokemonId2>, ...
reason: <explicación>
[/CARD]

Haz las sugerencias CONCISAS. Los datos DEBEN provenir de las listas
proporcionadas arriba. NO INVENTES.`;
}

function buildSystemPrompt(
  fmt: Record<string, unknown>,
  metaSets: Record<string, unknown>[],
  team: TeamMember[],
  threats: ThreatMember[],
  enemyTeams: EnemyTeamData[],
  tournamentData: Record<string, unknown> | null,
  memory?: { summaries: string[] },
): string {
  const parts = [
    `Eres un coach competitivo de VGC. Tu trabajo es analizar, cuestionar y mejorar equipos Pokémon Champions (Reg M-C).`,
    `Eres crítico, directo y estratégico. No eres un resumen de datos — eres un entrenador que debate jugadas.`,
    `TRABAJAS EXCLUSIVAMENTE CON LOS DATOS PROPORCIONADOS. NO USES CONOCIMIENTO GENERAL.`,
    '',
    buildWallSection(fmt),
    buildRealitySection(metaSets),
    buildContextSection(team, threats, enemyTeams, tournamentData),
  ];

  if (memory?.summaries?.length) {
    parts.push('═══ SESIONES ANTERIORES RELEVANTES ═══');
    for (const summary of memory.summaries) {
      parts.push(`- ${summary}`);
    }
  }

  parts.push(buildRulesSection());
  parts.push(buildCoachingStyleSection());
  parts.push(buildAnalysisFramework());
  parts.push(buildCardFormatSection());

  return parts.join('\n');
}

function parseCards(text: string): { type: string; data: Record<string, string> }[] {
  const cards: { type: string; data: Record<string, string> }[] = [];
  const cardRegex = /\[CARD:(\w+)\]([\s\S]*?)\[\/CARD\]/gi;
  let match;

  while ((match = cardRegex.exec(text)) !== null) {
    const type = match[1].toLowerCase();
    const body = match[2];
    const data: Record<string, string> = {};

    for (const line of body.trim().split('\n')) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.substring(0, colonIdx).trim().toLowerCase();
        const value = line.substring(colonIdx + 1).trim();
        data[key] = value;
      }
    }

    if (Object.keys(data).length > 0) {
      cards.push({ type, data });
    }
  }

  return cards;
}

function validateCard(
  card: { type: string; data: Record<string, string> },
  fmt: Record<string, unknown>,
): { valid: boolean; error?: string } {
  const pokemon = (fmt as any).pokemon as Record<string, any>;
  const items = (fmt as any).items as Record<string, any>;

  if (card.type === 'threat' || card.type === 'swap') {
    const pokemonId = card.data.pokemon || card.data.add;
    if (!pokemonId) return { valid: false, error: 'Missing pokemon id' };
    if (!pokemon[pokemonId]) return { valid: false, error: `${pokemonId} not in regulation` };
  }

  if (card.type === 'set') {
    const target = card.data.target;
    if (!target) return { valid: false, error: 'Missing target pokemon id' };
  }

  if (card.type === 'import') {
    const members = card.data.members;
    if (!members) return { valid: false, error: 'Missing team members' };
  }

  if (card.data.item) {
    const itemId = card.data.item.trim();
    if (!items[itemId]) {
      return { valid: false, error: `Item "${itemId}" not in regulation` };
    }
  }

  if (card.data.sps) {
    const parts = card.data.sps.split('/').map(Number);
    const labels = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
    let total = 0;
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] > 32) return { valid: false, error: `SP ${labels[i]}=${parts[i]} exceeds 32` };
      total += parts[i];
    }
    if (total > 66) return { valid: false, error: `SP total=${total} exceeds 66` };
  }

  return { valid: true };
}

function stripCardsFromText(text: string): string {
  return text.replace(/\[CARD:\w+\][\s\S]*?\[\/CARD\]/gi, '').trim();
}

async function callLLM(
  provider: string,
  model: string,
  apiKey: string,
  systemPrompt: string,
  userQuery: string,
): Promise<string> {
  if (provider === 'claude') {
    const anthropic = new Anthropic({ apiKey, timeout: 120000, maxRetries: 0 });
    const msg = await anthropic.messages.create({
      model,
      max_tokens: 8192,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{ role: 'user', content: userQuery }],
    });
    const block = msg.content.find((b) => b.type === 'text');
    if (!block || block.type !== 'text') throw new Error('Claude returned empty response');
    return block.text;
  }

  const baseURLs: Record<string, string> = {
    openai: 'https://api.openai.com/v1',
    deepseek: 'https://api.deepseek.com',
    gemini: 'https://generativelanguage.googleapis.com/v1beta/openai',
  };

  const client = new OpenAI({
    baseURL: baseURLs[provider] || baseURLs.deepseek,
    apiKey,
    timeout: 120000,
    maxRetries: 0,
  });

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuery },
    ],
    temperature: 0.3,
    max_tokens: 8192,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error(`${provider} returned empty response`);
  }

  return content;
}

export const handler: Handler = async (event: HandlerEvent) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let body: CoachRequest;

  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { query, team, threats, enemyTeams, regulation, apiKey, provider, model, memory, dryRun } = body;

  if (!apiKey && !dryRun) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'API key is required' }) };
  }

  const formatData = loadFormatData();
  const fmt = (formatData as Record<string, unknown>)[regulation];

  if (!fmt) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: `Unknown regulation: ${regulation}` }),
    };
  }

  const metaSets = loadMetaSets();
  const tournamentData = loadTournamentData();

  const systemPrompt = buildSystemPrompt(
    fmt as Record<string, unknown>,
    metaSets,
    team || [],
    threats || [],
    (enemyTeams as EnemyTeamData[]) || [],
    tournamentData,
    memory ? { summaries: memory.summaries || [] } : undefined,
  );

  let aiText: string;

  if (dryRun) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ prompt: systemPrompt, query: query || '', model, provider }),
    };
  }

  try {
    aiText = await callLLM(provider || 'deepseek', model || 'deepseek-chat', apiKey, systemPrompt, query || 'Audita mi equipo actual.');
  } catch (err: unknown) {
    const e = err as any;
    console.error('LLM Error:', JSON.stringify({ 
      status: e?.status, 
      statusCode: e?.statusCode, 
      message: e?.message, 
      error: e?.error, 
      code: e?.code, 
      type: e?.type,
      name: e?.name 
    }));
    const msg = e?.message || e?.error?.message || String(err);
    const status = e?.status || e?.statusCode || e?.error?.status || 500;

    if (status === 401 || msg.includes('401') || msg.includes('unauthorized') || msg.includes('Incorrect API key') || msg.includes('invalid x-api-key')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'API key inválida o sin crédito.' }),
      };
    }

    if (status === 429 || msg.includes('429') || msg.includes('rate') || msg.includes('Rate limit')) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ error: 'Rate limit reached. Try again shortly.' }),
      };
    }

    if (status === 404 || msg.includes('not found') || msg.includes('does not exist') || msg.includes('model')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Model not found: ${msg}` }),
      };
    }

    if (msg.includes('timeout') || msg.includes('timed out')) {
      return {
        statusCode: 504,
        headers,
        body: JSON.stringify({ error: 'AI request timed out. Try again.' }),
      };
    }

    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: `${provider || 'AI'} request failed (${status}): ${msg}` }),
    };
  }

  const rawCards = parseCards(aiText);
  const validatedCards: ParsedCard[] = [];
  const validationErrors: string[] = [];

  for (const card of rawCards) {
    const result = validateCard(card, fmt as Record<string, unknown>);
    validatedCards.push({
      type: card.type as ParsedCard['type'],
      validated: result.valid,
      validationError: result.error,
      data: card.data as Record<string, unknown>,
    });
    if (!result.valid) {
      validationErrors.push(`[${card.type}] ${result.error}`);
    }
  }

  const cleanText = stripCardsFromText(aiText);

  const response: CoachResponse = {
    text: cleanText,
    cards: validatedCards,
    validationErrors,
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(response),
  };
};
