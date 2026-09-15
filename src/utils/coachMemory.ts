const MEMORY_KEY = 'poke-coach-sessions';
const MAX_SESSIONS = 50;

export interface CoachSession {
  id: string;
  createdAt: string;
  teamName: string;
  regulation: string;
  summary: string;
  tags: string[];
  appliedCards: { type: string; pokemon: string; action: string }[];
}

export function loadSessions(): CoachSession[] {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CoachSession[];
  } catch {
    return [];
  }
}

export function saveSession(session: CoachSession): void {
  const sessions = loadSessions();
  sessions.unshift(session);

  if (sessions.length > MAX_SESSIONS) {
    sessions.length = MAX_SESSIONS;
  }

  localStorage.setItem(MEMORY_KEY, JSON.stringify(sessions));
}

export function deleteSession(id: string): void {
  const sessions = loadSessions().filter((s) => s.id !== id);
  localStorage.setItem(MEMORY_KEY, JSON.stringify(sessions));
}

export function searchSessions(query: string): CoachSession[] {
  const lower = query.toLowerCase();
  return loadSessions().filter((s) => {
    return (
      s.summary.toLowerCase().includes(lower) ||
      s.tags.some((t) => t.toLowerCase().includes(lower)) ||
      s.teamName.toLowerCase().includes(lower)
    );
  });
}

export function extractTags(summary: string): string[] {
  const tags: string[] = [];

  const pokemonRegex = /\b[A-Z][a-zA-Z]+(?:-Mega-[XY])?\b/g;
  let match;
  while ((match = pokemonRegex.exec(summary)) !== null) {
    tags.push(match[0].toLowerCase());
  }

  const topicKeywords = [
    'rain', 'sun', 'sand', 'hail', 'snow',
    'trick room', 'tailwind', 'hyper offense', 'stall', 'balance',
    'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison',
    'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon',
    'dark', 'steel', 'fairy',
    'weakness', 'coverage', 'synergy', 'core',
  ];

  const lower = summary.toLowerCase();
  for (const kw of topicKeywords) {
    if (lower.includes(kw)) {
      tags.push(kw);
    }
  }

  return [...new Set(tags)];
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}
