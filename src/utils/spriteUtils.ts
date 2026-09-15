/**
 * Converts a Pokémon name to the correct sprite ID for Pokémon Showdown's Gen 5 CDN.
 * Showdown's CDN uses dashes for forms but removes dashes from base names.
 * 
 * Examples:
 *   "Charizard"          → "charizard"
 *   "Floette-Eternal"    → "floette-eternal"
 *   "Rotom-Wash"         → "rotom-wash"
 *   "Charizard-Mega-X"   → "charizard-megax"
 *   "Meganium-Mega"      → "meganium-mega"
 *   "Kommo-o"            → "kommoo"
 *   "Ho-Oh"              → "hooh"
 *   "Type: Null"         → "typenull"
 */
export function getShowdownSpriteId(name: string): string {
  let id = name.toLowerCase();
  // Fix mega X/Y forms: remove dash before X/Y
  id = id.replace(/-mega-x$/, '-megax').replace(/-mega-y$/, '-megay');
  // Fix Paldean forms: Showdown CDN removes dash between paldea and the form suffix
  id = id.replace(/-paldea-(blaze|aqua|combat)$/, '-paldea$1');
  // Strip dashes from base names (Kommo-o → kommoo, Ho-Oh → hooh)
  // but keep them for known form suffixes
  const formSuffixes = [
    'wash', 'heat', 'mow', 'fan', 'frost',
    'eternal', 'hearthflame', 'wellspring', 'cornerstone',
    'megax', 'megay', 'mega', 'paldeaaqua', 'paldeablaze', 'paldeacombat',
    'blade', 'shield', 'star', 'dusk', 'dawn', 'sun', 'moon',
  ];
  const lastDash = id.lastIndexOf('-');
  if (lastDash >= 0) {
    const suffix = id.slice(lastDash + 1);
    if (!formSuffixes.includes(suffix)) {
      id = id.replace(/-/g, '');
    }
  }
  // Strip special characters: spaces, colons, periods
  // "Type: Null" → "typenull", "Mr. Mime" → "mrmime"
  id = id.replace(/[:\s.']/g, '');
  // Strip accents: "Flabébé" → "flabebe"
  id = id.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Gender symbols: ♀ → f, ♂ → m
  id = id.replace('♀', 'f').replace('♂', 'm');
  return id;
}

export function getShowdownSpriteUrl(name: string): string {
  return `https://play.pokemonshowdown.com/sprites/gen5/${getShowdownSpriteId(name)}.png`;
}
