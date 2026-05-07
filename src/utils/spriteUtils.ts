/**
 * Converts a Pokémon name to the correct sprite ID for Pokémon Showdown's Gen 5 CDN.
 * Showdown's CDN uses dashes for forms but removes the dash before X/Y in mega forms.
 * 
 * Examples:
 *   "Charizard"         → "charizard"
 *   "Floette-Eternal"   → "floette-eternal"
 *   "Rotom-Wash"        → "rotom-wash"
 *   "Charizard-Mega-X"  → "charizard-megax"
 *   "Meganium-Mega"     → "meganium-mega"
 */
export function getShowdownSpriteId(name: string): string {
  let id = name.toLowerCase();
  // Fix mega X/Y forms: remove dash before X/Y
  id = id.replace(/-mega-x$/, '-megax').replace(/-mega-y$/, '-megay');
  // Fix Paldean forms: Showdown CDN removes dash between paldea and the form suffix
  // "tauros-paldea-aqua" → "tauros-paldeaaqua"
  id = id.replace(/-paldea-(blaze|aqua|combat)$/, '-paldea$1');
  return id;
}

export function getShowdownSpriteUrl(name: string): string {
  return `https://play.pokemonshowdown.com/sprites/gen5/${getShowdownSpriteId(name)}.png`;
}
